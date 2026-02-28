'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createScheduleAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Authentication required' }

    const course_id = formData.get('course_id') as string
    const day_of_week = parseInt(formData.get('day_of_week') as string)
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string
    const location = formData.get('location') as string | null
    const memo = formData.get('memo') as string | null

    if (!course_id || isNaN(day_of_week) || !start_time || !end_time) {
        return { error: 'Required fields missing' }
    }

    const { error } = await supabase
        .from('course_schedules')
        .insert({
            user_id: user.id,
            course_id,
            day_of_week,
            start_time,
            end_time,
            location: location || null,
            memo: memo || null,
        })

    if (error) {
        console.error('Create schedule error:', error)
        return { error: 'Failed to create schedule' }
    }

    revalidatePath('/timetable')
    revalidatePath('/dashboard')
    revalidatePath(`/courses/${course_id}`)
    return { success: true }
}

export async function deleteScheduleAction(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('course_schedules')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete schedule error:', error)
        return { error: 'Failed to delete schedule' }
    }

    revalidatePath('/timetable')
    revalidatePath('/dashboard')
    return { success: true }
}
