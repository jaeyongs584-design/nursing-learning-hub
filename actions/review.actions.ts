'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getNextReviewDate } from '@/lib/services/review.service'

// ── 복습 결과 처리 ──

export async function reviewItemAction(
    itemId: string,
    result: 'know' | 'unsure' | 'forgot'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Authentication required' }

    // Get current item
    const { data: item, error: fetchErr } = await supabase
        .from('review_items')
        .select('*')
        .eq('id', itemId)
        .single()

    if (fetchErr || !item) return { error: 'Item not found' }

    let newBox = item.box
    let nextReviewAt: string

    switch (result) {
        case 'know':
            // box +1 (max 5), next = Leitner interval
            newBox = Math.min(item.box + 1, 5)
            nextReviewAt = getNextReviewDate(newBox)
            break
        case 'unsure':
            // 유지, next = +3일
            nextReviewAt = getNextReviewDate(2) // box 2 = 3일
            break
        case 'forgot':
            // box=1, next = 내일
            newBox = 1
            nextReviewAt = getNextReviewDate(1) // box 1 = 1일
            break
    }

    const { error } = await supabase
        .from('review_items')
        .update({
            box: newBox,
            next_review_at: nextReviewAt,
            last_reviewed_at: new Date().toISOString(),
        })
        .eq('id', itemId)

    if (error) return { error: 'Failed to update review' }

    revalidatePath('/review')
    revalidatePath('/dashboard')
    return { success: true, newBox, nextReviewAt }
}

// ── 오답에서 복습 항목 자동 등록 ──

export async function createReviewItemFromWrongNote(
    wrongNoteId: string,
    courseId: string | null
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Auth required' }

    // 중복 방지
    const { data: existing } = await supabase
        .from('review_items')
        .select('id')
        .eq('source_type', 'wrong_note')
        .eq('source_id', wrongNoteId)
        .single()

    if (existing) return { success: true, id: existing.id }

    const { data, error } = await supabase
        .from('review_items')
        .insert({
            user_id: user.id,
            course_id: courseId,
            source_type: 'wrong_note',
            source_id: wrongNoteId,
            box: 1,
            next_review_at: new Date().toISOString().split('T')[0],
        })
        .select('id')
        .single()

    if (error) return { error: error.message }
    return { success: true, id: data?.id }
}

// ── 암기카드에서 복습 등록 ──

export async function createReviewItemFromFlashcard(
    noteId: string,
    courseId: string | null
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Auth required' }

    const { data: existing } = await supabase
        .from('review_items')
        .select('id')
        .eq('source_type', 'flashcard')
        .eq('source_id', noteId)
        .single()

    if (existing) return { success: true, id: existing.id }

    const { data, error } = await supabase
        .from('review_items')
        .insert({
            user_id: user.id,
            course_id: courseId,
            source_type: 'flashcard',
            source_id: noteId,
            box: 1,
            next_review_at: new Date().toISOString().split('T')[0],
        })
        .select('id')
        .single()

    if (error) return { error: error.message }
    return { success: true, id: data?.id }
}
