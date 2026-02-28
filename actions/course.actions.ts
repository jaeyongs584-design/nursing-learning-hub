import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSemester(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const startDate = formData.get('start_date') as string
    const endDate = formData.get('end_date') as string

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not logged in')
    }

    // Deactivate others if this is the first one or we want it active
    const { error } = await supabase
        .from('semesters')
        .insert({
            user_id: user.id,
            name,
            start_date: startDate || null,
            end_date: endDate || null,
            is_active: true // For MVP, newly created semesters are active
        })

    if (error) {
        console.error('Failed to create semester', error)
        throw new Error('Failed to create semester')
    }

    revalidatePath('/courses')
    revalidatePath('/dashboard')
}

export async function createCourse(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const professor = formData.get('professor') as string
    const credit = parseInt(formData.get('credit') as string)
    const semesterId = formData.get('semester_id') as string

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not logged in')
    }

    const { error } = await supabase
        .from('courses')
        .insert({
            user_id: user.id,
            semester_id: semesterId || null,
            name,
            professor: professor || null,
            credit: isNaN(credit) ? null : credit,
        })

    if (error) {
        console.error('Failed to create course', error)
        throw new Error('Failed to create course')
    }

    revalidatePath('/courses')
}
