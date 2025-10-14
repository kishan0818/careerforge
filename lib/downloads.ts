"use client"

import { generatePdf, generateDocx } from './resume-export'

// Delegate to sanitized implementations that remove Tailwind classes and replace unsupported oklch() colors
export async function downloadResumePDF(htmlContent: string, fileName: string) {
  await generatePdf(htmlContent, fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`)
}

export async function downloadResumeWord(htmlContent: string, fileName: string) {
  await generateDocx(htmlContent, fileName.endsWith('.docx') ? fileName : `${fileName}.docx`)
}
