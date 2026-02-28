'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateQuiz } from '@/lib/ai'

export async function generateAIQuizAction(inputText: string, count: number = 5) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, data: null, error: 'Authentication required', provider: 'none', generatedAt: new Date().toISOString() }

    return await generateQuiz(inputText, count)
}

export async function createQuizAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    const course_id = formData.get('course_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title || !course_id) {
        return { error: 'Title and Course ID are required' }
    }

    const { data, error } = await supabase
        .from('quizzes')
        .insert([{
            user_id: user.id,
            course_id,
            title,
            description: description || null,
            source_type: 'MANUAL'
        }])
        .select()
        .single()

    if (error || !data) {
        console.error('Create quiz error:', error)
        return { error: 'Failed to create quiz' }
    }

    revalidatePath(`/courses/${course_id}/quizzes`)
    return { success: true, quizId: data.id }
}

export async function deleteQuizAction(id: string, courseId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Delete quiz error:', error)
        return { error: 'Failed to delete quiz' }
    }

    revalidatePath(`/courses/${courseId}/quizzes`)
    return { success: true }
}

export async function addQuizQuestionAction(
    quizId: string,
    questionText: string,
    type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER',
    options: string[],
    answer: string,
    explanation: string
) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('quiz_questions')
        .insert([{
            quiz_id: quizId,
            question_text: questionText,
            question_type: type,
            options: type === 'MULTIPLE_CHOICE' ? JSON.stringify(options) : null,
            answer,
            explanation: explanation || null
        }])

    if (error) {
        console.error('Add question error:', error)
        return { error: 'Failed to add question' }
    }

    revalidatePath(`/quizzes/${quizId}`)
    return { success: true }
}

export async function saveAIQuizAction(
    courseId: string,
    title: string,
    questions: { question: string; options: string[]; answer: string; explanation: string }[]
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    // 1. 퀴즈 생성
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert([{
            user_id: user.id,
            course_id: courseId,
            title,
            description: `AI가 자동 생성한 퀴즈 (${questions.length}문항)`,
            source_type: 'AI_GENERATED'
        }])
        .select()
        .single()

    if (quizError || !quiz) {
        console.error('Create AI quiz error:', quizError)
        return { error: 'Failed to create quiz' }
    }

    // 2. 문제 일괄 삽입
    const questionRows = questions.map(q => ({
        quiz_id: quiz.id,
        question_text: q.question,
        question_type: 'MULTIPLE_CHOICE' as const,
        options: JSON.stringify(q.options),
        answer: q.answer,
        explanation: q.explanation || null
    }))

    const { error: qError } = await supabase
        .from('quiz_questions')
        .insert(questionRows)

    if (qError) {
        console.error('Insert AI quiz questions error:', qError)
        return { error: 'Failed to save questions' }
    }

    revalidatePath(`/courses/${courseId}/quizzes`)
    return { success: true, quizId: quiz.id }
}

