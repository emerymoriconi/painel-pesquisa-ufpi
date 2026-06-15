import SkeletonTabela from './SkeletonTabela'

export default function TabelaPaginada({
  colunas = [],
  dados = [],
  pagina = 1,
  totalPaginas = 1,
  onAnterior,
  onProxima,
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
}) {
  if (loading) return <SkeletonTabela />

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-azul-escuro text-white">
              {colunas.map((col) => (
                <th key={col.key} className="text-sm font-semibold py-3 px-4 whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr>
                <td
                  colSpan={colunas.length}
                  className="text-center py-8 text-gray-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              dados.map((linha, i) => (
                <tr
                  key={i}
                  className={`${
                    i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100 transition-colors`}
                >
                  {colunas.map((col) => (
                    <td key={col.key} className="text-sm py-3 px-4">
                      {col.render
                        ? col.render(linha[col.key], linha)
                        : linha[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 px-1">
        <span className="text-sm text-gray-600">
          Página {pagina} de {totalPaginas}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onAnterior}
            disabled={pagina === 1}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-azul-claro disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={onProxima}
            disabled={pagina === totalPaginas}
            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-azul-claro disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  )
}
