// 교수 스타일 태깅 서비스
// 과목별 교수님 출제 경향 & 스타일 태그 관리

import { createClient } from '../supabase/server'

export type ProfessorStyle = {
    id: string
    course_id: string
    user_id: string
    exam_type: string[]       // ['객관식', '서술형', '사례분석']
    emphasis_keywords: string[] // ['중요', '꼭 나옵니다', '핵심']
    grading_style: string     // 'strict' | 'moderate' | 'lenient'
    notes: string             // 자유 메모
    tips: string[]            // 유용한 팁
    created_at: string
    updated_at: string
}

export async function getProfessorStyle(courseId: string): Promise<ProfessorStyle | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('professor_styles')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single()

    return data as ProfessorStyle | null
}

export async function upsertProfessorStyle(
    courseId: string,
    style: {
        exam_type: string[]
        emphasis_keywords: string[]
        grading_style: string
        notes: string
        tips: string[]
    }
): Promise<{ ok: boolean; error?: string }> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증 필요' }

    // 기존 데이터 확인
    const { data: existing } = await supabase
        .from('professor_styles')
        .select('id')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .single()

    if (existing) {
        const { error } = await supabase
            .from('professor_styles')
            .update({
                ...style,
                updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

        if (error) return { ok: false, error: error.message }
    } else {
        const { error } = await supabase
            .from('professor_styles')
            .insert({
                course_id: courseId,
                user_id: user.id,
                ...style,
            })

        if (error) return { ok: false, error: error.message }
    }

    return { ok: true }
}

// 교수 스타일 기반 학습 추천 생성 (로컬 로직)
export function generateStyleRecommendations(style: ProfessorStyle): string[] {
    const recommendations: string[] = []

    if (style.exam_type.includes('객관식')) {
        recommendations.push('🔢 객관식 출제 → 핵심 용어와 비교 개념을 암기표로 정리하세요.')
    }
    if (style.exam_type.includes('서술형')) {
        recommendations.push('📝 서술형 출제 → 논리적 전개 연습과 핵심 포인트 3가지 정리를 추천합니다.')
    }
    if (style.exam_type.includes('사례분석')) {
        recommendations.push('🏥 사례분석 출제 → 간호과정(ADPIE) 프레임워크로 연습하세요.')
    }

    if (style.emphasis_keywords.length > 0) {
        recommendations.push(`⚡ 교수님 강조 키워드: ${style.emphasis_keywords.join(', ')} — 이 표현이 나오면 반드시 체크하세요!`)
    }

    if (style.grading_style === 'strict') {
        recommendations.push('🎯 엄격한 채점 스타일 → 형식 요건과 참고문헌을 꼼꼼히 확인하세요.')
    } else if (style.grading_style === 'lenient') {
        recommendations.push('💡 관대한 채점 스타일 → 독창적인 견해와 실무 적용을 강조하면 좋습니다.')
    }

    if (style.tips.length > 0) {
        recommendations.push(...style.tips.map(t => `💡 ${t}`))
    }

    return recommendations
}
