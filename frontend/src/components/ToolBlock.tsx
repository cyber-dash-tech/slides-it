import { useState } from 'react'
import type { ToolEntry } from '../lib/typewriter'

interface ToolBlockProps { tool: ToolEntry }

// Format tool name: "read_file" → "Read File"
function formatToolName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Extract the most meaningful summary line from tool input
function inputSummary(input?: Record<string, unknown>): string {
  if (!input) return ''
  // Priority: path/file, command, query, url, then first key
  const priority = ['path', 'file', 'file_path', 'command', 'query', 'url', 'pattern', 'content']
  for (const key of priority) {
    const val = input[key]
    if (val != null) {
      const s = String(val)
      return s.length > 80 ? s.slice(0, 80) + '…' : s
    }
  }
  const first = Object.entries(input)[0]
  if (!first) return ''
  const s = String(first[1])
  return `${first[0]}: ${s.length > 60 ? s.slice(0, 60) + '…' : s}`
}

// Truncate output to first 3 lines
function outputSummary(output?: string): string {
  if (!output) return ''
  const lines = output.split('\n').filter(Boolean)
  if (lines.length <= 3) return output.trim()
  return lines.slice(0, 3).join('\n') + `\n… (${lines.length - 3} more lines)`
}

// Format agent type for display: "explore" → "Explore Task", "general" → "General Task"
function agentLabel(agent: string): string {
  const first = agent.charAt(0).toUpperCase() + agent.slice(1)
  return `${first} Task`
}

// ── SubtaskBlock — special rendering for task tool (sub-agent) ─────────────
function SubtaskBlock({ tool }: ToolBlockProps) {
  const [open, setOpen] = useState(false)

  const isError = tool.status === 'error'
  const isRunning = tool.status === 'running' || tool.status === 'pending'

  const agent = (tool.input?.subagent_type ?? tool.input?.agent ?? 'task') as string
  const description = (tool.input?.description ?? '') as string
  const prompt = (tool.input?.prompt ?? '') as string

  // Child tools spawned by this sub-agent (populated by ChatPanel SSE handler)
  const childTools = tool.childTools ?? []

  return (
    <div className={`mb-1.5 ${isRunning ? 'animate-pulse' : ''}`}>
      {/* Header: ∴ Explore Task — description */}
      <button
        className="w-full flex items-start gap-2 text-left py-1"
        style={{ background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-mono text-[11px] flex-shrink-0 mt-px" style={{ color: 'var(--text-muted)' }}>
          {isRunning ? '◌' : isError ? '✗' : '∴'}
        </span>
        <span className="text-[11px] leading-relaxed min-w-0">
          <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
            {agentLabel(agent)}
          </span>
          {description && (
            <span style={{ color: 'var(--text-muted)' }}>
              {' — '}{description}
            </span>
          )}
        </span>
        {isRunning && (
          <span className="text-[10px] ml-auto flex-shrink-0 mt-px" style={{ color: 'var(--text-muted)' }}>
            running
          </span>
        )}
      </button>

      {/* Child tool lines: └ Read file.ts / └ Grep pattern */}
      {childTools.length > 0 && (
        <div className="ml-5 space-y-0.5">
          {childTools.map((ct) => (
            <div
              key={ct.id}
              className="flex items-center gap-1.5 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="font-mono flex-shrink-0">{'└'}</span>
              <span className="font-mono font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
                {formatToolName(ct.tool || ct.name)}
              </span>
              <span className="truncate min-w-0">
                {inputSummary(ct.input)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Expanded: show full prompt + output */}
      {open && (
        <div className="ml-5 mt-1.5 space-y-2">
          {prompt && (
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Prompt
              </p>
              <pre
                className="text-[11px] leading-relaxed overflow-x-auto rounded p-2"
                style={{
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Söhne Mono', ui-monospace, monospace",
                  maxHeight: '160px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {prompt.length > 500 ? prompt.slice(0, 500) + '…' : prompt}
              </pre>
            </div>
          )}
          {tool.output && (
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Result
              </p>
              <pre
                className="text-[11px] leading-relaxed overflow-x-auto rounded p-2"
                style={{
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Söhne Mono', ui-monospace, monospace",
                  maxHeight: '200px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {outputSummary(tool.output)}
              </pre>
            </div>
          )}
          {tool.error && (
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--error)' }}>
                Error
              </p>
              <pre
                className="text-[11px] leading-relaxed rounded p-2"
                style={{
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                  color: 'var(--error)',
                  fontFamily: "'Söhne Mono', ui-monospace, monospace",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {tool.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Standard ToolBlock ─────────────────────────────────────────────────────
export default function ToolBlock({ tool }: ToolBlockProps) {
  // Route task tool to the special SubtaskBlock renderer
  if (tool.tool === 'task') return <SubtaskBlock tool={tool} />

  const [open, setOpen] = useState(false)

  const isError = tool.status === 'error'
  const isRunning = tool.status === 'running' || tool.status === 'pending'
  const isDone = tool.status === 'completed'

  const statusIcon = isRunning ? '◌' : isError ? '✗' : '✓'
  const statusColor = isError ? 'var(--error)' : isDone ? 'var(--green-dot)' : 'var(--text-muted)'

  const title = tool.title || formatToolName(tool.tool || tool.name)
  const summary = inputSummary(tool.input)
  const hasDetails = !!(tool.input && Object.keys(tool.input).length > 0) || !!tool.output || !!tool.error

  return (
    <div
      className="mb-1.5 rounded-lg overflow-hidden"
      style={{
        border: `1px solid ${isError ? 'var(--error-border)' : 'var(--border)'}`,
        background: isError ? 'var(--error-bg)' : 'var(--bg-sidebar)',
      }}
    >
      {/* Header row */}
      <button
        className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${isRunning ? 'animate-pulse' : ''}`}
        style={{
          background: 'transparent',
          cursor: hasDetails ? 'pointer' : 'default',
          fontFamily: 'inherit',
        }}
        onClick={() => hasDetails && setOpen((o) => !o)}
        disabled={!hasDetails}
      >
        {/* Chevron */}
        {hasDetails ? (
          <svg
            className="w-2.5 h-2.5 flex-shrink-0 transition-transform"
            style={{
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              color: 'var(--text-muted)',
            }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <span className="w-2.5 h-2.5 flex-shrink-0" />
        )}

        {/* Status icon */}
        <span className="font-mono text-[11px] flex-shrink-0" style={{ color: statusColor }}>
          {statusIcon}
        </span>

        {/* Tool name */}
        <span className="font-mono text-[11px] font-medium flex-shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </span>

        {/* Input summary (single line, truncated) */}
        {summary && !open && (
          <span
            className="text-[11px] truncate flex-1 min-w-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {summary}
          </span>
        )}

        {/* Duration placeholder / running label */}
        {isRunning && (
          <span className="text-[10px] ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            running
          </span>
        )}
      </button>

      {/* Expanded details */}
      {open && hasDetails && (
        <div
          className="px-3 pb-2.5"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {/* Input */}
          {tool.input && Object.keys(tool.input).length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Input
              </p>
              <pre
                className="text-[11px] leading-relaxed overflow-x-auto rounded p-2"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Söhne Mono', ui-monospace, monospace",
                  maxHeight: '120px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {JSON.stringify(tool.input, null, 2)}
              </pre>
            </div>
          )}

          {/* Output */}
          {tool.output && (
            <div className="mt-2">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                Output
              </p>
              <pre
                className="text-[11px] leading-relaxed overflow-x-auto rounded p-2"
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontFamily: "'Söhne Mono', ui-monospace, monospace",
                  maxHeight: '160px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {outputSummary(tool.output)}
              </pre>
            </div>
          )}

          {/* Error */}
          {tool.error && (
            <div className="mt-2">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--error)' }}>
                Error
              </p>
              <pre
                className="text-[11px] leading-relaxed rounded p-2"
                style={{
                  background: 'var(--error-bg)',
                  border: '1px solid var(--error-border)',
                  color: 'var(--error)',
                  fontFamily: "'Söhne Mono', ui-monospace, monospace",
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {tool.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
