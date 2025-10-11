"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

type FormData = {
  name: string
  email: string
  phone: string
  summary: string
  education: string
  skills: string
  projects: string
  experience: string
  jobTarget: string
}

export default function StepForm({
  form,
  setForm,
}: {
  form: FormData
  setForm: (next: FormData) => void
}) {
  const steps = [
    { id: "personal", label: "Personal" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "target", label: "Job Target" },
  ] as const

  const [idx, setIdx] = useState(0)
  const pct = useMemo(() => ((idx + 1) / steps.length) * 100, [idx, steps.length])
  const go = (n: number) => setIdx(Math.min(Math.max(n, 0), steps.length - 1))

  const field = (label: string, key: keyof FormData, props?: React.ComponentProps<typeof Input>) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Input
        value={form[key] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="bg-card"
        {...props}
      />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Step header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Step {idx + 1} of {steps.length}
        </div>
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to ${s.label}`}
              className={`h-2 w-8 rounded-full transition-colors ${i <= idx ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>
      <Progress value={pct} className="h-2" />

      {/* Step body */}
      <div className="rounded-md border border-border bg-card/70 p-4 space-y-4">
        {steps[idx].id === "personal" && (
          <div className="grid gap-4">
            {field("Name", "name")}
            {field("Email", "email", { type: "email" })}
            {field("Phone", "phone")}
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary</label>
              <Textarea
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="bg-card"
                rows={3}
              />
            </div>
          </div>
        )}

        {steps[idx].id === "education" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Education</label>
            <Textarea
              placeholder={"Institution, degree, year, GPA"}
              value={form.education}
              onChange={(e) => setForm({ ...form, education: e.target.value })}
              className="bg-card"
              rows={4}
            />
          </div>
        )}

        {steps[idx].id === "skills" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Skills</label>
            <Input
              placeholder={"e.g., JavaScript, React, SQL (comma separated)"}
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              className="bg-card"
            />
          </div>
        )}

        {steps[idx].id === "projects" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Projects</label>
            <Textarea
              placeholder={"Title, description, technologies"}
              value={form.projects}
              onChange={(e) => setForm({ ...form, projects: e.target.value })}
              className="bg-card"
              rows={4}
            />
          </div>
        )}

        {steps[idx].id === "experience" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Experience</label>
            <Textarea
              placeholder={"Company, role, duration, achievements"}
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="bg-card"
              rows={4}
            />
          </div>
        )}

        {steps[idx].id === "target" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role/Domain</label>
            <Input
              placeholder="e.g., Data Analyst"
              value={form.jobTarget}
              onChange={(e) => setForm({ ...form, jobTarget: e.target.value })}
              className="bg-card"
            />
          </div>
        )}
      </div>

      {/* Nav controls */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => go(idx - 1)} disabled={idx === 0}>
          Previous
        </Button>
        <Button onClick={() => go(idx + 1)} disabled={idx === steps.length - 1}>
          Next
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Your inputs stay on this page. Use the Generate panel to create documents anytime.
      </p>
    </div>
  )
}
