'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getQuizWithQuestions } from '@/lib/services/quiz.service'
import { createReviewItemFromWrongNote } from '@/actions/review.actions'

export async function submitQuizAttemptAction(
    courseId: string,
    quizId: string,
    answers: Record<string, string>
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not logged in')

    const quizData = await getQuizWithQuestions(quizId)
    if (!quizData) throw new Error('Quiz not found')
    const { questions } = quizData

    // Grade the answers
    let correctCount = 0
    const attemptAnswersToInsert = questions.map((q) => {
        const studentAnswer = answers[q.id] || ''
        let isCorrect = false
        if (q.question_type === 'MULTIPLE_CHOICE') {
            isCorrect = studentAnswer === q.answer
        } else if (q.question_type === 'SHORT_ANSWER') {
            isCorrect = studentAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
        }
        if (isCorrect) correctCount++
        return { question_id: q.id, submitted_answer: studentAnswer, is_correct: isCorrect }
    })

    const finalScore = Math.round((correctCount / questions.length) * 100)

    // Insert quiz_attempt
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

    if (attemptError || !attemptData) throw new Error('Failed to submit quiz attempt')

    // Insert quiz_attempt_answers
    const answersWithAttemptId = attemptAnswersToInsert.map(a => ({
        ...a,
        attempt_id: attemptData.id
    }))

    const { error: answersError } = await supabase
        .from('quiz_attempt_answers')
        .insert(answersWithAttemptId)

    if (answersError) throw new Error('Failed to save answers')

    // ── 🆕 오답 자동 저장 + 복습 등록 ──
    const wrongAnswerRows = attemptAnswersToInsert
        .filter(a => !a.is_correct)
        .map(a => {
            const q = questions.find(q => q.id === a.question_id)!
            return {
                user_id: user.id,
                course_id: courseId,
                question: q.question_text,
                correct_answer: q.answer,
                my_answer: a.submitted_answer,
                explanation: q.explanation || '',
                reason: '퀴즈에서 오답',
                source_type: 'quiz_attempt',
                source_id: attemptData.id,
            }
        })

    if (wrongAnswerRows.length > 0) {
        const { data: insertedWrongs } = await supabase
            .from('wrong_answer_notes')
            .insert(wrongAnswerRows)
            .select('id')

        // Register each wrong note for Leitner review
        if (insertedWrongs) {
            for (const wn of insertedWrongs) {
                await createReviewItemFromWrongNote(wn.id, courseId)
            }
        }
    }

    revalidatePath(`/courses/${courseId}/quizzes/${quizId}`)
    revalidatePath(`/courses/${courseId}/quizzes`)
    revalidatePath('/review')
    revalidatePath('/dashboard')

    return attemptData.id
}
