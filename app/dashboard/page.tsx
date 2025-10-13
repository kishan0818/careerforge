// "use client"

// import { useEffect, useState } from "react"
// import { useRouter } from "next/navigation"
// import { createClient } from "@/lib/supabase/client"
// import { useAuth } from "@/components/providers/auth-provider"
// import { Button } from "@/components/ui/button"
// import { useToast } from "@/components/ui/use-toast"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Toaster } from "@/components/ui/toaster"
// import { generateResume } from "@/lib/actions"
// import { verifyRecaptcha } from "@/lib/recaptcha"
// import { FormProvider } from "@/contexts/form-context"
// import { FormData } from "@/types/resume"
// import ResumePreviewModal from "@/components/resume-preview-modal"
// import { saveResume } from "@/lib/supabase/resumes"
// import { v4 as uuidv4 } from 'uuid'
// import Navbar from "@/app/components/navbar"
// import DocumentCard from "@/app/components/document-card"
// import LoadingAnimation from "@/app/components/loading-animation"
// import Recaptcha from "@/app/components/recaptcha"

// const initialFormData: FormData = {
//   personal: {
//     name: "",
//     email: "",
//     phone: "",
//     location: "",
//     website: "",
//     linkedin: "",
//     github: ""
//   },
//   summary: "",
//   education: [{
//     institution: "",
//     degree: "",
//     fieldOfStudy: "",
//     startDate: "",
//     endDate: "",
//     gpa: "",
//     description: ""
//   }],
//   skills: [{
//     name: "",
//     level: 3,
//     category: "Technical"
//   }],
//   projects: [{
//     title: "",
//     description: "",
//     technologies: [],
//     startDate: "",
//     endDate: "",
//     url: ""
//   }],
//   experience: [{
//     company: "",
//     position: "",
//     location: "",
//     startDate: "",
//     endDate: "",
//     description: [''],
//     achievements: []
//   }],
//   preferences: {
//     preferredTone: "professional",
//     preferredSections: ["summary", "skills", "experience", "education", "projects"],
//     theme: "modern",
//     includeSummary: true,
//     includePhoto: false,
//     includeReferences: false
//   },
//   jobTarget: ""
// }

// export default function DashboardPage() {
//   const router = useRouter()
//   const { user } = useAuth()
//   const [recaptchaToken, setRecaptchaToken] = useState("")
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false)
//   const [resumeContent, setResumeContent] = useState("")
//   const [isGenerating, setIsGenerating] = useState(false)
//   const { toast } = useToast()

 

//   const handleGenerateResume = async (formData: FormData) => {
//         ...prev,
//         personal: {
//           ...prev.personal,
//           name: u.full_name || "",
//           email: u.email || ""
//         }
//       }))
      
//       // upsert user record
//       try {
//         await fetch("/api/user-upsert", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ 
//             auth_id: u.id, 
//             full_name: u.full_name, 
//             email: u.email 
//           }),
//         })
//       } catch (error) {
//         console.error("Failed to upsert user:", error)
//       }
//     })()
//   }, [router])

//   const disabled = useMemo(() => loading !== null, [loading])

//   const onGenerate = async () => {
//     if (disabled) return
//     if (!recaptchaToken) {
//       toast.error("Please complete the reCAPTCHA")
//       return
//     }
    
//     const ok = await verifyRecaptcha(recaptchaToken)
//     if (!ok) {
//       toast.error("reCAPTCHA verification failed")
//       return
//     }
    
//     try {
//       setLoading("resume")
//       const userId = await getCurrentUserId()
      
//       // Prepare resume data with user preferences
//       const resumeData = {
//         ...form,
//         userId,
//         preferences: {
//           ...form.preferences,
//           // Ensure required preferences have defaults
//           preferredTone: form.preferences?.preferredTone || 'professional',
//           theme: form.preferences?.theme || 'modern'
//         }
//       }
      
//       // Generate the resume
//       const res = await generateResume(resumeData)
//       setResults({ resume: res })
//       toast.success("Resume generated successfully!")
      
//       // Save to user's documents if logged in
//       if (userId) {
//         try {
//           const safeTitle = (form.jobTarget || 'resume').replace(/[^a-z0-9\-]+/gi, '_')
//           const fileName = `${Date.now()}-${safeTitle}.html`
//           const up = await fetch('/api/upload-generated', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ 
//               userId, 
//               fileName, 
//               content: res, 
//               contentType: 'text/html',
//               metadata: {
//                 jobTarget: form.jobTarget,
//                 generatedAt: new Date().toISOString(),
//                 preferences: form.preferences
//               }
//             }),
//           })
          
//           if (!up.ok) throw new Error('Failed to save resume')
//           toast.success('Resume saved to your documents')
          
//         } catch (error) {
//           console.error('Error saving resume:', error)
//           toast.error('Generated resume but failed to save')
//         }
//       }
      
//     } catch (e: any) {
//       console.error('Generation error:', e)
//       toast.error(e?.message || "Failed to generate resume. Please try again.")
//     } finally {
//       setLoading(null)
//     }
//   }

//   const heroName = (form.personal.name?.split(" ")[0] || "there")

//   return (
//     <div className="min-h-dvh">
//       <Navbar />
//       <main className="mx-auto max-w-6xl p-6 space-y-6">
//         <section className="rounded-xl border border-border bg-card/70 backdrop-blur-md p-6">
//           <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr] items-center">
//             <div className="space-y-2">
//               <h1 className="text-2xl md:text-3xl font-semibold text-balance">
//                 Hi {heroName}! Let's build your professional resume.
//               </h1>
//               <p className="text-muted-foreground">
//                 Create an AI-optimized, ATS-friendly resume that stands out to recruiters and hiring managers.
//               </p>
//             </div>
//             <div className="justify-self-end hidden md:block">
//               <img
//                 src="/resume-illustration.svg"
//                 alt="Resume illustration"
//                 className="max-h-28"
//               />
//             </div>
//           </div>
//         </section>

//         <section className="grid md:grid-cols-3 gap-6">
//           <div className="md:col-span-2">
//             <Card className="bg-card/70 backdrop-blur-md h-full">
//               <CardHeader>
//                 <CardTitle>Resume Builder</CardTitle>
//                 <p className="text-sm text-muted-foreground">
//                   Fill in your details to create a professional resume
//                 </p>
//               </CardHeader>
//               <CardContent>
//                 <StepForm form={form} setForm={setForm} />
//               </CardContent>
//             </Card>
//           </div>

//           <div className="space-y-6">
//             <Card className="bg-card/70 backdrop-blur-md">
//               <CardHeader>
//                 <CardTitle>Generate Resume</CardTitle>
//                 <p className="text-sm text-muted-foreground">
//                   Generate and preview your AI-optimized resume
//                 </p>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Recaptcha
//                     siteKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
//                     onChange={(token) => setRecaptchaToken(token)}
//                   />
//                 </div>

//                 <Button
//                   className="w-full bg-primary text-primary-foreground h-12 text-base"
//                   onClick={onGenerate}
//                   disabled={disabled}
//                 >
//                   {loading ? (
//                     <LoadingAnimation label="Generating..." />
//                   ) : (
//                     <>
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         width="20"
//                         height="20"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         className="mr-2"
//                       >
//                         <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
//                         <path d="m16 5 5 5" />
//                         <path d="m21 5-5 5" />
//                       </svg>
//                       Generate Resume
//                     </>
//                   )}
//                 </Button>

//                 <div className="text-xs text-muted-foreground space-y-2">
//                   <p>✅ AI-optimized content</p>
//                   <p>✅ ATS-friendly format</p>
//                   <p>✅ Professional design</p>
//                   <p>✅ Download as PDF or Word</p>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="bg-card/70 backdrop-blur-md">
//               <CardHeader>
//                 <CardTitle>Resume Preview</CardTitle>
//                 <p className="text-sm text-muted-foreground">
//                   Your generated resume will appear here
//                 </p>
//               </CardHeader>
//               <CardContent className="min-h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
//                 {results.resume ? (
//                   <div className="w-full">
//                     <div className="aspect-[1/1.4142] w-full max-w-md mx-auto bg-white shadow-lg rounded-md overflow-hidden">
//                       <iframe
//                         srcDoc={results.resume}
//                         className="w-full h-full border-0"
//                         title="Generated Resume Preview"
//                       />
//                     </div>
//                     <div className="mt-4 flex gap-2 justify-center">
//                       <Button variant="outline" size="sm">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           className="mr-2"
//                         >
//                           <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                           <polyline points="7 10 12 15 17 10" />
//                           <line x1="12" y1="15" x2="12" y2="3" />
//                         </svg>
//                         Download PDF
//                       </Button>
//                       <Button variant="outline" size="sm">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           className="mr-2"
//                         >
//                           <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
//                           <polyline points="14 2 14 8 20 8" />
//                           <line x1="16" y1="13" x2="8" y2="13" />
//                           <line x1="16" y1="17" x2="8" y2="17" />
//                           <line x1="10" y1="9" x2="8" y2="9" />
//                         </svg>
//                         Download Word
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center text-muted-foreground p-6">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       width="48"
//                       height="48"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="1.5"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       className="mx-auto mb-4 text-muted-foreground/30"
//                     >
//                       <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
//                       <polyline points="14 2 14 8 20 8" />
//                       <line x1="16" y1="13" x2="8" y2="13" />
//                       <line x1="16" y1="17" x2="8" y2="17" />
//                       <line x1="10" y1="9" x2="8" y2="9" />
//                     </svg>
//                     <p>Your generated resume will appear here</p>
//                     <p className="text-xs mt-2">Fill in your details and click "Generate Resume"</p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//       </main>
//     </div>
//   )
// }


"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
    try {
      setIsGenerating(true)
      
      // Call API to generate resume via Mistral
      const { data: auth } = await supabase.auth.getUser()
      const userId = auth.user?.id

      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const json = await res.json()
      const generatedResume: string = json?.content || ''

      // Save to Supabase
      if (userId) {
        const resumeId = uuidv4()
        await saveResume({
          id: resumeId,
          user_id: userId,
          title: formData.jobTarget || 'My Resume',
          content: generatedResume,
          data: formData,
          created_at: new Date().toISOString(),
          type: 'resume',
          pdf_url: null,
        })
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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Resume Builder</CardTitle>
          </CardHeader>
          <CardContent>
            <StepForm 
              form={form}
              setForm={setForm}
              onSubmit={() => handleGenerateResume(form)}
            />
            <div className="flex justify-end pt-4">
              <Button onClick={() => handleGenerateResume(form)} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Resume'}
              </Button>
            </div>
          </CardContent>
        </Card>
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