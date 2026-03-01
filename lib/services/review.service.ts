// review.service.ts — review_items 테이블 기반 Leitner 복습 서비스

import { createClient } from '../supabase/server'

export type ReviewItem = {
    id: string
    user_id: string
    course_id: string | null
    source_type: 'wrong_note' | 'flashcard' | 'note'
    source_id: string
    box: number
    next_review_at: string
    last_reviewed_at: string | null
    status: 'active' | 'suspended'
    created_at: string
    // joined data
    courseName?: string
    question?: string
    correctAnswer?: string
    explanation?: string
    title?: string
}

// Leitner intervals (일) — box 1~5
const LEITNER_INTERVALS: Record<number, number> = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 }

export function getNextReviewDate(box: number, fromDate: Date = new Date()): string {
    const d = new Date(fromDate)
    d.setDate(d.getDate() + (LEITNER_INTERVALS[box] || 1))
    return d.toISOString().split('T')[0]
}

// ────────────────── 쿼리 ──────────────────

export async function getReviewSummary() {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
        .from('review_items')
        .select('id, next_review_at, status')
        .eq('status', 'active')

    const items = data || []
    const overdue = items.filter(i => i.next_review_at < today).length
    const todayCount = items.filter(i => i.next_review_at === today).length
    const upcoming = items.filter(i => i.next_review_at > today).length

    return { overdue, today: todayCount, upcoming, total: items.length }
}

export async function getReviewSchedule() {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Get review_items with wrong_answer info
    const { data: items } = await supabase
        .from('review_items')
        .select('*, courses(name)')
        .eq('status', 'active')
        .order('next_review_at', { ascending: true })

    if (!items) return []

    // Enrich with source data
    const enriched: ReviewItem[] = []

    for (const item of items) {
        const base: ReviewItem = {
            ...item,
            // @ts-ignore
            courseName: item.courses?.name || '과목 미지정',
        }

        if (item.source_type === 'wrong_note') {
            const { data: wn } = await supabase
                .from('wrong_answer_notes')
                .select('question, correct_answer, explanation')
                .eq('id', item.source_id)
                .single()
            if (wn) {
                base.question = wn.question
                base.correctAnswer = wn.correct_answer
                base.explanation = wn.explanation
            }
        } else if (item.source_type === 'flashcard') {
            // Flashcard sourced from notes.ai_flashcards
            const { data: note } = await supabase
                .from('notes')
                .select('title, ai_flashcards')
                .eq('id', item.source_id)
                .single()
            if (note) {
                base.title = note.title || '암기카드'
            }
        }

        enriched.push(base)
    }

    return enriched
}

export async function getReviewItemsForSession(
    filter: 'all' | 'overdue' | 'today' | string
): Promise<ReviewItem[]> {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
        .from('review_items')
        .select('*, courses(name)')
        .eq('status', 'active')

    if (filter === 'overdue') {
        query = query.lt('next_review_at', today)
    } else if (filter === 'today') {
        query = query.eq('next_review_at', today)
    } else if (filter === 'all') {
        query = query.lte('next_review_at', today)
    } else {
        // courseId filter
        query = query.eq('course_id', filter).lte('next_review_at', today)
    }

    const { data: items } = await query.order('next_review_at').limit(20)
    if (!items) return []

    // Enrich
    const enriched: ReviewItem[] = []
    for (const item of items) {
        const base: ReviewItem = {
            ...item,
            // @ts-ignore
            courseName: item.courses?.name || '과목 미지정',
        }

        if (item.source_type === 'wrong_note') {
            const { data: wn } = await supabase
                .from('wrong_answer_notes')
                .select('question, correct_answer, explanation')
                .eq('id', item.source_id)
                .single()
            if (wn) {
                base.question = wn.question
                base.correctAnswer = wn.correct_answer
                base.explanation = wn.explanation
            }
        }

        enriched.push(base)
    }

    return enriched
}
