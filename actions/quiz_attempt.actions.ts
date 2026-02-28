'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getQuizWithQuestions } from '@/lib/services/quiz.service'

export async function submitQuizAttemptAction(
    courseId: string,
    quizId: string,
    answers: Record<string, string>
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not logged in')
    }

    // 1. Fetch quiz questions to grade
    const quizData = await getQuizWithQuestions(quizId)
    if (!quizData) {
        throw new Error('Quiz not found')
    }
    const { questions } = quizData

    // 2. Grade the answers
    let correctCount = 0
    const attemptAnswersToInsert = questions.map((q) => {
        const studentAnswer = answers[q.id] || ''

        let isCorrect = false
        if (q.question_type === 'MULTIPLE_CHOICE') {
            isCorrect = studentAnswer === q.answer
        } else if (q.question_type === 'SHORT_ANSWER') {
            // Basic string matching, ignoring leading/trailing spaces and case
            isCorrect = studentAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
        }

        if (isCorrect) correctCount++

        return {
            question_id: q.id,
            submitted_answer: studentAnswer,
            is_correct: isCorrect
        }
    })

    const finalScore = Math.round((correctCount / questions.length) * 100)

    // 3. Insert quiz_attempt
    const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
            user_id: user.id,
            quiz_id: quizId,
            score: finalScore,
            completed_at: new Date().toISOString()
        })
        .select()
        .single()

    if (attemptError || !attemptData) {
        console.error('Failed to insert quiz attempt', attemptError)
        throw new Error('Failed to submit quiz attempt')
    }

    // 4. Insert quiz_attempt_answers
    const answersWithAttemptId = attemptAnswersToInsert.map(a => ({
        ...a,
        attempt_id: attemptData.id
    }))

    const { error: answersError } = await supabase
        .from('quiz_attempt_answers')
        .insert(answersWithAttemptId)

    if (answersError) {
        console.error('Failed to insert quiz attempt answers', answersError)
        // Note: In a robust system, we would wrap this in a postgres transaction via an RPC call.
        // For MVP, if it fails here we might have an orphaned attempt, but throw error anyway.
        throw new Error('Failed to save answers')
    }

    // 5. Revalidate
    revalidatePath(`/courses/${courseId}/quizzes/${quizId}`)
    revalidatePath(`/courses/${courseId}/quizzes`)

    return attemptData.id
}
