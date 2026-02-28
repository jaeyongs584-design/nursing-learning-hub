import { createClient } from '../supabase/server'

export type CourseSchedule = {
    id: string
    user_id: string
    course_id: string
    day_of_week: number // 0=일, 1=월, ..., 6=토
    start_time: string  // "09:00:00"
    end_time: string    // "10:30:00"
    location: string | null
    memo: string | null
    created_at: string
    course?: { name: string; color_code: string | null; professor: string | null }
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export function getDayName(dayOfWeek: number) {
    return DAY_NAMES[dayOfWeek] || ''
}

export async function getWeeklySchedule() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('course_schedules')
        .select(`
            *,
            course:courses(name, color_code, professor)
        `)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

    if (error) {
        console.error('Error fetching weekly schedule:', error)
        return []
    }
    return data as CourseSchedule[]
}

export async function getTodaySchedule() {
    const supabase = await createClient()
    const todayDow = new Date().getDay() // 0=Sunday

    const { data, error } = await supabase
        .from('course_schedules')
        .select(`
            *,
            course:courses(name, color_code, professor)
        `)
        .eq('day_of_week', todayDow)
        .order('start_time', { ascending: true })

    if (error) {
        console.error('Error fetching today schedule:', error)
        return []
    }
    return data as CourseSchedule[]
}

export async function getSchedulesByCourseId(courseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('course_schedules')
        .select('*')
        .eq('course_id', courseId)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })

    if (error) {
        console.error('Error fetching course schedules:', error)
        return []
    }
    return data as CourseSchedule[]
}
