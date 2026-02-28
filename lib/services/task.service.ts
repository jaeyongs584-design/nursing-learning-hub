import { createClient } from '../supabase/server'

export type Task = {
    id: string
    user_id: string
    course_id: string | null
    title: string
    description: string | null
    due_date: string | null
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | null
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | null
    created_at: string
}

export async function getRecentTasks(limit: number = 5) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      course:courses(name, color_code)
    `)
        .neq('status', 'DONE')
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching recent tasks:', error)
        return []
    }
    return data
}

export async function getAllTasksForCalendar(year: number, month: number) {
    const supabase = await createClient()
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString()

    const { data, error } = await supabase
        .from('tasks')
        .select(`
      *,
      course:courses(name, color_code)
    `)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .order('due_date', { ascending: true })

    if (error) {
        console.error('Error fetching calendar tasks:', error)
        return []
    }
    return data
}

export async function getTasksByCourseId(courseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true })

    if (error) {
        console.error('Error fetching course tasks:', error)
        return []
    }
    return data as Task[]
}
