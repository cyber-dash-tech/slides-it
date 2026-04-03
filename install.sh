#!/usr/bin/env bash
# install.sh — Install slides-it
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/slides-it/slides-it/main/install.sh | bash
#
# What this does:
#   1. Detects your platform and architecture
#   2. Checks that Node.js is installed (downloads official binary if not — required for web search)
#   3. Installs open-websearch globally (npm install -g)
#   4. Checks that opencode is installed (installs it if not)
#   5. Downloads the matching slides-it binary from the latest GitHub Release
#   6. Installs it to ~/.local/bin/slides-it

set -euo pipefail

REPO="mengdigao1988/slides-it"
INSTALL_DIR="${HOME}/.local/bin"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

info()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m ✓\033[0m %s\n' "$*"; }
warn()  { printf '\033[1;33mWARN\033[0m %s\n' "$*" >&2; }
die()   { printf '\033[1;31mERROR\033[0m %s\n' "$*" >&2; exit 1; }

need() {
    command -v "$1" >/dev/null 2>&1 || die "$1 is required but not found. Please install it first."
}

# ---------------------------------------------------------------------------
# 1. Detect platform
# ---------------------------------------------------------------------------

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin)
        case "$ARCH" in
            arm64)
                ARTIFACT="slides-it-macos-arm64"
                NODE_ARCH="darwin-arm64"
                ;;
            x86_64)
                ARTIFACT="slides-it-macos-x86_64"
                NODE_ARCH="darwin-x64"
                ;;
            *)  die "Unsupported macOS architecture: $ARCH" ;;
        esac
        ;;
    Linux)
        case "$ARCH" in
            x86_64)
                ARTIFACT="slides-it-linux-x86_64"
                NODE_ARCH="linux-x64"
                ;;
            *)  die "Unsupported Linux architecture: $ARCH (only x86_64 is supported)" ;;
        esac
        ;;
    *)
        die "Unsupported operating system: $OS"
        ;;
esac

info "Platform: $OS $ARCH → $ARTIFACT"

# ---------------------------------------------------------------------------
# 2. Check for required tools
# ---------------------------------------------------------------------------

need curl

# ---------------------------------------------------------------------------
# 3. Check / install Node.js (required for web search)
# ---------------------------------------------------------------------------

NODE_INSTALL_DIR="${HOME}/.local/node"

if command -v node >/dev/null 2>&1; then
    ok "Node.js is already installed ($(node --version 2>/dev/null || echo 'version unknown'))"
else
    info "Node.js not found — downloading official binary (required for web search)..."

    # Get latest LTS v22.x version number from nodejs.org directory listing
    NODE_VER="$(curl -fsSL https://nodejs.org/dist/latest-v22.x/ \
        | grep -oE 'node-v[0-9]+\.[0-9]+\.[0-9]+' | head -1 | sed 's/node-//')"

    if [ -z "$NODE_VER" ]; then
        warn "Could not determine Node.js version. Web search will be unavailable."
        warn "Install Node.js manually: https://nodejs.org/"
    else
        NODE_TAR="node-${NODE_VER}-${NODE_ARCH}.tar.gz"
        NODE_URL="https://nodejs.org/dist/${NODE_VER}/${NODE_TAR}"

        info "Downloading Node.js ${NODE_VER} for ${NODE_ARCH}..."
        NODE_TMP="$(mktemp)"
        if curl -fsSL --progress-bar -o "$NODE_TMP" "$NODE_URL"; then
            rm -rf "$NODE_INSTALL_DIR"
            mkdir -p "$NODE_INSTALL_DIR"
            tar -xzf "$NODE_TMP" -C "$NODE_INSTALL_DIR" --strip-components=1
            rm -f "$NODE_TMP"

            export PATH="${NODE_INSTALL_DIR}/bin:${PATH}"

            if command -v node >/dev/null 2>&1; then
                ok "Node.js $(node --version) installed to ${NODE_INSTALL_DIR}"
            else
                warn "Node.js extracted but not on PATH. Web search may not work."
            fi
        else
            rm -f "$NODE_TMP"
            warn "Node.js download failed. Web search will be unavailable."
            warn "Install manually: https://nodejs.org/"
        fi
    fi
fi

# Ensure locally-installed Node.js is on PATH for the rest of this script
if [ -d "${NODE_INSTALL_DIR}/bin" ]; then
    export PATH="${NODE_INSTALL_DIR}/bin:${PATH}"
fi

# ---------------------------------------------------------------------------
# 4. Install open-websearch (web search engine for AI)
# ---------------------------------------------------------------------------

if command -v open-websearch >/dev/null 2>&1; then
    ok "open-websearch is already installed"
else
    if command -v npm >/dev/null 2>&1; then
        info "Installing open-websearch globally..."
        npm install -g open-websearch
        if command -v open-websearch >/dev/null 2>&1; then
            ok "open-websearch installed"
        else
            warn "open-websearch installed but may not be on PATH yet."
        fi
    else
        warn "npm not available — skipping open-websearch install. Web search will be unavailable."
    fi
fi

# ---------------------------------------------------------------------------
# 5. Check / install opencode
# ---------------------------------------------------------------------------

if command -v opencode >/dev/null 2>&1; then
    ok "opencode is already installed ($(opencode --version 2>/dev/null | head -1 || echo 'version unknown'))"
else
    info "opencode not found — installing..."
    curl -fsSL https://opencode.ai/install | bash
    # Re-source PATH in case the installer added ~/.local/bin etc.
    export PATH="${HOME}/.local/bin:${PATH}"
    if command -v opencode >/dev/null 2>&1; then
        ok "opencode installed"
    else
        warn "opencode may not be on PATH yet. You may need to restart your shell."
    fi
fi

# ---------------------------------------------------------------------------
# 6. Resolve latest release tag from GitHub API
# ---------------------------------------------------------------------------

info "Fetching latest slides-it release..."

LATEST_TAG="$(
    curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" \
    | grep '"tag_name"' \
    | head -1 \
    | sed 's/.*"tag_name": *"\([^"]*\)".*/\1/'
)"

if [ -z "$LATEST_TAG" ]; then
    die "Could not determine latest release tag. Check https://github.com/${REPO}/releases"
fi

ok "Latest release: $LATEST_TAG"

DOWNLOAD_URL="https://github.com/${REPO}/releases/download/${LATEST_TAG}/${ARTIFACT}"

# ---------------------------------------------------------------------------
# 7. Download binary
# ---------------------------------------------------------------------------

info "Downloading ${ARTIFACT}..."

TMP_FILE="$(mktemp)"
# shellcheck disable=SC2064
trap "rm -f '${TMP_FILE}'" EXIT

if ! curl -fsSL --progress-bar -o "$TMP_FILE" "$DOWNLOAD_URL"; then
    die "Download failed: $DOWNLOAD_URL"
fi

# ---------------------------------------------------------------------------
# 8. Install to ~/.local/bin
# ---------------------------------------------------------------------------

mkdir -p "$INSTALL_DIR"
DEST="${INSTALL_DIR}/slides-it"
mv "$TMP_FILE" "$DEST"
chmod +x "$DEST"

ok "Installed: $DEST"

# ---------------------------------------------------------------------------
# 9. Done
# ---------------------------------------------------------------------------

echo ""
printf '\033[1;32mslides-it %s installed successfully!\033[0m\n' "$LATEST_TAG"
echo ""
echo "  To make all tools permanently available in your shell, run:"
echo ""
echo '    echo '"'"'export PATH="$HOME/.local/bin:$HOME/.local/node/bin:$HOME/.opencode/bin:$PATH"'"'"' >> ~/.zshrc && source ~/.zshrc'
echo ""
echo "  Then get started:"
echo "    slides-it            # launch the web UI"
echo "    slides-it --help     # show all commands"
echo "    slides-it --version  # show version"
echo ""
