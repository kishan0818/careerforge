"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { downloadResumePDF, downloadResumeWord } from "@/lib/downloads"

export default function DownloadResumeButtons({ html, fileBaseName }: { html: string; fileBaseName: string }) {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={() => downloadResumeWord(html, `${fileBaseName}.docx`)}>
        <Download className="mr-2 h-4 w-4" />
        Download Word
      </Button>
      <Button onClick={() => downloadResumePDF(html, `${fileBaseName}.pdf`)}>
        <Download className="mr-2 h-4 w-4" />
        Download PDF
      </Button>
    </div>
  )
}
