"use client"

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { FormData, Education, Skill, Project, Experience } from '@/types/resume'

type FormAction =
  | { type: 'UPDATE_PERSONAL'; field: keyof FormData['personal']; value: any }
  | { type: 'UPDATE_PREFERENCES'; field: keyof FormData['preferences']; value: any }
  | { type: 'UPDATE_FIELD'; field: string; value: any }
  | { type: 'ADD_EDUCATION'; education: Education }
  | { type: 'UPDATE_EDUCATION'; index: number; field: keyof Education; value: any }
  | { type: 'REMOVE_EDUCATION'; index: number }
  | { type: 'ADD_SKILL'; skill: Skill }
  | { type: 'UPDATE_SKILL'; index: number; field: keyof Skill; value: any }
  | { type: 'REMOVE_SKILL'; index: number }
  | { type: 'ADD_EXPERIENCE'; experience: Experience }
  | { type: 'UPDATE_EXPERIENCE'; index: number; field: keyof Experience; value: any }
  | { type: 'ADD_EXPERIENCE_DESCRIPTION'; index: number; description: string }
  | { type: 'REMOVE_EXPERIENCE'; index: number }
  | { type: 'ADD_PROJECT'; project: Project }
  | { type: 'UPDATE_PROJECT'; index: number; field: keyof Project; value: any }
  | { type: 'REMOVE_PROJECT'; index: number }

const FormContext = createContext<{
  form: FormData
  dispatch: React.Dispatch<FormAction>
} | undefined>(undefined)

const formReducer = (state: FormData, action: FormAction): FormData => {
  switch (action.type) {
    case 'UPDATE_PERSONAL':
      return {
        ...state,
        personal: {
          ...state.personal,
          [action.field]: action.value,
        },
      }

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          [action.field]: action.value,
        },
      }

    case 'UPDATE_FIELD':
      return {
        ...state,
        [action.field]: action.value,
      }

    case 'ADD_EDUCATION':
      return {
        ...state,
        education: [...state.education, action.education],
      }

    case 'UPDATE_EDUCATION':
      return {
        ...state,
        education: state.education.map((edu, i) =>
          i === action.index ? { ...edu, [action.field]: action.value } : edu
        ),
      }

    case 'REMOVE_EDUCATION':
      return {
        ...state,
        education: state.education.filter((_, i) => i !== action.index),
      }

    case 'ADD_SKILL':
      return {
        ...state,
        skills: [...state.skills, action.skill],
      }

    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: state.skills.map((skill, i) =>
          i === action.index ? { ...skill, [action.field]: action.value } : skill
        ),
      }

    case 'REMOVE_SKILL':
      return {
        ...state,
        skills: state.skills.filter((_, i) => i !== action.index),
      }

    case 'ADD_EXPERIENCE':
      return {
        ...state,
        experience: [...state.experience, action.experience],
      }

    case 'UPDATE_EXPERIENCE':
      return {
        ...state,
        experience: state.experience.map((exp, i) =>
          i === action.index ? { ...exp, [action.field]: action.value } : exp
        ),
      }

    case 'ADD_EXPERIENCE_DESCRIPTION':
      return {
        ...state,
        experience: state.experience.map((exp, i) =>
          i === action.index
            ? { ...exp, description: [...exp.description, action.description] }
            : exp
        ),
      }

    case 'REMOVE_EXPERIENCE':
      return {
        ...state,
        experience: state.experience.filter((_, i) => i !== action.index),
      }

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.project],
      }

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project, i) =>
          i === action.index ? { ...project, [action.field]: action.value } : project
        ),
      }

    case 'REMOVE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((_, i) => i !== action.index),
      }

    default:
      return state
  }
}

export const FormProvider = ({
  children,
  initialData,
}: {
  children: ReactNode
  initialData: FormData
}) => {
  const [form, dispatch] = useReducer(formReducer, initialData)

  return (
    <FormContext.Provider value={{ form, dispatch }}>
      {children}
    </FormContext.Provider>
  )
}

export const useForm = () => {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
}
