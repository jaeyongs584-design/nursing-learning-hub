// Spaced Repetition 복습 스케줄 서비스
// Leitner System 기반 구현
// wrong_answers + quiz_attempts 데이터 기반

import { createClient } from '../supabase/server'

export type ReviewItem = {
    id: string
    type: 'wrong_answer' | 'quiz' | 'summary'
    title: string
    detail: string
    courseName: string
    courseId: string
    urgency: 'overdue' | 'today' | 'upcoming' | 'review_done'
    nextReviewDate: string
    reviewCount: number
    // 복습 세션용 확장 필드
    question: string
    correctAnswer: string
    explanation: string
    userAnswer?: string
    source?: string // 출처 (교재, 강의 등)
}

// Leitner intervals (일)
const LEITNER_INTERVALS = [1, 3, 7, 14, 30]

function calculateLeitner(createdAt: string, now: Date) {
    const created = new Date(createdAt)
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))

    let reviewCount = 0
    let nextReviewDays = 1

    for (const interval of LEITNER_INTERVALS) {
        if (daysSinceCreated >= interval) {
            reviewCount++
        } else {
            nextReviewDays = interval
            break
        }
    }

    if (reviewCount >= LEITNER_INTERVALS.length) {
        nextReviewDays = LEITNER_INTERVALS[LEITNER_INTERVALS.length - 1]
    }

    const nextReviewDate = new Date(created)
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays)

    const daysUntilReview = Math.ceil((nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let urgency: ReviewItem['urgency'] = 'upcoming'
    if (reviewCount >= LEITNER_INTERVALS.length) urgency = 'review_done'
    else if (daysUntilReview < 0) urgency = 'overdue'
    else if (daysUntilReview === 0) urgency = 'today'

    return { reviewCount, nextReviewDate, urgency }
}

// 오답노트 기반 복습 대상 계산
export async function getReviewSchedule(): Promise<ReviewItem[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 1. 오답노트에서 복습 대상 추출
    const { data: wrongAnswers } = await supabase
        .from('wrong_answer_notes')
        .select('*, courses(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

    const now = new Date()
    const items: ReviewItem[] = []

    if (wrongAnswers) {
        for (const wa of wrongAnswers) {
            const { reviewCount, nextReviewDate, urgency } = calculateLeitner(wa.created_at, now)

            if (urgency !== 'review_done') {
                // @ts-ignore
                const courseName = wa.courses?.name || '과목 미지정'
                items.push({
                    id: wa.id,
                    type: 'wrong_answer',
                    title: wa.question?.slice(0, 60) + (wa.question?.length > 60 ? '...' : ''),
                    detail: wa.correct_answer || '',
                    courseName,
                    courseId: wa.course_id,
                    urgency,
                    nextReviewDate: nextReviewDate.toISOString(),
                    reviewCount,
                    // 확장 필드
                    question: wa.question || '',
                    correctAnswer: wa.correct_answer || '',
                    explanation: wa.explanation || '',
                    userAnswer: wa.my_answer || '',
                    source: '오답노트',
                })
            }
        }
    }

    // 2. 최근 퀴즈 중 70점 미만 → 복습 대상
    const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('*, quizzes(title, course_id, courses(name))')
        .eq('user_id', user.id)
        .lt('score', 70)
        .order('created_at', { ascending: false })
        .limit(10)

    if (attempts) {
        for (const attempt of attempts) {
            const { reviewCount, nextReviewDate, urgency } = calculateLeitner(attempt.created_at, now)

            // @ts-ignore
            const quiz = attempt.quizzes
            // @ts-ignore
            const courseName = quiz?.courses?.name || '과목 미지정'

            items.push({
                id: attempt.id,
                type: 'quiz',
                title: `${quiz?.title || '퀴즈'} (${attempt.score}점)`,
                detail: `점수가 낮아 복습이 필요합니다`,
                courseName,
                courseId: quiz?.course_id || '',
                urgency: urgency === 'review_done' ? 'upcoming' : urgency,
                nextReviewDate: nextReviewDate.toISOString(),
                reviewCount,
                question: `${quiz?.title || '퀴즈'}에서 ${attempt.score}점을 받았습니다. 오답 문제를 복습하세요.`,
                correctAnswer: '퀴즈 재도전을 통해 확인하세요.',
                explanation: '낮은 점수의 퀴즈는 재도전으로 복습하는 것이 효과적입니다.',
                source: '퀴즈',
            })
        }
    }

    // 우선순위: overdue → today → upcoming
    const urgencyOrder = { overdue: 0, today: 1, upcoming: 2, review_done: 3 }
    items.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency])

    return items
}

// 필터링된 복습 항목 가져오기 (세션용)
export async function getReviewItemsForSession(
    filter: 'all' | 'overdue' | 'today' | string // string = courseId
): Promise<ReviewItem[]> {
    const items = await getReviewSchedule()

    switch (filter) {
        case 'all':
            return items.filter(i => i.urgency === 'overdue' || i.urgency === 'today')
        case 'overdue':
            return items.filter(i => i.urgency === 'overdue')
        case 'today':
            return items.filter(i => i.urgency === 'today')
        default:
            // courseId로 필터
            return items.filter(i => i.courseId === filter && (i.urgency === 'overdue' || i.urgency === 'today'))
    }
}

// 대시보드용 요약
export async function getReviewSummary() {
    const items = await getReviewSchedule()
    return {
        overdue: items.filter(i => i.urgency === 'overdue').length,
        today: items.filter(i => i.urgency === 'today').length,
        upcoming: items.filter(i => i.urgency === 'upcoming').length,
        total: items.length,
        topItems: items.slice(0, 5),
    }
}
