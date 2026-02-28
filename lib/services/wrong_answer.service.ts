import { createClient } from '../supabase/server'

export type WrongAnswerNote = {
    id: string
    user_id: string
    course_id: string
    question: string
    correct_answer: string | null
    my_answer: string | null
    explanation: string | null
    reason: string | null
    tags: string[] | null
    created_at: string
    updated_at: string
}

export async function getWrongAnswersByCourseId(courseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('wrong_answer_notes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching wrong answers:', error)
        return []
    }
    return data as WrongAnswerNote[]
}
