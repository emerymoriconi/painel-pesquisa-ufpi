export default function CardMetrica({ titulo, valor, subtitulo, onClick, icone }) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-azul-escuro text-white p-3 rounded-xl relative',
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : '',
      ].join(' ')}
    >
      {icone && (
        <img
          src={icone}
          alt=""
          className="absolute top-3 right-3 w-6 h-6 object-contain opacity-80"
        />
      )}
      <p className="text-xs font-medium uppercase tracking-wide opacity-80 leading-tight pr-8">
        {titulo}
      </p>
      <p className="text-2xl font-bold mt-1">{valor}</p>
      {subtitulo && (
        <p className="text-xs opacity-70 mt-0.5">{subtitulo}</p>
      )}
    </div>
  )
}
