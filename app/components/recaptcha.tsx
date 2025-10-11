"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    grecaptcha?: any
  }
}

export default function Recaptcha({ siteKey, onChange }: { siteKey: string; onChange: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!siteKey) return

    const render = () => {
      if (!window.grecaptcha || !containerRef.current) return
      try {
        window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => onChange(token || ""),
        })
      } catch {}
    }

    if (window.grecaptcha) {
      render()
      return
    }

    const script = document.createElement("script")
    script.src = "https://www.google.com/recaptcha/api.js"
    script.async = true
    script.defer = true
    script.onload = render
    document.body.appendChild(script)

    return () => {
      // no cleanup required for script in this simple case
    }
  }, [siteKey, onChange])

  return <div ref={containerRef} className="g-recaptcha" />
}
