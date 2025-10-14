"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Navbar from "@/app/components/navbar"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toaster } from "@/components/ui/toaster"
import { FormProvider } from "@/contexts/form-context"
import { FormData } from "@/types/resume"
import ResumePreviewModal from "@/components/resume-preview-modal"
import { saveResume } from "@/lib/supabase/resumes"
import { v4 as uuidv4 } from 'uuid'
import StepForm from "@/app/components/step-form"
import { supabase } from "@/lib/supabaseClient"
import ReCAPTCHA from "react-google-recaptcha"

const isComplete = (data: FormData) => {
  return (
    data.personal?.name && data.personal?.email && data.jobTarget &&
    Array.isArray(data.education) && data.education.length > 0 && !!data.education[0].institution && !!data.education[0].degree &&
    Array.isArray(data.skills) && data.skills.length > 0 && !!data.skills[0].name &&
    Array.isArray(data.experience) && data.experience.length > 0 && !!data.experience[0].company && !!data.experience[0].position &&
    Array.isArray(data.projects) && data.projects.length > 0 && !!data.projects[0].title
  )
}

const initialFormData: FormData = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: ""
  },
  summary: "",
  education: [{
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    gpa: "",
    description: ""
  }],
  skills: [{
    name: "",
    level: 3,
    category: "Technical"
  }],
  projects: [{
    title: "",
    description: "",
    technologies: [],
    startDate: "",
    endDate: "",
    url: ""
  }],
  experience: [{
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    description: [''],
    achievements: []
  }],
  preferences: {
    preferredTone: "professional",
    preferredSections: ["summary", "skills", "experience", "education", "projects"],
    theme: "modern",
    includeSummary: true,
    includePhoto: false,
    includeReferences: false
  },
  jobTarget: ""
}

export default function DashboardPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initialFormData)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [resumeContent, setResumeContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  // Prefill preferences and job target from profile
  useEffect(() => {
    (async () => {
      try {
        const { data: auth } = await supabase.auth.getUser()
        const userId = auth.user?.id
        if (!userId) return
        const res = await fetch('/api/preferences/get', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        })
        if (!res.ok) return
        const json = await res.json()
        const prefs = json?.prefs
        if (prefs) {
          setForm(prev => ({
            ...prev,
            jobTarget: prefs.job_target || prev.jobTarget,
            preferences: {
              ...prev.preferences,
              preferredTone: (prefs.tone?.toLowerCase?.() || prev.preferences.preferredTone),
              theme: (prefs.template_style?.toLowerCase?.() || prev.preferences.theme),
            }
          }))
        }
      } catch {
        // ignore
      }
    })()
  }, [])

  const handleGenerateResume = async (formData: FormData) => {
    console.log('[Generate] handler invoked');
    try {
      setIsGenerating(true)
      // Validate completeness (warn only, do not block generation)
      if (!isComplete(formData)) {
        console.log('[Generate] form incomplete');
        toast({ title: 'Incomplete form', description: 'Some sections are empty. Generating with available information.' , variant: 'destructive'})
      }

      // Verify captcha (warn-only in dev; proceed regardless)
      if (!captchaToken) {
        console.log('[Generate] missing captcha token');
        toast({ title: 'Robot check', description: 'Proceeding without reCAPTCHA (dev mode).', variant: 'destructive' })
      } else {
        try {
          const verify = await fetch('/api/recaptcha/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: captchaToken })
          })
          const vjson = await verify.json().catch(() => ({}))
          if (!verify.ok || !vjson?.ok) {
            console.log('[Generate] captcha verify failed', { status: verify.status, body: vjson })
            toast({ title: 'Robot check failed', description: 'Proceeding without verification (dev mode).', variant: 'destructive' })
          }
        } catch (e) {
          console.log('[Generate] captcha verify error', e)
          toast({ title: 'Robot check error', description: 'Proceeding without verification (dev mode).', variant: 'destructive' })
        }
      }

      // Call API to generate resume via Mistral
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id

      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId, captchaToken }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const json = await res.json()
      const generatedResume: string = json?.content || ''

      // Save to Supabase (non-blocking for preview)
      if (userId) {
        const resumeId = uuidv4()
        try {
          await saveResume({
            id: resumeId,
            user_id: userId,
            title: formData.jobTarget || 'My Resume',
            content: generatedResume,
            created_at: new Date().toISOString(),
          })
        } catch (e) {
          console.error('Error saving resume:', e)
          // continue; preview should still open
        }
      }

      setResumeContent(generatedResume)
      setIsPreviewOpen(true)
      
    } catch (error) {
      console.error('Error generating resume:', error)
      toast({
        title: "Error",
        description: "Failed to generate resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <FormProvider initialData={initialFormData}>
      <div className="min-h-dvh">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Resume Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <StepForm 
                form={form}
                setForm={setForm}
                onSubmit={() => handleGenerateResume(form)}
                finalActions={
                  <div className="flex flex-col items-start gap-4 relative">
                    {/* Floating action button to guarantee clickability above any overlays/iframes */}
                    <Button
                      className="fixed bottom-6 right-6 z-[2147483647] shadow-lg"
                      type="button"
                      onClick={() => { alert('Generate clicked'); console.log('[Generate] button clicked'); handleGenerateResume(form) }}
                      disabled={isGenerating}
                    >
                      {isGenerating ? 'Generating...' : 'Generate Resume'}
                    </Button>
                    <div className="relative z-0 pointer-events-auto">
                      <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                        onChange={(token) => setCaptchaToken(token)}
                      />
                    </div>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </main>
      </div>

      <ResumePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={resumeContent}
      />

      <Toaster />
    </FormProvider>
  )
}