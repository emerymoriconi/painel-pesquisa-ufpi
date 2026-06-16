import html2canvas from 'html2canvas'

function dataHoje() {
  const d = new Date()
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('-')
}

export default function BotaoExportarPNG({ refGrafico, nomeArquivo = 'grafico' }) {
  async function exportar() {
    if (!refGrafico?.current) return
    const canvas = await html2canvas(refGrafico.current, { useCORS: true })
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `${nomeArquivo}_${dataHoje()}.png`
    a.click()
  }

  return (
    <button
      onClick={exportar}
      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100 transition-colors"
    >
      ⬇ PNG
    </button>
  )
}
