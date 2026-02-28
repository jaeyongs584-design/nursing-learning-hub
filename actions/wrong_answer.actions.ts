'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveWrongAnswerAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    const id = formData.get('id') as string
    const course_id = formData.get('course_id') as string
    const question = formData.get('question') as string
    const my_answer = formData.get('my_answer') as string
    const correct_answer = formData.get('correct_answer') as string
    const reason = formData.get('reason') as string
    const explanation = formData.get('explanation') as string
    const rawTags = formData.get('tags') as string

    if (!course_id || !question) {
        return { error: 'Course ID and Question are required' }
    }

    // Process tags (comma separated simple string to array)
    let tagsArray: string[] | null = null
    if (rawTags) {
        tagsArray = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0)
    }

    const payload = {
        user_id: user.id,
        course_id,
        question,
        my_answer: my_answer || null,
        correct_answer: correct_answer || null,
        reason: reason || null,
        explanation: explanation || null,
        tags: tagsArray && tagsArray.length > 0 ? tagsArray : null
    }

    if (id) {
        // Update
        const { error } = await supabase
            .from('wrong_answer_notes')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('Wrong answer update error:', error)
            return { error: 'Failed to update wrong answer' }
        }
    } else {
        // Insert
        const { error } = await supabase
            .from('wrong_answer_notes')
            .insert([payload])

        if (error) {
            console.error('Wrong answer insert error:', error)
            return { error: 'Failed to create wrong answer' }
        }
    }

    revalidatePath(`/courses/${course_id}/wrong-answers`)
    return { success: true }
}

export async function deleteWrongAnswerAction(id: string, courseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('wrong_answer_notes')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete wrong answer error:', error)
        return { error: 'Failed to delete wrong answer' }
    }

    revalidatePath(`/courses/${courseId}/wrong-answers`)
    return { success: true }
}
