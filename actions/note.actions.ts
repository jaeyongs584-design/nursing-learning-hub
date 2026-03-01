'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateAISummary, generateQuiz } from '@/lib/ai'
import { redirect } from 'next/navigation'

export async function saveNoteAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    const id = formData.get('id') as string
    const course_id = formData.get('course_id') as string
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const note_type = formData.get('note_type') as 'STUDY' | 'SUMMARY'
    const material_id = formData.get('material_id') as string || null

    if (!course_id || !title) {
        return { error: 'Course ID and Title are required' }
    }

    const payload = {
        user_id: user.id,
        course_id,
        title,
        content,
        note_type: note_type || 'STUDY',
        material_id: material_id || null,
    }

    if (id) {
        const { error } = await supabase
            .from('notes')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) return { error: 'Failed to update note' }
    } else {
        const { error } = await supabase
            .from('notes')
            .insert([payload])

        if (error) return { error: 'Failed to create note' }
    }

    revalidatePath(`/courses/${course_id}/notes`)
    revalidatePath(`/dashboard`)
    return { success: true }
}

export async function deleteNoteAction(id: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Authentication required' }

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: 'Failed to delete note' }

    revalidatePath(`/courses/${courseId}/notes`)
    revalidatePath(`/dashboard`)
    return { success: true }
}

// ── 시간표 → 노트 자동 생성 ──

export async function createNoteFromScheduleAction(courseId: string, sessionId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Auth required' }

    const { data: course } = await supabase
        .from('courses')
        .select('name')
        .eq('id', courseId)
        .single()

    const today = new Date()
    const dateStr = `${today.getMonth() + 1}/${today.getDate()}`
    const title = `${course?.name || '수업'} 노트 — ${dateStr}`

    const { data, error } = await supabase
        .from('notes')
        .insert({
            user_id: user.id,
            course_id: courseId,
            session_id: sessionId || null,
            title,
            content: '',
            note_type: 'STUDY',
            study_date: today.toISOString().split('T')[0],
        })
        .select('id')
        .single()

    if (error) return { error: 'Failed to create note' }

    revalidatePath(`/courses/${courseId}/notes`)
    revalidatePath('/dashboard')
    return { success: true, noteId: data.id, courseId }
}

// ── 노트 AI 요약 생성 (3줄요약, 핵심5, 시험포인트5, 암기카드10) ──

export async function generateNoteAISummaryAction(noteId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Auth required' }

    // Get note content
    const { data: note } = await supabase
        .from('notes')
        .select('id, content, course_id')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single()

    if (!note || !note.content) return { error: '노트 내용이 없습니다. 먼저 내용을 입력하세요.' }

    const result = await generateAISummary(note.content)
    if (!result.ok || !result.data) return { error: result.error || 'AI 요약 생성에 실패했습니다.' }

    // Save to notes table
    const { error } = await supabase
        .from('notes')
        .update({
            ai_summary: JSON.stringify(result.data.threeLine),
            ai_keypoints: result.data.keyConcepts,
            ai_exam_points: result.data.examPoints,
            ai_flashcards: result.data.flashCards,
            ai_generated_at: new Date().toISOString(),
        })
        .eq('id', noteId)

    if (error) return { error: 'AI 결과 저장 실패' }

    revalidatePath(`/courses/${note.course_id}/notes/${noteId}`)
    return { success: true, data: result.data }
}

// ── 노트 기반 퀴즈 생성 (객관식7 + 단답형3) ──

export async function generateQuizFromNoteAction(noteId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Auth required' }

    const { data: note } = await supabase
        .from('notes')
        .select('id, title, content, course_id')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .single()

    if (!note || !note.content) return { error: '노트 내용이 없습니다.' }

    const result = await generateQuiz(note.content, 10)
    if (!result.ok || !result.data) return { error: result.error || '퀴즈 생성 실패' }

    // Create quiz
    const { data: quiz, error: quizErr } = await supabase
        .from('quizzes')
        .insert({
            user_id: user.id,
            course_id: note.course_id,
            note_id: noteId,
            title: `${note.title} — 퀴즈`,
            source_type: 'AI_GENERATED',
        })
        .select('id')
        .single()

    if (quizErr || !quiz) return { error: '퀴즈 저장 실패' }

    // Create questions
    const questions = result.data.questions.map(q => ({
        quiz_id: quiz.id,
        question_text: q.questionText,
        question_type: q.questionType === 'MULTIPLE_CHOICE' ? 'MULTIPLE_CHOICE' : 'SHORT_ANSWER',
        options: q.options || null,
        answer: q.answer,
        explanation: q.explanation,
    }))

    const { error: qErr } = await supabase
        .from('quiz_questions')
        .insert(questions)

    if (qErr) return { error: '문제 저장 실패' }

    revalidatePath(`/courses/${note.course_id}/quizzes`)
    return { success: true, quizId: quiz.id, courseId: note.course_id }
}
