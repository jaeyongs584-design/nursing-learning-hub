'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveNoteAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    const id = formData.get('id') as string // Optional: if update
    const course_id = formData.get('course_id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const note_type = formData.get('note_type') as 'STUDY' | 'SUMMARY'
    const material_id = formData.get('material_id') as string || null
    const tags = formData.getAll('tags') as string[] // Simplistic way if tags passed

    if (!course_id || !title) {
        return { error: 'Course ID and Title are required' }
    }

    const payload = {
        user_id: user.id,
        course_id,
        title,
        content,
        note_type: note_type || 'STUDY',
        material_id: material_id || null,
        // tags: tags.length > 0 ? tags : null, // Tags can be complex with FormData. Skip for MVP
    }

    if (id) {
        // Update
        const { error } = await supabase
            .from('notes')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id) // security check

        if (error) {
            console.error('Note update error:', error)
            return { error: 'Failed to update note' }
        }
    } else {
        // Insert
        const { error } = await supabase
            .from('notes')
            .insert([payload])

        if (error) {
            console.error('Note insert error:', error)
            return { error: 'Failed to create note' }
        }
    }

    revalidatePath(`/courses/${course_id}/notes`)
    revalidatePath(`/dashboard`)

    return { success: true }
}

export async function deleteNoteAction(id: string, courseId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Delete note error:', error)
        return { error: 'Failed to delete note' }
    }

    revalidatePath(`/courses/${courseId}/notes`)
    revalidatePath(`/dashboard`)
    return { success: true }
}
