import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * PasswordInput
 *
 * Simple password field with an eye toggle.
 *
 * Used when:
 * - Login
 * - Creating/updating police accounts
 * - Changing admin password
 *
 * Notes:
 * - Pass the same `className` you would normally put on an <input> so styling stays consistent.
 */
export default function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  className = '',
  name,
  autoComplete,
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={className}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  )
}


