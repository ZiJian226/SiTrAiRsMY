import React from 'react'

type TagInputProps = {
  tags: string[]
  input: string
  onInputChange: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  placeholder?: string
  disabled?: boolean
  badgeColor?: 'badge-primary' | 'badge-secondary' | 'badge-accent' | 'badge-ghost'
}

/**
 * TagInput component for managing multiple tags with add/remove functionality
 */
export default function TagInput({
  tags,
  input,
  onInputChange,
  onAdd,
  onRemove,
  placeholder = 'Add an item and press Enter',
  disabled = false,
  badgeColor = 'badge-secondary',
}: TagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim()) {
        onAdd()
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="join w-full">
        <input
          type="text"
          className="input input-bordered join-item flex-1 text-sm"
          placeholder={placeholder}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          type="button"
          className="btn btn-primary join-item"
          onClick={onAdd}
          disabled={disabled || !input.trim()}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <div key={idx} className={`badge ${badgeColor} badge-lg gap-2 px-3 py-3`}>
            <span>{tag}</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs btn-circle ml-1"
              onClick={() => onRemove(idx)}
              disabled={disabled}
              aria-label={`Remove ${tag}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
