import { createClient } from '../supabase/server'

export type Quiz = {
    id: string
    user_id: string
    course_id: string
    title: string
    description: string | null
    source_type: 'MANUAL' | 'AI_GENERATED' | null
    created_at: string
    updated_at: string
}

export type QuizQuestion = {
    id: string
    quiz_id: string
    question_text: string
    question_type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | null
    options: string[] | null // JSONB array of strings
    answer: string
    explanation: string | null
}

export async function getQuizzesByCourseId(courseId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching quizzes:', error)
        return []
    }
    return data as Quiz[]
}

export async function getQuizWithQuestions(quizId: string) {
    const supabase = await createClient()

    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

    if (quizError || !quiz) {
        console.error('Error fetching quiz info:', quizError)
        return null
    }

    const { data: questions, error: qError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('id', { ascending: true }) // simplest order

    if (qError) {
        console.error('Error fetching questions:', qError)
        return { quiz: quiz as Quiz, questions: [] }
    }

    return {
        quiz: quiz as Quiz,
        questions: questions as QuizQuestion[]
    }
}
