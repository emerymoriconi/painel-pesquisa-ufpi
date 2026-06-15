export default function CardMetrica({ titulo, valor, subtitulo, onClick, icone }) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-azul-escuro text-white p-6 rounded-xl relative',
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : '',
      ].join(' ')}
    >
      {icone && (
        <span className="absolute top-4 right-4 text-2xl opacity-50">
          {icone}
        </span>
      )}
      <p className="text-sm font-medium uppercase tracking-wide opacity-80">
        {titulo}
      </p>
      <p className="text-4xl font-bold mt-2">{valor}</p>
      {subtitulo && (
        <p className="text-xs opacity-70 mt-1">{subtitulo}</p>
      )}
    </div>
  )
}
