export default function FiltroSelect({
  label,
  value,
  onChange,
  options = [],
  disabled,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="border border-gray-300 rounded px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-azul-medio disabled:opacity-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
