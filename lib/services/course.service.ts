import { createClient } from '../supabase/server'

export type Course = {
    id: string
    user_id: string
    semester_id: string | null
    name: string
    professor: string | null
    credit: number | null
    color_code: string | null
    created_at: string
}

export async function getCourses(semesterId?: string) {
    const supabase = await createClient()
    let query = supabase.from('courses').select('*').order('name')

    if (semesterId) {
        query = query.eq('semester_id', semesterId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching courses:', error)
        return []
    }
    return data as Course[]
}
