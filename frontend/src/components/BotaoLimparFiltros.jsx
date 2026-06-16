export default function BotaoLimparFiltros({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="self-end px-2 py-1 text-xs border border-azul-medio text-azul-medio rounded hover:bg-azul-claro transition-colors whitespace-nowrap"
    >
      ✕ Limpar Filtros
    </button>
  )
}
