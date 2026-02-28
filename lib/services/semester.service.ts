import { createClient } from '../supabase/server'

export type Semester = {
    id: string
    user_id: string
    name: string
    start_date: string | null
    end_date: string | null
    is_active: boolean
    created_at: string
}

export async function getSemesters() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching semesters:', error)
        return []
    }
    return data as Semester[]
}

export async function getActiveSemester() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('semesters')
        .select('*')
        .eq('is_active', true)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching active semester:', error)
    }
    return data as Semester | null
}
