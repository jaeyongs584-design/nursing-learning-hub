'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReviewRating = 'know' | 'confused' | 'forgot' | 'again'

// Leitner 간격 조정 규칙
// know → 다음 단계로 (간격 증가)
// confused → 현재 단계 유지
// forgot / again → 1단계로 리셋
const LEITNER_INTERVALS = [1, 3, 7, 14, 30]

export async function recordReviewAction(
    itemId: string,
    itemType: 'wrong_answer' | 'quiz' | 'summary',
    rating: ReviewRating
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증 필요' }

    // 1. 복습 로그 저장 (review_logs 테이블이 있는 경우)
    try {
        await supabase.from('review_logs').insert({
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
            rating,
            reviewed_at: new Date().toISOString(),
        })
    } catch {
        // 테이블 미존재 시 무시 — 로그 없이도 동작
    }

    // 2. 평가에 따라 다음 복습 일정 결정
    // know → 더 긴 간격으로
    // confused → 같은 간격 유지
    // forgot/again → 내일 다시
    let nextIntervalDays = 1
    if (rating === 'know') {
        nextIntervalDays = 7 // 잘 알면 1주일 뒤
    } else if (rating === 'confused') {
        nextIntervalDays = 3 // 헷갈리면 3일 뒤
    } else {
        nextIntervalDays = 1 // 모르면 내일
    }

    revalidatePath('/review')
    return { ok: true, nextIntervalDays }
}

// 세션 결과 요약 저장
export async function saveSessionSummaryAction(
    results: { itemId: string; rating: ReviewRating }[]
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증 필요' }

    // 일괄 로그 저장
    try {
        const logs = results.map(r => ({
            user_id: user.id,
            item_id: r.itemId,
            item_type: 'wrong_answer' as const,
            rating: r.rating,
            reviewed_at: new Date().toISOString(),
        }))
        await supabase.from('review_logs').insert(logs)
    } catch {
        // 테이블 미존재 시 무시
    }

    revalidatePath('/review')
    return { ok: true }
}
