import { supabase } from '@/lib/supabaseClient'

export const saveResume = async (resume: {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  type?: 'resume'
  pdf_url?: string | null
}) => {
  const payload: Record<string, any> = {
    id: resume.id,
    user_id: resume.user_id,
    title: resume.title,
    content: resume.content,
    created_at: resume.created_at,
  }
  if (typeof resume.type !== 'undefined') payload.type = resume.type
  if (typeof resume.pdf_url !== 'undefined') payload.pdf_url = resume.pdf_url

  const { data, error } = await supabase
    .from('resumes')
    .upsert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error saving resume:', error)
    throw error
  }

  return data
}

export const getUserResumes = async (userId: string) => {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching resumes:', error)
    throw error
  }

  return data
}

export const deleteResume = async (id: string) => {
  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting resume:', error)
    throw error
  }
}
