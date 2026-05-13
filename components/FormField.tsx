import React from 'react'

type FormFieldProps = {
  label: string
  sublabel?: string
  help?: string
  error?: string
  disabled?: boolean
  required?: boolean
  children: React.ReactNode
}

/**
 * FormField component with label in left column and input in right column
 * for clean, organized form layouts
 */
export default function FormField({
  label,
  sublabel,
  help,
  error,
  disabled,
  required,
  children,
}: FormFieldProps) {
  return (
    <div className="form-control w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start py-3 px-4 border-b border-base-300 hover:bg-base-100 transition-colors">
        {/* Label Column */}
        <div className="md:col-span-1 flex flex-col">
          <label className="font-semibold text-sm md:text-base">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
          {sublabel && <span className="text-xs opacity-60 mt-1">{sublabel}</span>}
        </div>

        {/* Input Column */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
            {children}
          </div>
          {help && <span className="text-xs opacity-70">{help}</span>}
          {error && <span className="text-xs text-error font-semibold">{error}</span>}
        </div>
      </div>
    </div>
  )
}
