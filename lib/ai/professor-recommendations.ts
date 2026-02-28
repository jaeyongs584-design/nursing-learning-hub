// 교수 스타일 기반 학습 추천 (클라이언트용 순수 함수)

export type ProfessorStyleInput = {
    exam_type: string[]
    emphasis_keywords: string[]
    grading_style: string
    notes: string
    tips: string[]
}

export function generateStyleRecommendations(style: ProfessorStyleInput): string[] {
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
        recommendations.push(`⚡ 교수님 강조 키워드: ${style.emphasis_keywords.join(', ')} — 이 표현이 나오면 반드시 체크!`)
    }

    if (style.grading_style === 'strict') {
        recommendations.push('🎯 엄격한 채점 → 형식 요건과 참고문헌을 꼼꼼히 확인하세요.')
    } else if (style.grading_style === 'lenient') {
        recommendations.push('💡 관대한 채점 → 독창적인 견해와 실무 적용을 강조하면 좋습니다.')
    }

    if (style.tips.length > 0) {
        recommendations.push(...style.tips.map(t => `💡 ${t}`))
    }

    return recommendations
}
