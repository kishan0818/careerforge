declare module 'html2pdf.js' {
  type Options = {
    margin?: number | [number, number] | [number, number, number, number]
    filename?: string
    image?: { type?: 'jpeg' | 'png'; quality?: number }
    html2canvas?: Partial<{
      scale: number
      useCORS: boolean
      allowTaint: boolean
      backgroundColor: string | null
    }>
    jsPDF?: Partial<{
      unit: 'pt' | 'mm' | 'cm' | 'in'
      format: string | [number, number]
      orientation: 'portrait' | 'landscape'
    }>
    pagebreak?: { mode?: Array<'avoid-all' | 'css' | 'legacy'> }
  }

  interface Html2Pdf {
    set: (options: Options) => Html2Pdf
    from: (element: HTMLElement | string) => Html2Pdf
    save: () => Promise<void>
    outputPdf?: () => Promise<Blob>
  }

  function html2pdf(): Html2Pdf
  export default html2pdf
}
