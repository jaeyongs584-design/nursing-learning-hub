import { createClient } from '../supabase/server'

export type StudyMaterial = {
    id: string
    user_id: string
    course_id: string
    title: string
    source_type: 'FILE' | 'LINK'
    mime_type: string | null
    storage_path: string | null
    original_filename: string | null
    external_url: string | null
    file_size_bytes: number | null
    week_number: number | null
    tags: string[] | null
    created_at: string
}

export async function getMaterialsByCourseId(courseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching course materials:', error)
        return []
    }
    return data as StudyMaterial[]
}
