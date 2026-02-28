import { createClient } from '@/lib/supabase/server'
import { Course } from './course.service'

export async function getCourseById(courseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single()

    if (error) {
        console.error('Error fetching course by id:', error)
        return null
    }
    return data as Course
}
