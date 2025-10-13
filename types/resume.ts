export type Education = {
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: string
  endDate: string
  gpa?: string
  description?: string
}

export type Skill = {
  name: string
  level: number
  category: string
}

export type Project = {
  title: string
  description: string
  technologies: string[]
  startDate: string
  endDate?: string
  url?: string
}

export type Experience = {
  company: string
  position: string
  location?: string
  startDate: string
  endDate?: string
  description: string[]
  achievements?: string[]
}

export type ResumePreferences = {
  preferredTone: 'professional' | 'casual' | 'technical' | 'creative'
  preferredSections: string[]
  theme: 'modern' | 'classic' | 'minimal' | 'bold'
  includeSummary: boolean
  includePhoto: boolean
  includeReferences: boolean
}

export type PersonalInfo = {
  name: string
  email: string
  phone: string
  location?: string
  website?: string
  linkedin?: string
  github?: string
}

export interface FormData {
  personal: PersonalInfo
  summary: string
  education: Education[]
  skills: Skill[]
  projects: Project[]
  experience: Experience[]
  preferences: ResumePreferences
  jobTarget: string
}
