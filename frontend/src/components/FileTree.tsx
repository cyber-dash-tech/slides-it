import { useCallback, useEffect, useRef, useState } from 'react'
import {
  listEntries,
  uploadFiles,
  renameFile,
  deleteFile,
  getFileServeUrl,
  type FsEntry,
} from '../lib/slides-server-api'

interface FileTreeProps {
  workspacePath: string
  refreshToken?: number
  onFileClick?: (path: string) => void
}

type LiveMode = 'off' | 'polling'

const colorMap: Record<string, string> = {
  py: '#3B82F6', ts: '#60A5FA', tsx: '#60A5FA',
  js: '#F59E0B', jsx: '#F59E0B',
  json: '#10B981', md: '#6B7280', txt: '#9CA3AF',
  yml: '#EF4444', yaml: '#EF4444', toml: '#F97316',
  css: '#EC4899', html: '#F97316', sh: '#22C55E',
}
function fileColor(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  return colorMap[ext] ?? '#9CA3AF'
}

interface TreeNodeState {
  node: FsEntry
  children: TreeNodeState[] | null
  open: boolean
  loading: boolean
}
function toState(node: FsEntry): TreeNodeState {
  return { node, children: null, open: false, loading: false }
}
function updateTree(
  nodes: TreeNodeState[],
  path: string,
  fn: (n: TreeNodeState) => TreeNodeState,
): TreeNodeState[] {
  return nodes.map((n) => {
    if (n.node.path === path) return fn(n)
    if (n.children) return { ...n, children: updateTree(n.children, path, fn) }
    return n
  })
}
function findNode(nodes: TreeNodeState[], path: string): TreeNodeState | null {
  for (const n of nodes) {
    if (n.node.path === path) return n
    if (n.children) {
      const f = findNode(n.children, path)
      if (f) return f
    }
  }
  return null
}

// ── ContextMenu ──────────────────────────────────────────────────────────────
interface ContextMenuState {
  x: number
  y: number
  node: FsEntry
}

interface ContextMenuProps {
  menu: ContextMenuState
  onClose: () => void
  onOpen: (node: FsEntry) => void
  onCopyPath: (node: FsEntry) => void
  onCopyName: (node: FsEntry) => void
  onRename: (node: FsEntry) => void
  onDelete: (node: FsEntry) => void
}

function ContextMenu({ menu, onClose, onOpen, onCopyPath, onCopyName, onRename, onDelete }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isFile = menu.node.type === 'file'

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  const itemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    textAlign: 'left',
    padding: '5px 12px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '4px',
  }
  const dangerStyle: React.CSSProperties = { ...itemStyle, color: '#EF4444' }

  function Item({ onClick, icon, label, danger = false }: {
    onClick: () => void; icon: React.ReactNode; label: string; danger?: boolean
  }) {
    const [hov, setHov] = useState(false)
    return (
      <button
        style={{
          ...(danger ? dangerStyle : itemStyle),
          background: hov ? (danger ? 'rgba(239,68,68,0.08)' : 'var(--bg-hover)') : 'transparent',
        }}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => { onClick(); onClose() }}
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: menu.y,
        left: menu.x,
        zIndex: 9999,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: '4px',
        minWidth: '180px',
      }}
    >
      {isFile && (
        <Item
          onClick={() => onOpen(menu.node)}
          label="Open in New Tab"
          icon={
            <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          }
        />
      )}
      <Item
        onClick={() => onCopyPath(menu.node)}
        label="Copy Path"
        icon={
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        }
      />
      <Item
        onClick={() => onCopyName(menu.node)}
        label="Copy Name"
        icon={
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        }
      />
      <div style={{ height: '1px', background: 'var(--border)', margin: '4px 8px' }} />
      <Item
        onClick={() => onRename(menu.node)}
        label="Rename"
        icon={
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
      />
      <Item
        onClick={() => onDelete(menu.node)}
        label="Delete"
        danger
        icon={
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
      />
    </div>
  )
}

// ── DeleteConfirm ─────────────────────────────────────────────────────────────
function DeleteConfirm({ node, onConfirm, onCancel }: {
  node: FsEntry
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onMouseDown={onCancel}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '20px 24px',
          maxWidth: '360px',
          width: '90%',
          boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
        }}
        onMouseDown={e => e.stopPropagation()}
      >
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
          Delete {node.type === 'directory' ? 'folder' : 'file'}?
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          <span className="font-mono">{node.name}</span>
          {node.type === 'directory' && ' and all its contents'} will be permanently deleted.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded-lg text-xs transition-colors"
            style={{
              background: '#EF4444',
              border: '1px solid #DC2626',
              color: 'white',
              fontFamily: 'inherit',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function FileTree({ workspacePath, refreshToken, onFileClick }: FileTreeProps) {
  const [roots, setRoots] = useState<TreeNodeState[]>([])
  const [error, setError] = useState('')
  const [liveMode, setLiveMode] = useState<LiveMode>('off')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const pollingRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)

  // Context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  // Inline rename
  const [renamingPath, setRenamingPath] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<FsEntry | null>(null)
  // Toast feedback
  const [toast, setToast] = useState('')
  const toastTimerRef = useRef<number | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToast(''), 2000)
  }

  const loadRoots = useCallback(async () => {
    if (!workspacePath) return
    try {
      const entries = await listEntries(workspacePath)
      setRoots(entries.map(toState))
      setError('')
    } catch (e) {
      setError((e as Error).message)
    }
  }, [workspacePath])

  useEffect(() => { loadRoots() }, [loadRoots])
  useEffect(() => { if (refreshToken && refreshToken > 0) loadRoots() }, [refreshToken, loadRoots])

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingPath && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingPath])

  function toggleLiveSync() {
    if (liveMode !== 'off') {
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = null
      setLiveMode('off')
      return
    }
    pollingRef.current = window.setInterval(loadRoots, 4000)
    setLiveMode('polling')
  }
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current) }, [])

  async function toggleDir(path: string) {
    const current = findNode(roots, path)
    if (!current) return
    if (current.open) {
      setRoots((p) => updateTree(p, path, (n) => ({ ...n, open: false })))
      return
    }
    if (current.children !== null) {
      setRoots((p) => updateTree(p, path, (n) => ({ ...n, open: true })))
      return
    }
    setRoots((p) => updateTree(p, path, (n) => ({ ...n, open: true, loading: true })))
    try {
      const children = await listEntries(path)
      setRoots((p) =>
        updateTree(p, path, (n) => ({
          ...n,
          loading: false,
          children: children.map(toState),
        })),
      )
    } catch {
      setRoots((p) => updateTree(p, path, (n) => ({ ...n, loading: false, children: [] })))
    }
  }

  async function handleUpload(files: FileList | File[]) {
    const fileArr = Array.from(files)
    if (!fileArr.length) return
    setUploading(true)
    try {
      await uploadFiles(fileArr)
      await loadRoots()
    } catch (e) {
      setError(`Upload failed: ${(e as Error).message}`)
    } finally {
      setUploading(false)
    }
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault()
    dragCounterRef.current += 1
    if (dragCounterRef.current === 1) setIsDragOver(true)
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) setIsDragOver(false)
  }
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragOver(false)
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files)
  }

  // Cmd/Ctrl+V paste to upload files
  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const items = Array.from(e.clipboardData?.files ?? [])
      if (items.length > 0) {
        e.preventDefault()
        handleUpload(items)
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Context menu actions ──────────────────────────────────────────────────
  function handleContextMenu(e: React.MouseEvent, node: FsEntry) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  function handleOpen(node: FsEntry) {
    window.open(getFileServeUrl(node.path), '_blank')
  }

  function handleCopyPath(node: FsEntry) {
    navigator.clipboard.writeText(node.path).then(() => showToast('Path copied'))
  }

  function handleCopyName(node: FsEntry) {
    navigator.clipboard.writeText(node.name).then(() => showToast('Name copied'))
  }

  function handleStartRename(node: FsEntry) {
    setRenamingPath(node.path)
    // Strip extension for text files — cursor lands before the dot
    const dotIdx = node.type === 'file' ? node.name.lastIndexOf('.') : -1
    setRenameValue(dotIdx > 0 ? node.name.slice(0, dotIdx) : node.name)
  }

  async function handleCommitRename(node: FsEntry) {
    const rawInput = renameValue.trim()
    if (!rawInput) { setRenamingPath(null); return }
    // Re-attach extension if user didn't type one and original had one
    const dotIdx = node.type === 'file' ? node.name.lastIndexOf('.') : -1
    const ext = dotIdx > 0 ? node.name.slice(dotIdx) : ''
    const newName = rawInput.includes('.') ? rawInput : rawInput + ext
    if (newName === node.name) { setRenamingPath(null); return }
    try {
      await renameFile(node.path, newName)
      setRenamingPath(null)
      await loadRoots()
    } catch (e) {
      showToast((e as Error).message)
      setRenamingPath(null)
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteFile(deleteTarget.path)
      setDeleteTarget(null)
      await loadRoots()
    } catch (e) {
      showToast((e as Error).message)
      setDeleteTarget(null)
    }
  }

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden relative"
      style={{
        background: isDragOver ? 'var(--bg-hover)' : 'var(--bg-sidebar)',
        transition: 'background 0.15s',
      }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleUpload(e.target.files)}
      />

      {/* Header */}
      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span
          className="text-[10px] font-mono truncate flex-1"
          style={{ color: 'var(--text-muted)' }}
          title={workspacePath}
        >
          {workspacePath.split('/').pop() || workspacePath}
        </span>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            title="Upload files to workspace"
          >
            {uploading ? (
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
          </button>

          {/* Live sync toggle */}
          <button
            onClick={toggleLiveSync}
            className="text-[10px] flex items-center gap-1 transition-colors"
            style={{ color: liveMode !== 'off' ? 'var(--green-dot)' : 'var(--text-muted)' }}
          >
            {liveMode !== 'off' && (
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--green-dot)' }}
              />
            )}
            {liveMode === 'off' ? 'sync' : 'live'}
          </button>
        </div>
      </div>

      {/* Drop overlay */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div
            className="text-[11px] font-medium px-3 py-2 rounded-lg"
            style={{
              color: 'var(--btn-send)',
              border: '1.5px dashed var(--btn-send)',
              background: 'var(--bg-surface)',
            }}
          >
            Drop to upload
          </div>
        </div>
      )}

      {/* Toast feedback */}
      {toast && (
        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] px-2.5 py-1 rounded-lg pointer-events-none z-50"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          {toast}
        </div>
      )}

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {error && (
          <p className="text-[10px] px-3 py-2" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        )}
        {!error && roots.length === 0 && workspacePath && (
          <p className="text-[10px] px-3 py-4 text-center" style={{ color: 'var(--text-muted)' }}>
            Empty folder
          </p>
        )}
        {roots.map((n) => (
          <TreeNode
            key={n.node.path}
            state={n}
            depth={0}
            onToggleDir={toggleDir}
            onFileClick={onFileClick}
            onContextMenu={handleContextMenu}
            renamingPath={renamingPath}
            renameValue={renameValue}
            renameInputRef={renameInputRef}
            onRenameChange={setRenameValue}
            onRenameCommit={handleCommitRename}
            onRenameCancel={() => setRenamingPath(null)}
          />
        ))}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onOpen={handleOpen}
          onCopyPath={handleCopyPath}
          onCopyName={handleCopyName}
          onRename={(node) => { handleStartRename(node) }}
          onDelete={(node) => { setDeleteTarget(node) }}
        />
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirm
          node={deleteTarget}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

// ── TreeNode ────────────────────────────────────────────────────────────────
function TreeNode({
  state,
  depth,
  onToggleDir,
  onFileClick,
  onContextMenu,
  renamingPath,
  renameValue,
  renameInputRef,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
}: {
  state: TreeNodeState
  depth: number
  onToggleDir: (path: string) => void
  onFileClick?: (path: string) => void
  onContextMenu: (e: React.MouseEvent, node: FsEntry) => void
  renamingPath: string | null
  renameValue: string
  renameInputRef: React.RefObject<HTMLInputElement | null>
  onRenameChange: (v: string) => void
  onRenameCommit: (node: FsEntry) => void
  onRenameCancel: () => void
}) {
  const { node, open, loading } = state
  const isDir = node.type === 'directory'
  const isRenaming = renamingPath === node.path

  return (
    <>
      <div
        className="group relative flex items-center"
        onContextMenu={(e) => onContextMenu(e, node)}
      >
        <button
          style={{ paddingLeft: `${4 + depth * 12}px` }}
          className="flex items-center gap-1.5 w-full text-left px-1 py-0.5 rounded transition-colors"
          onClick={() => (isDir ? onToggleDir(node.path) : onFileClick?.(node.path))}
          onDoubleClick={() => {
            if (!isDir) window.open(`/api/file/serve?path=${encodeURIComponent(node.path)}`, '_blank')
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Chevron — only for dirs */}
          {isDir ? (
            <svg
              className={`w-2.5 h-2.5 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
              style={{ color: 'var(--text-muted)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <span className="w-2.5 h-2.5 flex-shrink-0" />
          )}

          {/* Icon */}
          {isDir ? (
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
              style={{ color: '#F59E0B' }}>
              {open
                ? <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                : <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              }
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
              style={{ color: fileColor(node.name) }}>
              <path fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd" />
            </svg>
          )}

          {/* Label or inline rename input */}
          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={e => onRenameChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); onRenameCommit(node) }
                if (e.key === 'Escape') { e.preventDefault(); onRenameCancel() }
              }}
              onBlur={() => onRenameCommit(node)}
              onClick={e => e.stopPropagation()}
              className="text-xs flex-1 min-w-0 rounded px-1"
              style={{
                color: 'var(--text-primary)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-send)',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          ) : (
            <span
              className="text-xs truncate"
              style={{ color: isDir ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {node.name}
            </span>
          )}

          {/* Spinner while loading children */}
          {loading && (
            <svg
              className="w-3 h-3 animate-spin ml-auto flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
              fill="none" viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
        </button>
      </div>

      {/* Children */}
      {open && state.children && state.children.map((child) => (
        <TreeNode
          key={child.node.path}
          state={child}
          depth={depth + 1}
          onToggleDir={onToggleDir}
          onFileClick={onFileClick}
          onContextMenu={onContextMenu}
          renamingPath={renamingPath}
          renameValue={renameValue}
          renameInputRef={renameInputRef}
          onRenameChange={onRenameChange}
          onRenameCommit={onRenameCommit}
          onRenameCancel={onRenameCancel}
        />
      ))}
    </>
  )
}
