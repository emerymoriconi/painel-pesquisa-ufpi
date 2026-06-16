import SkeletonTabela from './SkeletonTabela'

export default function TabelaPaginada({
  colunas = [],
  dados = [],
  loading = false,
  emptyMessage = 'Nenhum registro encontrado',
}) {
  if (loading) return <SkeletonTabela />

  return (
    <div className="h-full overflow-y-auto overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-azul-escuro text-white">
            {colunas.map((col) => (
              <th key={col.key} className="text-xs font-semibold py-2 px-3 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="text-center py-6 text-gray-500 text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            dados.map((linha, i) => (
              <tr
                key={i}
                className={`${
                  i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'
                } hover:bg-azul-claro dark:hover:bg-gray-700 transition-colors`}
              >
                {colunas.map((col) => (
                  <td key={col.key} className="text-xs py-1.5 px-3 dark:text-gray-200">
                    {col.render ? col.render(linha[col.key], linha) : linha[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
