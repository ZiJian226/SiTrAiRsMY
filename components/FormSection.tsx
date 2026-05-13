import React from 'react'

type FormSectionProps = {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

/**
 * FormSection component for organizing related form fields
 */
export default function FormSection({
  title,
  description,
  children,
  className = '',
}: FormSectionProps) {
  return (
    <div className={`card bg-base-100 border border-base-300 shadow-sm ${className}`}>
      <div className="card-body p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 bg-base-100">
          <h3 className="font-bold text-lg text-primary">{title}</h3>
          {description && <p className="text-sm opacity-70 mt-1">{description}</p>}
        </div>

        {/* Content */}
        <div className="px-0 py-0">{children}</div>
      </div>
    </div>
  )
}
