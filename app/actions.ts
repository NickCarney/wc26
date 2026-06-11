'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export type FormState = {
  success?: boolean
  error?: string
}

export async function savePicks(_prev: FormState, formData: FormData): Promise<FormState> {
  const pick = {
    username: (formData.get('username') as string).trim(),
    winner: formData.get('winner') as string,
    biggest_surprise: formData.get('biggest_surprise') as string,
    biggest_disappointment: formData.get('biggest_disappointment') as string,
    golden_boot: formData.get('golden_boot') as string,
    top_assister: formData.get('top_assister') as string,
    golden_glove: formData.get('golden_glove') as string,
    golden_ball: formData.get('golden_ball') as string,
    highest_scoring_team: formData.get('highest_scoring_team') as string,
    young_player: formData.get('young_player') as string,
  }

  for (const [key, value] of Object.entries(pick)) {
    if (!value) return { error: `Missing answer for: ${key.replace(/_/g, ' ')}` }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from('picks').insert([pick])

  if (error) {
    if (error.code === '23505') return { error: 'That username is already taken.' }
    return { error: error.message }
  }
  return { success: true }
}
