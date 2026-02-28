import { createClient } from '../supabase/server'
import { StudyMaterial } from './material.service'

export type Note = {
    id: string
    user_id: string
    course_id: string
    material_id: string | null
    note_type: 'STUDY' | 'SUMMARY' | null
    title: string | null
    content: string | null
    study_date: string | null
    tags: string[] | null
    created_at: string
    updated_at: string
    material?: StudyMaterial // Joined optionally
}

export async function getNotesByCourseId(courseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            material:study_materials(id, title, source_type)
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching course notes:', error)
        return []
    }
    return data as Note[]
}

export async function getNoteById(id: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('notes')
        .select(`*`)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching note by id:', error)
        return null
    }
    return data as Note
}
