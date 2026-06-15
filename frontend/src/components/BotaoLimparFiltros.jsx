export default function BotaoLimparFiltros({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="self-end px-3 py-2 text-sm border border-azul-medio text-azul-medio rounded hover:bg-azul-claro transition-colors"
    >
      ✕ Limpar Filtros
    </button>
  )
}
