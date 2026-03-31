// slides-it local server API
// Uses relative paths so it works in both dev (Vite proxy → localhost:3001)
// and production (same-origin, served by FastAPI on localhost:3000).

const BASE = ''  // relative — no hardcoded host

export interface DirEntry {
  name: string
  path: string
  has_children: boolean
}

export interface FsEntry {
  name: string
  path: string
  type: 'directory' | 'file'
  has_children: boolean
}

export interface StatusResponse {
  ready: boolean
  workspace: string
  opencode_version: string
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      msg = body.detail ?? body.message ?? msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export function listDirs(path: string): Promise<DirEntry[]> {
  return request<DirEntry[]>(`/api/dirs?path=${encodeURIComponent(path)}`)
}

/** List directories AND files in a directory. */
export function listEntries(path: string): Promise<FsEntry[]> {
  return request<FsEntry[]>(`/api/ls?path=${encodeURIComponent(path)}`)
}

export function startWorkspace(directory: string): Promise<{ status: string; workspace: string }> {
  return request(`/api/start`, {
    method: 'POST',
    body: JSON.stringify({ directory }),
  })
}

export function getStatus(): Promise<StatusResponse> {
  return request<StatusResponse>('/api/status')
}

/**
 * Upload files into the active workspace.
 */
export async function uploadFiles(
  files: File[],
  targetDir = '',
): Promise<{ uploaded: string[] }> {
  const form = new FormData()
  for (const file of files) {
    form.append('files', file)
  }
  const url = targetDir
    ? `/api/upload?target_dir=${encodeURIComponent(targetDir)}`
    : '/api/upload'
  const res = await fetch(url, { method: 'POST', body: form })
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const body = await res.json()
      msg = body.detail ?? body.message ?? msg
    } catch { /* ignore */ }
    throw new Error(msg)
  }
  return res.json() as Promise<{ uploaded: string[] }>
}

export interface ModelsResponse {
  models: string[]
  current: string
}

export function getModels(): Promise<ModelsResponse> {
  return request<ModelsResponse>('/api/models')
}

export function setModel(modelID: string): Promise<{ modelID: string }> {
  return request<{ modelID: string }>('/api/model', {
    method: 'PUT',
    body: JSON.stringify({ modelID }),
  })
}

export interface DesignSkillResponse {
  skill: string
}

/**
 * Fetch the combined system prompt (core SKILL.md + industry INDUSTRY.md + design DESIGN.md)
 * for the given design name, optionally scoped to a specific industry.
 */
export function getDesignSkill(name: string, industry?: string): Promise<DesignSkillResponse> {
  const params = new URLSearchParams()
  if (industry) params.set('industry', industry)
  const qs = params.toString()
  return request<DesignSkillResponse>(
    `/api/design/${encodeURIComponent(name)}/skill${qs ? `?${qs}` : ''}`,
  )
}

export interface DesignPreviewResponse {
  html: string
}

export function getDesignPreview(name: string): Promise<DesignPreviewResponse> {
  return request<DesignPreviewResponse>(`/api/design/${encodeURIComponent(name)}/preview`)
}

export interface DesignDetail {
  name: string
  description: string
  author: string
  version: string
  active: boolean
  has_preview: boolean
  skill_md: string
  preview_html: string | null
}

/**
 * Fetch full design details — metadata, SKILL.md, and preview.html — in one call.
 * Mirrors the agent-facing GET /api/design/{name} endpoint.
 */
export function getDesign(name: string): Promise<DesignDetail> {
  return request<DesignDetail>(`/api/design/${encodeURIComponent(name)}`)
}

export interface DesignEntry {
  name: string
  description: string
  author: string
  version: string
  active: boolean
  has_preview: boolean
}

export function listDesigns(): Promise<DesignEntry[]> {
  return request<DesignEntry[]>('/api/designs')
}

/**
 * Install a design — two modes, same endpoint:
 *
 * Mode A (source URL / registry):
 *   installDesign({ source: "https://..." })
 *   installDesign({ source: "github:user/repo" })
 *
 * Mode B (inline content — used by the AI agent and future UI upload):
 *   installDesign({ name: "blue-minimal", skill_md: "...", preview_html: "...", activate: true })
 */
export interface InstallDesignPayload {
  // Mode A
  source?: string
  // Mode B
  name?: string
  description?: string
  skill_md?: string
  preview_html?: string
  activate?: boolean
}

export function installDesign(
  payload: InstallDesignPayload,
): Promise<{ name: string; status: string; activated: string }> {
  return request<{ name: string; status: string; activated: string }>('/api/designs/install', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function removeDesign(name: string): Promise<{ name: string; status: string }> {
  return request<{ name: string; status: string }>(`/api/designs/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
}

export function activateDesign(name: string): Promise<{ name: string; status: string }> {
  return request<{ name: string; status: string }>(`/api/designs/${encodeURIComponent(name)}/activate`, {
    method: 'PUT',
  })
}

// ---------------------------------------------------------------------------
// Industries
// ---------------------------------------------------------------------------

export interface IndustryEntry {
  name: string
  description: string
  author: string
  version: string
  active: boolean
}

export interface IndustryDetail {
  name: string
  description: string
  author: string
  version: string
  active: boolean
  skill_md: string
}

export function listIndustries(): Promise<IndustryEntry[]> {
  return request<IndustryEntry[]>('/api/industries')
}

export function getIndustry(name: string): Promise<IndustryDetail> {
  return request<IndustryDetail>(`/api/industry/${encodeURIComponent(name)}`)
}

export function activateIndustry(name: string): Promise<{ name: string; status: string }> {
  return request<{ name: string; status: string }>(`/api/industries/${encodeURIComponent(name)}/activate`, {
    method: 'PUT',
  })
}

export interface InstallIndustryPayload {
  source?: string
  name?: string
  description?: string
  skill_md?: string
  activate?: boolean
}

export function installIndustry(
  payload: InstallIndustryPayload,
): Promise<{ name: string; status: string; activated: string }> {
  return request<{ name: string; status: string; activated: string }>('/api/industries/install', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function removeIndustry(name: string): Promise<{ name: string; status: string }> {
  return request<{ name: string; status: string }>(`/api/industries/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export interface SettingsResponse {
  providerID: string
  apiKeyMasked: string
  baseURL: string
  customModel: string
}

export interface SettingsRequest {
  providerID: string
  apiKey: string
  baseURL: string
  customModel: string
}

export function getSettings(): Promise<SettingsResponse> {
  return request<SettingsResponse>('/api/settings')
}

export function saveSettings(s: SettingsRequest): Promise<{ status: string }> {
  return request<{ status: string }>('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(s),
  })
}

/**
 * Read a file as raw bytes and return its base64 encoding + MIME type.
 * Use this instead of opencode's /file/content for binary files (images, PDFs)
 * to avoid UTF-8 corruption.
 */
export function getFileBase64(path: string): Promise<{ base64: string; mime: string }> {
  return request<{ base64: string; mime: string }>(
    `/api/file-base64?path=${encodeURIComponent(path)}`,
  )
}

/** Return the persisted session ID and message history for the current workspace. */
export function getSession(): Promise<{ session_id: string | null; messages: object[] }> {
  return request<{ session_id: string | null; messages: object[] }>('/api/session')
}

/** Persist the active session ID and message history to .slides-it/history.json. */
export function saveSession(sessionId: string, messages: object[]): Promise<{ status: string }> {
  return request<{ status: string }>('/api/session', {
    method: 'PUT',
    body: JSON.stringify({ session_id: sessionId, messages }),
  })
}

