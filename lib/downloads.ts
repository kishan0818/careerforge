"use client"

import type html2pdfType from 'html2pdf.js'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

// Lazy-load html2pdf.js to reduce initial bundle size
async function getHtml2Pdf(): Promise<typeof html2pdfType> {
  const mod = await import('html2pdf.js')
  return (mod.default || (mod as any)) as typeof html2pdfType
}

// Create a print-ready container that mirrors the on-screen HTML while avoiding unsupported color spaces
function buildPrintableContainer(htmlContent: string): HTMLElement {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = '794px' // ~ A4 width at 96 DPI
  container.style.padding = '32px'
  container.style.background = '#ffffff'
  container.style.color = '#111827'
  container.style.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

  // Replace oklch() with safe color to avoid html2canvas issues through html2pdf
  const safeHtml = htmlContent.replace(/oklch\([^)]*\)/g, '#111827')
  container.innerHTML = safeHtml

  // For dark mode, force light background in the print node
  container.querySelectorAll('*').forEach((el) => {
    const node = el as HTMLElement
    node.style.backgroundColor = node.style.backgroundColor || ''
    node.style.color = node.style.color || ''
  })

  document.body.appendChild(container)
  return container
}

export async function downloadResumePDF(htmlContent: string, fileName: string) {
  const html2pdf = await getHtml2Pdf()
  const node = buildPrintableContainer(htmlContent)

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      } as any)
      .from(node)
      .save()
  } finally {
    node.remove()
  }
}

// Basic HTML -> DOCX conversion for common resume content
export async function downloadResumeWord(htmlContent: string, fileName: string) {
  const container = document.createElement('div')
  container.innerHTML = htmlContent

  const paragraphs: Paragraph[] = []

  const toRuns = (text: string) => [new TextRun({ text })]

  const walk = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      const tag = el.tagName.toLowerCase()

      if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
        const level = tag === 'h1' ? HeadingLevel.HEADING_1 : tag === 'h2' ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3
        paragraphs.push(
          new Paragraph({ heading: level, children: [new TextRun({ text: el.textContent || '', bold: true })] })
        )
        return
      }

      if (tag === 'p') {
        // Handle links as blue + underline text runs
        if (el.querySelector('a')) {
          const runs: TextRun[] = []
          el.childNodes.forEach((n) => {
            if (n.nodeType === Node.ELEMENT_NODE && (n as HTMLElement).tagName.toLowerCase() === 'a') {
              const a = n as HTMLAnchorElement
              runs.push(
                new TextRun({ text: a.textContent || a.href, color: '0000EE', underline: {} })
              )
            } else if (n.nodeType === Node.TEXT_NODE) {
              const t = (n.textContent || '').replace(/\s+/g, ' ')
              if (t.trim()) runs.push(new TextRun({ text: t }))
            }
          })
          paragraphs.push(new Paragraph({ children: runs }))
        } else {
          paragraphs.push(new Paragraph({ children: toRuns(el.textContent || '') }))
        }
        return
      }

      if (tag === 'ul' || tag === 'ol') {
        Array.from(el.children).forEach((li) => {
          const text = (li.textContent || '').trim()
          if (text) paragraphs.push(new Paragraph({ text, bullet: { level: 0 } }))
        })
        return
      }

      // Recurse
      el.childNodes.forEach(walk)
      return
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent || '').trim()
      if (text) paragraphs.push(new Paragraph({ children: toRuns(text) }))
    }
  }

  container.childNodes.forEach(walk)

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length ? paragraphs : [new Paragraph('')],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName.endsWith('.docx') ? fileName : `${fileName}.docx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
