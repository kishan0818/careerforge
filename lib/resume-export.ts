import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export const generatePdf = async (html: string, filename: string) => {
  // Replace unsupported oklch() color functions with a safe color
  const safeHtml = html.replace(/oklch\([^)]*\)/g, '#111111')
  const element = document.createElement('div')
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.width = '210mm' // A4 width
  element.style.padding = '20mm'
  element.innerHTML = safeHtml
  // Strip class attributes to avoid Tailwind/oklch computed colors breaking html2canvas
  element.querySelectorAll('[class]')?.forEach((el) => {
    el.removeAttribute('class')
  })
  // Force simple colors to avoid unsupported color parsing
  element.style.backgroundColor = '#ffffff'
  element.style.color = '#111111'
  element.querySelectorAll('*')?.forEach((el) => {
    const node = el as HTMLElement
    node.style.backgroundColor = '#ffffff'
    node.style.color = '#111111'
  })
  document.body.appendChild(element)
  
  try {
    const canvas = await html2canvas(element as HTMLElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename)
  } finally {
    document.body.removeChild(element)
  }
}

export const generateDocx = async (html: string, filename: string) => {
  // Build a simple structured DOCX from HTML (headings, paragraphs, bullets)
  const container = document.createElement('div')
  container.innerHTML = html

  const children: Paragraph[] = []

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()
      if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
        const level = tag === 'h1' ? HeadingLevel.HEADING_1 : tag === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3
        children.push(new Paragraph({
          heading: level,
          children: [new TextRun(el.textContent || '')],
        }))
        return
      }
      if (tag === 'p') {
        children.push(new Paragraph({ children: [new TextRun(el.textContent || '')] }))
        return
      }
      if (tag === 'li') {
        children.push(new Paragraph({ text: el.textContent || '', bullet: { level: 0 } }))
        return
      }
      // Traverse deeper for other containers
      el.childNodes.forEach(walk)
      return
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').trim()
      if (text) children.push(new Paragraph({ children: [new TextRun(text)] }))
    }
  }

  container.childNodes.forEach(walk)

  const doc = new Document({ sections: [{ properties: {}, children: children.length ? children : [new Paragraph('')] }] })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
