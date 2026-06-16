export default function FiltroTexto({
  label,
  value,
  onChange,
  placeholder,
  className = '',
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {label && (
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-300 rounded px-2 py-1 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-azul-medio dark:bg-gray-800 dark:text-white dark:border-gray-600"
      />
    </div>
  )
}
