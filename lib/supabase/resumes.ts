import { supabase } from '@/lib/supabaseClient'

export const saveResume = async (resume: {
  id: string
  user_id: string
  title: string
  content: string
  data: any
  created_at: string
  type?: 'resume'
  pdf_url?: string | null
}) => {
  const { data, error } = await supabase
    .from('resumes')
    .upsert(resume)
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
