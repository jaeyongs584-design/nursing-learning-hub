import { createClient } from '../supabase/server'

export interface WeaknessAnalysis {
    totalAttempts: number
    overallAccuracy: number
    recentTrend: { date: string; accuracy: number }[]
    weakTopics: { topic: string; accuracy: number; totalQuestions: number }[]
    typeBreakdown: { type: string; accuracy: number; count: number }[]
    recommendations: string[]
}

export async function getWeaknessAnalysis(courseId: string): Promise<WeaknessAnalysis> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return emptyAnalysis()
    }

    // Get all quiz attempts for this course
    const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select(`
            id, score, total_questions, created_at,
            quiz:quizzes!inner(id, title, course_id)
        `)
        .eq('user_id', user.id)

    // Filter to this course's attempts
    const courseAttempts = (attempts || []).filter((a: Record<string, unknown>) => {
        const quiz = a.quiz as Record<string, unknown>
        return quiz?.course_id === courseId
    })

    if (courseAttempts.length === 0) {
        return emptyAnalysis()
    }

    // Overall accuracy
    const totalQuestions = courseAttempts.reduce((sum: number, a: Record<string, unknown>) => sum + ((a.total_questions as number) || 0), 0)
    const totalCorrect = courseAttempts.reduce((sum: number, a: Record<string, unknown>) => {
        const score = (a.score as number) || 0
        const total = (a.total_questions as number) || 1
        return sum + Math.round(score / 100 * total)
    }, 0)
    const overallAccuracy = totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0

    // Recent trend (last 7 attempts)
    const recentTrend = courseAttempts
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
            new Date(a.created_at as string).getTime() - new Date(b.created_at as string).getTime()
        )
        .slice(-7)
        .map((a: Record<string, unknown>) => ({
            date: new Date(a.created_at as string).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
            accuracy: (a.score as number) || 0,
        }))

    // Get all attempt answers for detailed analysis
    const attemptIds = courseAttempts.map((a: Record<string, unknown>) => a.id as string)
    const { data: answers } = await supabase
        .from('quiz_attempt_answers')
        .select(`
            is_correct, submitted_answer,
            question:quiz_questions!inner(question_text, question_type, answer)
        `)
        .in('attempt_id', attemptIds)

    // Type breakdown
    const typeMap = new Map<string, { correct: number; total: number }>()
    const topicMap = new Map<string, { correct: number; total: number }>()

    for (const ans of (answers || []) as Record<string, unknown>[]) {
        const question = (ans.question as unknown) as Record<string, unknown> | null
        const qType = (question?.question_type as string) || 'MULTIPLE_CHOICE'
        const isCorrect = ans.is_correct as boolean

        const typeLabel = qType === 'MULTIPLE_CHOICE' ? '객관식'
            : qType === 'SHORT_ANSWER' ? '단답형'
                : qType === 'TRUE_FALSE' ? 'O/X'
                    : qType === 'CASE_STUDY' ? '사례형'
                        : '기타'

        if (!typeMap.has(typeLabel)) typeMap.set(typeLabel, { correct: 0, total: 0 })
        const t = typeMap.get(typeLabel)!
        t.total++
        if (isCorrect) t.correct++

        // Topic extraction from question text (first 15 chars as rough topic)
        const qText = (question?.question_text as string) || ''
        const topic = qText.length > 20 ? qText.substring(0, 20) + '...' : qText
        if (topic) {
            if (!topicMap.has(topic)) topicMap.set(topic, { correct: 0, total: 0 })
            const tp = topicMap.get(topic)!
            tp.total++
            if (isCorrect) tp.correct++
        }
    }

    const typeBreakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
        type,
        accuracy: Math.round(data.correct / data.total * 100),
        count: data.total,
    }))

    // Weak topics (sorted by accuracy, lowest first)
    const weakTopics = Array.from(topicMap.entries())
        .map(([topic, data]) => ({
            topic,
            accuracy: Math.round(data.correct / data.total * 100),
            totalQuestions: data.total,
        }))
        .filter(t => t.accuracy < 80)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5)

    // Recommendations
    const recommendations: string[] = []
    if (overallAccuracy < 60) {
        recommendations.push('전체 정확도가 낮습니다. 기본 개념 복습을 권장합니다.')
    }
    const worstType = typeBreakdown.sort((a, b) => a.accuracy - b.accuracy)[0]
    if (worstType && worstType.accuracy < 70) {
        recommendations.push(`${worstType.type} 유형 문제 연습이 필요합니다. (현재 ${worstType.accuracy}%)`)
    }
    if (weakTopics.length > 0) {
        recommendations.push(`"${weakTopics[0].topic}" 관련 문제를 집중 복습하세요.`)
    }
    if (recentTrend.length >= 3) {
        const latest = recentTrend[recentTrend.length - 1].accuracy
        const prev = recentTrend[recentTrend.length - 3].accuracy
        if (latest > prev) {
            recommendations.push(`최근 성적이 상승 추세입니다! 이 페이스를 유지하세요. 📈`)
        } else if (latest < prev) {
            recommendations.push(`최근 성적이 하락 중입니다. 약점 부분을 다시 확인해 보세요.`)
        }
    }
    if (recommendations.length === 0) {
        recommendations.push('꾸준히 퀴즈를 풀어 약점을 파악해 보세요! 💪')
    }

    return {
        totalAttempts: courseAttempts.length,
        overallAccuracy,
        recentTrend,
        weakTopics,
        typeBreakdown,
        recommendations,
    }
}

function emptyAnalysis(): WeaknessAnalysis {
    return {
        totalAttempts: 0,
        overallAccuracy: 0,
        recentTrend: [],
        weakTopics: [],
        typeBreakdown: [],
        recommendations: ['퀴즈를 풀기 시작하면 여기에 약점 분석이 표시됩니다!'],
    }
}
