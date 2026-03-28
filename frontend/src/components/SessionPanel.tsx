import type { Todo, FileDiff } from '../lib/opencode-api'

interface SessionPanelProps {
  todos: Todo[]
  diffs: FileDiff[]
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#ef4444',
  medium: '#eab308',
  low:    '#6b7280',
}

function TodoItem({ todo }: { todo: Todo }) {
  const done = todo.status === 'completed' || todo.status === 'cancelled'

  let icon: React.ReactNode
  if (todo.status === 'completed') {
    icon = <span style={{ color: '#22c55e' }}>✓</span>
  } else if (todo.status === 'cancelled') {
    icon = <span style={{ color: '#6b7280' }}>–</span>
  } else if (todo.status === 'in_progress') {
    icon = (
      <span className="animate-pulse inline-block" style={{ color: '#22d3ee' }}>●</span>
    )
  } else {
    icon = <span style={{ color: '#6b7280' }}>○</span>
  }

  return (
    <div className="flex items-start gap-1.5 py-0.5" style={{ opacity: done ? 0.45 : 1 }}>
      <span
        className="mt-1 shrink-0 rounded-sm"
        style={{
          width: 5,
          height: 5,
          background: PRIORITY_COLOR[todo.priority] ?? '#6b7280',
          display: 'inline-block',
        }}
      />
      <span className="shrink-0 w-3 text-center text-xs leading-4 font-mono">
        {icon}
      </span>
      <span
        className="flex-1 text-xs leading-4 break-words"
        style={{
          color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {todo.content}
      </span>
    </div>
  )
}

function DiffItem({ diff }: { diff: FileDiff }) {
  const parts = diff.file.replace(/\\/g, '/').split('/')
  const label = parts.length > 2 ? `…/${parts.slice(-2).join('/')}` : diff.file

  return (
    <div className="flex items-center gap-1 py-0.5">
      <span
        className="flex-1 truncate text-xs"
        style={{ color: 'var(--text-secondary)', fontFamily: 'ui-monospace, monospace' }}
        title={diff.file}
      >
        {label}
      </span>
      {diff.additions > 0 && (
        <span className="text-xs shrink-0" style={{ color: '#22c55e', fontFamily: 'ui-monospace, monospace' }}>
          +{diff.additions}
        </span>
      )}
      {diff.deletions > 0 && (
        <span className="text-xs shrink-0" style={{ color: '#ef4444', fontFamily: 'ui-monospace, monospace' }}>
          –{diff.deletions}
        </span>
      )}
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-1">
      <span
        className="text-xs font-semibold tracking-wide uppercase"
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: '0.62rem',
          color: 'var(--text-secondary)',
        }}
      >
        {label}
      </span>
    </div>
  )
}

function EmptyHint({ label }: { label: string }) {
  return (
    <p
      className="text-xs italic"
      style={{ color: 'var(--text-secondary)', opacity: 0.5, fontFamily: 'ui-monospace, monospace' }}
    >
      {label}
    </p>
  )
}

export default function SessionPanel({ todos, diffs }: SessionPanelProps) {
  const safeTodos = Array.isArray(todos) ? todos : []
  const safeDiffs = Array.isArray(diffs) ? diffs : []

  return (
    <div
      className="shrink-0 flex flex-col overflow-hidden"
      style={{
        height: '13rem',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-sidebar)',
      }}
    >
      <div className="flex-1 overflow-y-auto px-3 py-2.5 flex flex-col gap-3">
        <div>
          <SectionHeader label="Todos" />
          {safeTodos.length > 0
            ? safeTodos.map((t) => <TodoItem key={t.id} todo={t} />)
            : <EmptyHint label="No active tasks" />
          }
        </div>

        <div>
          <SectionHeader label="Modified Files" />
          {safeDiffs.length > 0
            ? safeDiffs.map((d) => <DiffItem key={d.file} diff={d} />)
            : <EmptyHint label="No changes yet" />
          }
        </div>
      </div>
    </div>
  )
}
