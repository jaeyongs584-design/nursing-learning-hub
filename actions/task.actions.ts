'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTaskAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string | null
    const course_id = formData.get('course_id') as string | null
    const priority = formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH' || 'MEDIUM'
    const due_date = formData.get('due_date') as string | null

    if (!title) {
        return { error: 'Title is required' }
    }

    const { error } = await supabase
        .from('tasks')
        .insert({
            user_id: user.id,
            title,
            description,
            course_id: course_id || null,
            priority,
            due_date: due_date || null,
            status: 'TODO'
        })

    if (error) {
        console.error('Create task error:', error)
        return { error: 'Failed to create task' }
    }

    if (course_id) {
        revalidatePath(`/courses/${course_id}`)
        revalidatePath(`/courses/${course_id}/tasks`)
    }
    revalidatePath('/dashboard')
    revalidatePath('/tasks')

    return { success: true }
}

export async function updateTaskStatusAction(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE', courseId?: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)

    if (error) {
        console.error('Update task status error:', error)
        return { error: 'Failed to update task status' }
    }

    if (courseId) {
        revalidatePath(`/courses/${courseId}`)
        revalidatePath(`/courses/${courseId}/tasks`)
    }
    revalidatePath('/dashboard')
    revalidatePath('/tasks')

    return { success: true }
}

export async function deleteTaskAction(id: string, courseId?: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete task error:', error)
        return { error: 'Failed to delete task' }
    }

    if (courseId) {
        revalidatePath(`/courses/${courseId}`)
        revalidatePath(`/courses/${courseId}/tasks`)
    }
    revalidatePath('/dashboard')
    revalidatePath('/tasks')

    return { success: true }
}
