import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export const generatePdf = async (html: string, filename: string) => {
  // Sanitize input HTML: replace oklch() anywhere in the content
  const safeHtml = html.replace(/oklch\([^)]*\)/g, '#111111')

  // Create an isolated offscreen iframe to prevent inheriting global styles (which may include oklch)
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.left = '-10000px'
  iframe.style.top = '0'
  iframe.style.width = '210mm'
  iframe.style.height = '297mm'
  iframe.style.visibility = 'hidden'
  document.body.appendChild(iframe)

  try {
    const iframeDoc = iframe.contentDocument as globalThis.Document

    // Minimal CSS reset and enforce simple colors
    const baseCss = `
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
      .page { width: 210mm; min-height: 297mm; padding: 20mm; background: #ffffff; color: #111111; }
      h1,h2,h3,h4,h5,h6 { color: #111111; }
    `

    // Remove classes from the provided HTML to avoid Tailwind-driven computed styles
    const temp = document.createElement('div')
    temp.innerHTML = safeHtml
    temp.querySelectorAll('[class]')?.forEach((el) => (el as HTMLElement).removeAttribute('class'))
    // Also drop style/script tags inside content
    temp.querySelectorAll('style,script').forEach((el) => el.remove())

    iframeDoc.open()
    iframeDoc.write(`<!doctype html><html><head><meta charset="utf-8"><style>${baseCss}</style></head><body>
      <div class="page">${temp.innerHTML}</div>
    </body></html>`)
    iframeDoc.close()

    // Wait for fonts/layout
    await new Promise((res) => setTimeout(res, 50))

    const target = iframeDoc.querySelector('.page') as HTMLElement
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename)
  } finally {
    iframe.remove()
  }
}

export const generateDocx = async (html: string, filename: string) => {
  // Build a structured DOCX from HTML: strip style/script nodes and map common elements
  const container = document.createElement('div')
  container.innerHTML = html

  // Remove style/script so raw CSS is not captured as text
  container.querySelectorAll('style,script').forEach((el) => el.remove())

  const children: Paragraph[] = []

  const pushTextParagraph = (text: string) => {
    const clean = (text || '').replace(/\s+/g, ' ').trim()
    if (clean) children.push(new Paragraph({ children: [new TextRun(clean)] }))
  }

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
        const level = tag === 'h1' ? HeadingLevel.HEADING_1 : tag === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3
        const headingText = (el.textContent || '').replace(/\s+/g, ' ').trim()
        if (headingText) {
          children.push(new Paragraph({ heading: level, children: [new TextRun({ text: headingText, bold: true })] }))
        }
        return
      }

      if (tag === 'p') {
        // Build runs to respect links and bold text
        const runs: TextRun[] = []
        el.childNodes.forEach((n) => {
          if (n.nodeType === Node.ELEMENT_NODE) {
            const ne = n as HTMLElement
            const ntag = ne.tagName.toLowerCase()
            if (ntag === 'a') {
              const a = ne as HTMLAnchorElement
              const t = (a.textContent || a.href).replace(/\s+/g, ' ').trim()
              if (t) runs.push(new TextRun({ text: t, color: '0000EE', underline: {} }))
            } else if (ntag === 'strong' || ntag === 'b') {
              const t = (ne.textContent || '').replace(/\s+/g, ' ').trim()
              if (t) runs.push(new TextRun({ text: t, bold: true }))
            } else if (ntag === 'em' || ntag === 'i') {
              const t = (ne.textContent || '').replace(/\s+/g, ' ').trim()
              if (t) runs.push(new TextRun({ text: t, italics: true }))
            } else {
              const t = (ne.textContent || '').replace(/\s+/g, ' ').trim()
              if (t) runs.push(new TextRun({ text: t }))
            }
          } else if (n.nodeType === Node.TEXT_NODE) {
            const t = (n.textContent || '').replace(/\s+/g, ' ').trim()
            if (t) runs.push(new TextRun({ text: t }))
          }
        })
        if (runs.length) children.push(new Paragraph({ children: runs }))
        return
      }

      if (tag === 'ul' || tag === 'ol') {
        Array.from(el.children).forEach((li) => {
          const text = (li.textContent || '').replace(/\s+/g, ' ').trim()
          if (text) children.push(new Paragraph({ text, bullet: { level: 0 } }))
        })
        return
      }

      // Skip decorative elements like spans/divs and recurse
      el.childNodes.forEach(walk)
      return
    }
    if (node.nodeType === Node.TEXT_NODE) {
      pushTextParagraph(node.textContent || '')
    }
  }

  container.childNodes.forEach(walk)

  const doc = new DocxDocument({ sections: [{ properties: {}, children: children.length ? children : [new Paragraph('')] }] })

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
