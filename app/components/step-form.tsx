"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus, Trash2 } from "lucide-react"
import { 
  FormData, 
  Education, 
  Skill, 
  Project, 
  Experience, 
  ResumePreferences,
  PersonalInfo
} from "@/types/resume"

type StepFormProps = {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  onSubmit?: () => void
}

// Helper type for array fields
type ArrayField<T> = T extends (infer U)[] ? U : never

// Type guards for form data
const isEducation = (item: any): item is ArrayField<FormData['education']> => 
  'institution' in item && 'degree' in item

const isSkill = (item: any): item is ArrayField<FormData['skills']> => 
  'name' in item && 'level' in item

const isProject = (item: any): item is ArrayField<FormData['projects']> => 
  'title' in item && 'description' in item

const isExperience = (item: any): item is ArrayField<FormData['experience']> => 
  'company' in item && 'position' in item

export default function StepForm({ form, setForm, onSubmit }: StepFormProps) {
  const steps = [
    { id: "personal", label: "Personal" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "projects", label: "Projects" },
    { id: "preferences", label: "Preferences" },
  ] as const

  const [idx, setIdx] = useState(0)
  const pct = useMemo(() => ((idx + 1) / steps.length) * 100, [idx, steps.length])
  const go = (n: number) => setIdx(Math.min(Math.max(n, 0), steps.length - 1))

  const handleArrayChange = <T extends keyof FormData>(
    field: T,
    index: number,
    value: FormData[T] extends Array<infer U> ? Partial<U> : never
  ) => {
    setForm((prev) => {
      const newArray = [...(prev[field] as any[])]
      newArray[index] = { ...newArray[index], ...value }
      return { ...prev, [field]: newArray }
    })
  }

  const addArrayItem = <T extends keyof FormData>(
    field: T, 
    defaultValue: FormData[T] extends Array<infer U> ? U : never
  ) => {
    setForm((prev) => {
      const currentArray = Array.isArray(prev[field]) ? prev[field] : [];
      return {
        ...prev,
        [field]: [...currentArray, defaultValue],
      };
    });
  };

  const removeArrayItem = <T extends keyof FormData>(
    field: T, 
    index: number
  ) => {
    setForm((prev) => {
      const currentArray = Array.isArray(prev[field]) ? prev[field] : [];
      return {
        ...prev,
        [field]: currentArray.filter((_, i) => i !== index),
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle nested personal fields
    if (name.startsWith('personal.')) {
      const field = name.split('.')[1] as keyof PersonalInfo;
      setForm(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          [field]: value
        }
      }));
      return;
    }
    
    // Handle preferences fields
    if (name.startsWith('preferences.')) {
      const field = name.split('.')[1] as keyof ResumePreferences;
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: field === 'preferredSections' 
            ? (e.target as HTMLInputElement).checked
              ? [...prev.preferences.preferredSections, (e.target as HTMLInputElement).value]
              : prev.preferences.preferredSections.filter(s => s !== (e.target as HTMLInputElement).value)
            : field === 'includeSummary' || field === 'includePhoto' || field === 'includeReferences'
            ? (e.target as HTMLInputElement).checked
            : value
        }
      }));
      return;
    }

    // Handle direct fields
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  const removeItem = (section: 'education' | 'skills' | 'experience' | 'projects', index: number) => {
    setForm(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_: any, i: number) => i !== index)
    }))
  }

  const updateField = (section: keyof FormData, field: string, value: any, index?: number) => {
    if (index !== undefined) {
      // Handle array fields (education, skills, experience, projects)
      setForm(prev => ({
        ...prev,
        [section]: (prev[section] as any[]).map((item: any, i: number) => 
          i === index ? { ...item, [field]: value } : item
        )
      }))
    } else if (section === 'personal') {
      // Handle personal info
      setForm(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          [field]: value
        }
      }))
    } else if (section === 'preferences') {
      // Handle preferences
      setForm(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [field]: value
        }
      }))
    } else {
      // Handle top-level fields
      setForm(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const addItem = (section: 'education' | 'skills' | 'experience' | 'projects') => {
    const newItem = {
      ...(section === 'education' ? {
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        gpa: '',
        description: ''
      } : section === 'skills' ? {
        name: '',
        level: 3,
        category: 'Technical'
      } : section === 'experience' ? {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: [''],
        achievements: []
      } : {
        title: '',
        description: '',
        technologies: [],
        startDate: '',
        endDate: '',
        url: ''
      })
    }

    setForm(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }))
  }


  const addDescription = (index: number) => {
    setForm(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index 
          ? { ...exp, description: [...exp.description, ''] } 
          : exp
      )
    }))
  }

  const updateDescription = (expIndex: number, descIndex: number, value: string) => {
    setForm(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex
          ? {
              ...exp,
              description: exp.description.map((d, j) => 
                j === descIndex ? value : d
              )
            }
          : exp
      )
    }))
  }

  const removeDescription = (expIndex: number, descIndex: number) => {
    setForm(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === expIndex
          ? {
              ...exp,
              description: exp.description.filter((_, j) => j !== descIndex)
            }
          : exp
      )
    }))
  }

  const renderPersonalStep = () => (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <Input
            value={form.personal.name}
            onChange={(e) => updateField('personal', 'name', e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={form.personal.email}
            onChange={(e) => updateField('personal', 'email', e.target.value)}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input
            value={form.personal.phone}
            onChange={(e) => updateField('personal', 'phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Input
            value={form.personal.location || ''}
            onChange={(e) => updateField('personal', 'location', e.target.value)}
            placeholder="City, Country"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">LinkedIn</label>
          <Input
            value={form.personal.linkedin || ''}
            onChange={(e) => updateField('personal', 'linkedin', e.target.value)}
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">GitHub</label>
          <Input
            value={form.personal.github || ''}
            onChange={(e) => updateField('personal', 'github', e.target.value)}
            placeholder="github.com/username"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Professional Summary</label>
        <Textarea
          value={form.summary}
          onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
          placeholder="A passionate and results-driven professional with X years of experience in..."
          className="min-h-[100px]"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Job Title</label>
        <Input
          value={form.jobTarget}
          onChange={(e) => setForm(prev => ({ ...prev, jobTarget: e.target.value }))}
          placeholder="e.g., Senior Software Engineer"
        />
      </div>
    </div>
  )

  const renderEducationStep = () => (
    <div className="space-y-4">
      {form.education.map((edu, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Education #{index + 1}</h4>
            {form.education.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem('education', index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Institution*</label>
              <Input
                value={edu.institution}
                onChange={(e) => updateField('education', 'institution', e.target.value, index)}
                placeholder="University Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Degree*</label>
              <Input
                value={edu.degree}
                onChange={(e) => updateField('education', 'degree', e.target.value, index)}
                placeholder="Bachelor of Science"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Field of Study</label>
              <Input
                value={edu.fieldOfStudy}
                onChange={(e) => updateField('education', 'fieldOfStudy', e.target.value, index)}
                placeholder="Computer Science"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GPA</label>
              <Input
                value={edu.gpa || ''}
                onChange={(e) => updateField('education', 'gpa', e.target.value, index)}
                placeholder="3.8/4.0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date*</label>
              <Input
                type="month"
                value={edu.startDate}
                onChange={(e) => updateField('education', 'startDate', e.target.value, index)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date (or expected)</label>
              <Input
                type="month"
                value={edu.endDate || ''}
                onChange={(e) => updateField('education', 'endDate', e.target.value, index)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={edu.description || ''}
              onChange={(e) => updateField('education', 'description', e.target.value, index)}
              placeholder="Relevant coursework, honors, or achievements"
              className="min-h-[80px]"
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addItem('education')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  )

  const renderSkillsStep = () => (
    <div className="space-y-4">
      {form.skills.map((skill, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Skill #{index + 1}</h4>
            {form.skills.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem('skills', index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Skill Name*</label>
              <Input
                value={skill.name}
                onChange={(e) => updateField('skills', 'name', e.target.value, index)}
                placeholder="e.g., React, Python, Project Management"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={skill.category}
                onChange={(e) => updateField('skills', 'category', e.target.value, index)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Technical">Technical</option>
                <option value="Soft">Soft Skills</option>
                <option value="Language">Language</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Proficiency Level</label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateField('skills', 'level', level, index)}
                    className={`h-3 w-full rounded-sm ${
                      level <= skill.level ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-label={`Level ${level}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-2">
                  {['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][skill.level - 1]}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addItem('skills')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Skill
      </Button>
    </div>
  )

  const renderExperienceStep = () => (
    <div className="space-y-4">
      {form.experience.map((exp, expIndex) => (
        <div key={expIndex} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">
              Experience #{expIndex + 1} {exp.position && `- ${exp.position}`}
            </h4>
            {form.experience.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem('experience', expIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title*</label>
              <Input
                value={exp.position}
                onChange={(e) => updateField('experience', 'position', e.target.value, expIndex)}
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company*</label>
              <Input
                value={exp.company}
                onChange={(e) => updateField('experience', 'company', e.target.value, expIndex)}
                placeholder="Company Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                value={exp.location || ''}
                onChange={(e) => updateField('experience', 'location', e.target.value, expIndex)}
                placeholder="City, Country"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date*</label>
                <Input
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => updateField('experience', 'startDate', e.target.value, expIndex)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="month"
                  value={exp.endDate || ''}
                  onChange={(e) => updateField('experience', 'endDate', e.target.value, expIndex)}
                  placeholder="Present"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Responsibilities & Achievements</label>
            <div className="space-y-2">
              {exp.description.map((desc, descIndex) => (
                <div key={descIndex} className="flex items-start space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <Textarea
                    value={desc}
                    onChange={(e) => updateDescription(expIndex, descIndex, e.target.value)}
                    placeholder="Describe your responsibilities and achievements"
                    className="flex-1 min-h-[60px]"
                  />
                  {exp.description.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDescription(expIndex, descIndex)}
                      className="mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addDescription(expIndex)}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Responsibility
              </Button>
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addItem('experience')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  )

  const renderProjectsStep = () => (
    <div className="space-y-4">
      {form.projects.map((project, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Project #{index + 1}</h4>
            {form.projects.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem('projects', index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Project Name*</label>
                <Input
                  value={project.title}
                  onChange={(e) => updateField('projects', 'title', e.target.value, index)}
                  placeholder="e.g., E-commerce Website"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project URL</label>
                <Input
                  value={project.url || ''}
                  onChange={(e) => updateField('projects', 'url', e.target.value, index)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="month"
                  value={project.startDate || ''}
                  onChange={(e) => updateField('projects', 'startDate', e.target.value, index)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="month"
                  value={project.endDate || ''}
                  onChange={(e) => updateField('projects', 'endDate', e.target.value, index)}
                  placeholder="Present"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tech Stack</label>
              <div className="space-y-2">
                {(project.technologies || []).map((tech: string, tIndex: number) => (
                  <div key={tIndex} className="flex gap-2">
                    <Input
                      value={tech}
                      onChange={(e) => {
                        const next = [...(project.technologies || [])]
                        next[tIndex] = e.target.value
                        updateField('projects', 'technologies', next, index)
                      }}
                      placeholder="e.g., React"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const next = (project.technologies || []).filter((_: string, i: number) => i !== tIndex)
                        updateField('projects', 'technologies', next, index)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateField('projects', 'technologies', [...(project.technologies || []), ''], index)}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Technology
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description*</label>
              <Textarea
                value={project.description}
                onChange={(e) => updateField('projects', 'description', e.target.value, index)}
                placeholder="Describe the project, your role, and key achievements"
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addItem('projects')}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Project
      </Button>
    </div>
  )

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="font-medium">Resume Style</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Tone</label>
            <select
              value={form.preferences.preferredTone}
              onChange={(e) => updateField('preferences', 'preferredTone', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="professional">Professional</option>
              <option value="technical">Technical</option>
              <option value="creative">Creative</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color Theme</label>
            <select
              value={form.preferences.theme}
              onChange={(e) => updateField('preferences', 'theme', e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Content Options</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.preferences.includeSummary}
              onChange={(e) => updateField('preferences', 'includeSummary', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Include Professional Summary</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.preferences.includePhoto}
              onChange={(e) => updateField('preferences', 'includePhoto', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Include Profile Photo</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.preferences.includeReferences}
              onChange={(e) => updateField('preferences', 'includeReferences', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Include References Section</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Sections to Include</h3>
        <div className="space-y-2">
          {['summary', 'skills', 'experience', 'education', 'projects', 'certifications', 'languages', 'volunteer'].map((section) => (
            <label key={section} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.preferences.preferredSections.includes(section)}
                onChange={(e) => {
                  const newSections = e.target.checked
                    ? [...form.preferences.preferredSections, section]
                    : form.preferences.preferredSections.filter(s => s !== section)
                  updateField('preferences', 'preferredSections', newSections)
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium capitalize">{section}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStepContent = () => {
    switch (steps[idx].id) {
      case 'personal':
        return renderPersonalStep()
      case 'education':
        return renderEducationStep()
      case 'skills':
        return renderSkillsStep()
      case 'experience':
        return renderExperienceStep()
      case 'projects':
        return renderProjectsStep()
      case 'preferences':
        return renderPreferencesStep()
      default:
        return null
    }
  }

  return (
    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit?.() }}>
      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            {steps[idx].label} <span className="text-muted-foreground">({idx + 1}/{steps.length})</span>
          </h3>
          <div className="text-sm text-muted-foreground">
            {idx > 0 && (
              <button
                type="button"
                onClick={() => go(idx - 1)}
                className="hover:text-foreground"
              >
                Previous
              </button>
            )}
            {idx < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => go(idx + 1)}
                className="ml-4 text-primary hover:underline"
              >
                Next: {steps[idx + 1].label} →
              </button>
            ) : (
              <span className="ml-4 text-primary">Final Step</span>
            )}
          </div>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {/* Step content */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        {renderStepContent()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => go(idx - 1)}
          disabled={idx === 0}
        >
          ← Previous
        </Button>
        {idx < steps.length - 1 ? (
          <Button type="button" onClick={() => go(idx + 1)}>
            Next: {steps[idx + 1].label} →
          </Button>
        ) : (
          <Button type="submit" className="bg-primary">
            Generate Resume
          </Button>
        )}
      </div>
    </form>
  )
}
