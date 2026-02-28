// ================================================================
// AI 타입 정의 — mock ↔ LLM 전환 시 UI 수정 최소화를 위한 계약(Contract)
// ================================================================

/** 요구사항 분석 결과 */
export interface RequirementAnalysisResult {
    purpose: string            // 과제 목적 요약
    submissionFormat: string   // 제출 형식
    evaluationPoints: string[] // 평가 포인트 (루브릭 요약)
    requiredItems: string[]    // 필수 포함 항목 체크리스트
    warnings: string[]         // 주의사항
    rawConfidence: 'high' | 'medium' | 'low'  // AI 확신도
}

/** 보고서 목차 */
export interface ReportOutlineResult {
    title: string
    sections: {
        heading: string
        subheadings: string[]
        estimatedPages: number
    }[]
    totalEstimatedPages: number
    notes: string  // 작성 팁
}

/** 보고서 초안 */
export interface ReportDraftResult {
    title: string
    sections: {
        heading: string
        content: string  // markdown 형식
    }[]
    references: string[]
    disclaimers: string[]  // "사용자 확인 필요" 항목
}

/** PPT 슬라이드 아웃라인 */
export interface PptSlide {
    slideNumber: number
    title: string
    bullets: string[]
    speakerNotes?: string
    layoutHint?: 'title' | 'content' | 'two-column' | 'image' | 'conclusion'
}

export interface PptOutlineResult {
    presentationTitle: string
    totalSlides: number
    slides: PptSlide[]
    estimatedDuration: string  // e.g. "15-20분"
}

/** AI 요약 결과 */
export interface AISummaryResult {
    threeLine: string[]        // 3줄 요약
    keyConcepts: {
        term: string
        definition: string
    }[]
    examPoints: string[]       // 시험 포인트
    flashCards: {
        front: string
        back: string
    }[]
    keywords: string[]         // 빈출 키워드
}

/** AI 퀴즈 생성 결과 (P2 대비) */
export interface QuizGenerationResult {
    questions: {
        questionText: string
        questionType: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'TRUE_FALSE' | 'CASE_STUDY'
        options?: string[]
        answer: string
        explanation: string
        difficulty: 'basic' | 'intermediate' | 'exam_level'
    }[]
}

/** 공통 AI 응답 래퍼 */
export interface AIResponse<T> {
    ok: boolean
    data: T | null
    error: string | null
    provider: 'mock' | 'openai' | 'other'
    generatedAt: string
}
