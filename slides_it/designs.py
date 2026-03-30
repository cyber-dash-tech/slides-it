from __future__ import annotations

import json
import pathlib
import shutil
import tempfile
import urllib.request
import zipfile
from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

CONFIG_DIR = pathlib.Path.home() / ".config" / "slides-it"
DESIGNS_DIR = CONFIG_DIR / "designs"
CONFIG_FILE = CONFIG_DIR / "config.json"

# Built-in designs shipped with the package — used only as seed source.
# At runtime all designs live in DESIGNS_DIR (~/.config/slides-it/designs/).
_SEED_DIR = pathlib.Path(__file__).parent / "designs"

DEFAULT_DESIGN = "default"


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass
class DesignInfo:
    name: str
    description: str
    author: str
    version: str


# ---------------------------------------------------------------------------
# DesignManager
# ---------------------------------------------------------------------------

class DesignManager:
    """Manage slides-it designs stored in ~/.config/slides-it/designs/."""

    def __init__(self) -> None:
        DESIGNS_DIR.mkdir(parents=True, exist_ok=True)
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        self._migrate_legacy_templates_dir()
        self._seed_builtin_designs()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def list(self) -> list[DesignInfo]:
        """Return all installed designs sorted by name."""
        results: list[DesignInfo] = []
        if not DESIGNS_DIR.exists():
            return results
        for path in sorted(DESIGNS_DIR.iterdir()):
            if path.is_dir() and (path / "TEMPLATE.md").exists():
                info = self._parse_design_md(path / "TEMPLATE.md")
                if info:
                    results.append(info)
        return results

    def install(self, source: str, name: str | None = None) -> str:
        """
        Install a design from any source.

        Args:
            source: Registry name, https:// URL (zip), github:user/repo, or local path.
            name: Override the design name. Defaults to name from TEMPLATE.md.

        Returns:
            Installed design name.
        """
        if source.startswith("https://") or source.startswith("http://"):
            return self._install_from_url(source, name)
        if source.startswith("github:"):
            repo = source[len("github:"):]
            url = f"https://github.com/{repo}/archive/refs/heads/main.zip"
            return self._install_from_url(url, name)
        if source.startswith("./") or source.startswith("/") or pathlib.Path(source).exists():
            return self._install_from_path(pathlib.Path(source), name)
        # Fall back to registry lookup
        return self._install_from_registry(source)

    def remove(self, name: str) -> None:
        """
        Remove an installed design.

        Raises:
            ValueError: If design is not installed.
        """
        target = DESIGNS_DIR / name
        if not target.exists():
            raise ValueError(f"Design '{name}' is not installed")
        shutil.rmtree(target)
        # Reset active design if it was the removed one
        if self.active() == name:
            self.activate(DEFAULT_DESIGN)

    def activate(self, name: str) -> None:
        """
        Set the active design.

        Raises:
            ValueError: If design is not installed.
        """
        if not self._design_path(name):
            raise ValueError(f"Design '{name}' is not installed")
        config = self._load_config()
        config["activeDesign"] = name
        self._save_config(config)

    def active(self) -> str:
        """Return the name of the currently active design."""
        cfg = self._load_config()
        # Primary key: activeDesign. Fallback: legacy activeTemplate key.
        return cfg.get("activeDesign") or cfg.get("activeTemplate") or DEFAULT_DESIGN

    def get_model(self) -> str:
        """Return the currently active model ID (empty string if not set)."""
        return self._load_config().get("modelID", "")

    def set_model(self, model_id: str) -> None:
        """Persist the active model ID to config."""
        config = self._load_config()
        config["modelID"] = model_id
        self._save_config(config)

    def get_settings(self) -> dict[str, str]:
        """Return provider settings from slides-it config (legacy, baseURL/customModel only)."""
        cfg = self._load_config()
        return {
            "providerID":  cfg.get("providerID", ""),
            "baseURL":     cfg.get("baseURL", ""),
            "customModel": cfg.get("customModel", ""),
        }

    def save_settings(
        self,
        provider_id: str,
        base_url: str,
        custom_model: str,
    ) -> None:
        """
        Persist non-secret provider settings to slides-it config.

        API key is no longer stored here — it lives in opencode.jsonc only.

        Args:
            provider_id:  e.g. "anthropic", "openai", "custom"
            base_url:     OpenAI-compatible base URL (may be empty)
            custom_model: model ID to register for custom providers (may be empty)
        """
        cfg = self._load_config()
        cfg["providerID"]  = provider_id
        cfg["baseURL"]     = base_url
        cfg["customModel"] = custom_model
        # Remove legacy apiKey if present
        cfg.pop("apiKey", None)
        self._save_config(cfg)

    def get_skill_md(self, name: str | None = None) -> str:
        """
        Read and return the SKILL.md content for a design.

        Args:
            name: Design name. Defaults to the active design.

        Returns:
            SKILL.md file contents as a string.

        Raises:
            ValueError: If design is not installed or SKILL.md is missing.
        """
        design_name = name or self.active()
        path = self._design_path(design_name)
        if not path:
            raise ValueError(f"Design '{design_name}' is not installed")
        skill_file = path / "SKILL.md"
        if not skill_file.exists():
            raise ValueError(f"Design '{design_name}' has no SKILL.md")
        return skill_file.read_text(encoding="utf-8")

    def build_prompt(self, design_name: str | None = None) -> str:
        """
        Concatenate core SKILL.md + design context into a combined system prompt.

        Injects the active design name and path so the agent can reference
        preview.html and SKILL.md directly from ~/.config/slides-it/designs/.

        Args:
            design_name: Design to use. Defaults to the active design.

        Returns:
            Full system prompt string ready to pass as the `system` field in
            POST /session/:id/prompt_async.
        """
        name = design_name or self.active()
        core_skill = (
            pathlib.Path(__file__).parent / "skill" / "SKILL.md"
        ).read_text(encoding="utf-8")
        design_skill = self.get_skill_md(name)
        design_dir = DESIGNS_DIR / name
        has_preview = (design_dir / "preview.html").exists()
        if has_preview:
            preview_line = f"<!--   - preview.html — canonical visual reference (read this before generating slides) -->"
        else:
            preview_line = f"<!--   - (no preview.html for this design) -->"
        design_header = (
            f"<!-- Active design: {name} -->\n"
            f"<!-- Design files: {design_dir}/ -->\n"
            f"<!--   - SKILL.md — style instructions (injected below) -->\n"
            f"{preview_line}\n\n"
        )
        return f"{design_header}{core_skill}\n\n---\n\n{design_skill}"

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _migrate_legacy_templates_dir(self) -> None:
        """
        One-time migration: copy ~/.config/slides-it/templates/ → designs/
        if the old directory exists and the new one is empty/missing.
        """
        old_dir = CONFIG_DIR / "templates"
        if not old_dir.exists():
            return
        # Only migrate if designs/ has no subdirs yet (first run after upgrade)
        if DESIGNS_DIR.exists() and any(
            p.is_dir() and (p / "TEMPLATE.md").exists()
            for p in DESIGNS_DIR.iterdir()
        ):
            return
        for src in sorted(old_dir.iterdir()):
            if src.is_dir() and (src / "TEMPLATE.md").exists():
                dst = DESIGNS_DIR / src.name
                dst.mkdir(exist_ok=True)
                shutil.copytree(src, dst, dirs_exist_ok=True)

    def _seed_builtin_designs(self) -> None:
        """
        Copy built-in designs from the package seed directory to DESIGNS_DIR.

        Always overwrites to ensure bundled designs stay up to date with
        the installed package version. User-created designs (not present in
        the seed directory) are never touched.
        """
        if not _SEED_DIR.exists():
            return
        for src in sorted(_SEED_DIR.iterdir()):
            if not src.is_dir() or not (src / "TEMPLATE.md").exists():
                continue
            dst = DESIGNS_DIR / src.name
            dst.mkdir(exist_ok=True)
            shutil.copytree(src, dst, dirs_exist_ok=True)

    def _design_path(self, name: str) -> pathlib.Path | None:
        """Return the directory for a design, or None if not found."""
        path = DESIGNS_DIR / name
        if path.exists() and (path / "TEMPLATE.md").exists():
            return path
        return None

    def _install_from_url(self, url: str, name: str | None) -> str:
        """Download a zip from any URL and install the design."""
        with tempfile.TemporaryDirectory() as tmp:
            zip_path = pathlib.Path(tmp) / "design.zip"
            try:
                urllib.request.urlretrieve(url, zip_path)
            except Exception as e:
                raise RuntimeError(f"Failed to download design from {url}") from e

            extract_dir = pathlib.Path(tmp) / "extracted"
            try:
                with zipfile.ZipFile(zip_path) as zf:
                    zf.extractall(extract_dir)
            except zipfile.BadZipFile as e:
                raise RuntimeError(f"Downloaded file is not a valid zip: {url}") from e

            return self._install_from_extracted(extract_dir, name)

    def _install_from_path(self, path: pathlib.Path, name: str | None) -> str:
        """Install a design from a local directory."""
        if not path.exists():
            raise ValueError(f"Path does not exist: {path}")
        if not (path / "TEMPLATE.md").exists():
            raise ValueError(f"No TEMPLATE.md found in {path}")
        if not (path / "SKILL.md").exists():
            raise ValueError(f"No SKILL.md found in {path}")

        info = self._parse_design_md(path / "TEMPLATE.md")
        design_name = name or (info.name if info else path.name)
        target = DESIGNS_DIR / design_name
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(path, target)
        return design_name

    def _install_from_registry(self, name: str) -> str:
        """Look up a design name in registry.json and install it."""
        registry_path = pathlib.Path(__file__).parent.parent / "registry.json"
        if not registry_path.exists():
            raise ValueError(f"registry.json not found; cannot install '{name}' by name")
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
        for entry in registry.get("templates", []):
            if entry["name"] == name:
                url = entry.get("url", "")
                if url == "bundled":
                    raise ValueError(f"'{name}' is a built-in design and is already available")
                return self._install_from_url(url, name)
        raise ValueError(f"Design '{name}' not found in registry")

    def _install_from_extracted(self, extract_dir: pathlib.Path, name: str | None) -> str:
        """Find the design root inside an extracted zip and install it."""
        # GitHub zips wrap contents in a subdirectory — find TEMPLATE.md
        design_root: pathlib.Path | None = None
        for candidate in [extract_dir, *extract_dir.iterdir()]:
            if candidate.is_dir() and (candidate / "TEMPLATE.md").exists():
                design_root = candidate
                break
        if not design_root:
            raise RuntimeError("No TEMPLATE.md found inside the downloaded zip")
        return self._install_from_path(design_root, name)

    @staticmethod
    def _parse_design_md(path: pathlib.Path) -> DesignInfo | None:
        """Parse YAML frontmatter from TEMPLATE.md and return DesignInfo."""
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            return None

        fields: dict[str, str] = {}
        lines = text.splitlines()
        if lines and lines[0].strip() == "---":
            for line in lines[1:]:
                if line.strip() == "---":
                    break
                if ":" in line:
                    key, _, value = line.partition(":")
                    fields[key.strip()] = value.strip()

        return DesignInfo(
            name=fields.get("name", path.parent.name),
            description=fields.get("description", ""),
            author=fields.get("author", "unknown"),
            version=fields.get("version", "0.0.0"),
        )

    def _load_config(self) -> dict[str, str]:
        if CONFIG_FILE.exists():
            try:
                return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                pass
        return {}

    def _save_config(self, config: dict[str, str]) -> None:
        CONFIG_FILE.write_text(json.dumps(config, indent=2), encoding="utf-8")
