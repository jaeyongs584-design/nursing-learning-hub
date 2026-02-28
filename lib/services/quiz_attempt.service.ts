import { createClient } from '../supabase/server'
import type { Quiz, QuizQuestion } from './quiz.service'

export interface QuizAttempt {
    id: string
    user_id: string
    quiz_id: string
    score: number | null
    started_at: string
    completed_at: string | null
}

export interface QuizAttemptAnswer {
    id: string
    attempt_id: string
    question_id: string
    submitted_answer: string | null
    is_correct: boolean | null
}

export interface QuizAttemptDetail extends QuizAttempt {
    answers: (QuizAttemptAnswer & { question: QuizQuestion })[]
}

export async function getQuizAttempts(quizId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })

    if (error) {
        console.error('Error fetching quiz attempts:', error)
        return []
    }

    return data as QuizAttempt[]
}

export async function getQuizAttemptDetail(attemptId: string) {
    const supabase = await createClient()

    // Fetch attempt
    const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('id', attemptId)
        .single()

    if (attemptError || !attemptData) return null

    // Fetch answers with questions
    const { data: answersData, error: answersError } = await supabase
        .from('quiz_attempt_answers')
        .select(`
            *,
            question:quiz_questions (*)
        `)
        .eq('attempt_id', attemptId)

    if (answersError) return null

    return {
        ...attemptData,
        answers: answersData || []
    } as QuizAttemptDetail
}
