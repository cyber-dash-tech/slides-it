import type { TodoItem } from '../lib/typewriter'

interface TodoBubbleProps {
  todos: TodoItem[]
  timestamp: Date
}

export default function TodoBubble({ todos, timestamp }: TodoBubbleProps) {
  return (
    <div
      className="py-3 px-4 rounded-2xl font-mono text-sm"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-1.5 mb-3">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'var(--green-dot)' }}
        />
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'inherit' }}>
          todos
        </span>
        <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'inherit' }}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Title */}
      <div
        className="mb-3 text-sm font-semibold"
        style={{ color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace' }}
      >
        # Todos
      </div>

      {/* Todo rows */}
      <div className="flex flex-col gap-0.5">
        {todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  )
}

function TodoRow({ todo }: { todo: TodoItem }) {
  const isCompleted = todo.status === 'completed'
  const isCancelled = todo.status === 'cancelled'
  const isInProgress = todo.status === 'in_progress'
  const isDone = isCompleted || isCancelled

  let bracket: React.ReactNode
  if (isCompleted) {
    bracket = (
      <span style={{ color: '#22c55e' }}>&#x2713;</span>
    )
  } else if (isCancelled) {
    bracket = (
      <span style={{ color: '#6b7280' }}>-</span>
    )
  } else if (isInProgress) {
    bracket = (
      <span className="animate-pulse" style={{ color: '#f97316' }}>&#x2022;</span>
    )
  } else {
    bracket = (
      <span style={{ color: 'var(--text-muted)' }}>&nbsp;</span>
    )
  }

  const contentColor = isInProgress
    ? '#f97316'
    : isDone
    ? 'var(--text-muted)'
    : 'var(--text-secondary)'

  return (
    <div
      className="flex items-start gap-0"
      style={{
        opacity: isDone ? 0.55 : 1,
        fontFamily: 'ui-monospace, monospace',
        fontSize: '0.78rem',
        lineHeight: '1.5',
        fontWeight: isInProgress ? 600 : 400,
      }}
    >
      {/* [x] bracket */}
      <span style={{ color: contentColor, flexShrink: 0 }}>[</span>
      <span style={{ flexShrink: 0, minWidth: '0.65em', textAlign: 'center' }}>{bracket}</span>
      <span style={{ color: contentColor, flexShrink: 0 }}>]&nbsp;</span>
      {/* Content */}
      <span style={{ color: contentColor, wordBreak: 'break-word' }}>{todo.content}</span>
    </div>
  )
}
