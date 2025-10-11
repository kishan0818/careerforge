"use client"

export default function LoadingAnimation({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="text-sm">{label || "Loading..."}</span>
    </div>
  )
}
