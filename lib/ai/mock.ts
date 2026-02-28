// ================================================================
// AI Mock 응답 — 실제 LLM 연동 전까지 사용하는 가짜 응답
// LLM 연동 시 이 파일의 함수를 교체하면 됨
// ================================================================

import type {
    AIResponse,
    RequirementAnalysisResult,
    ReportOutlineResult,
    ReportDraftResult,
    PptOutlineResult,
    AISummaryResult,
    QuizGenerationResult,
} from './types'

function wrap<T>(data: T): AIResponse<T> {
    return {
        ok: true,
        data,
        error: null,
        provider: 'mock',
        generatedAt: new Date().toISOString(),
    }
}

/** 과제 요구사항 분석 (mock) */
export async function analyzeRequirements(sourceText: string): Promise<AIResponse<RequirementAnalysisResult>> {
    await delay(800)
    return wrap<RequirementAnalysisResult>({
        purpose: `이 과제는 "${sourceText.slice(0, 30)}..."에 관한 분석 보고서 작성을 목표로 합니다.`,
        submissionFormat: 'A4 보고서 (5~10페이지), 표지 포함, 참고문헌 별도',
        evaluationPoints: [
            '주제 이해도 및 핵심 개념 정리 (30%)',
            '근거 기반 분석 및 논리적 전개 (25%)',
            '간호 실무 적용 가능성 (20%)',
            '참고문헌 및 출처 표기 (15%)',
            '보고서 형식 및 가독성 (10%)',
        ],
        requiredItems: [
            '서론: 주제 선정 배경 및 목적',
            '본론: 핵심 개념 정리 및 분석',
            '간호 중재 또는 실무 적용 방안',
            '결론: 요약 및 개인 견해',
            '참고문헌 (APA 형식 권장)',
        ],
        warnings: [
            '표절률 30% 이상 시 감점 가능성이 있습니다.',
            '제출 기한을 반드시 확인하세요.',
            '교수님의 특별 지시사항이 있다면 우선 적용하세요.',
        ],
        rawConfidence: 'medium',
    })
}

/** 보고서 목차 생성 (mock) */
export async function generateReportOutline(topic: string): Promise<AIResponse<ReportOutlineResult>> {
    await delay(600)
    return wrap<ReportOutlineResult>({
        title: topic || '간호학 과제 보고서',
        sections: [
            { heading: 'I. 서론', subheadings: ['연구 배경', '목적 및 필요성'], estimatedPages: 1 },
            { heading: 'II. 이론적 배경', subheadings: ['핵심 개념 정리', '선행 연구 고찰', '관련 이론'], estimatedPages: 2 },
            { heading: 'III. 본론', subheadings: ['현황 분석', '간호 중재 방안', '사례 적용'], estimatedPages: 3 },
            { heading: 'IV. 결론', subheadings: ['요약', '제언 및 개인 견해'], estimatedPages: 1 },
            { heading: '참고문헌', subheadings: [], estimatedPages: 1 },
        ],
        totalEstimatedPages: 8,
        notes: '각 섹션의 분량은 과제 요구사항에 맞추어 조정하세요. 본론에 가장 많은 비중을 둘 것을 권장합니다.',
    })
}

/** 보고서 초안 생성 (mock) */
export async function generateReportDraft(topic: string, outline: ReportOutlineResult | null): Promise<AIResponse<ReportDraftResult>> {
    await delay(1200)
    const sections = outline?.sections || [
        { heading: 'I. 서론', subheadings: [] },
        { heading: 'II. 본론', subheadings: [] },
        { heading: 'III. 결론', subheadings: [] },
    ]

    return wrap<ReportDraftResult>({
        title: topic || '간호학 과제 보고서 초안',
        sections: sections.map(s => ({
            heading: s.heading,
            content: `## ${s.heading}\n\n[이 섹션은 AI가 생성한 초안입니다. 반드시 내용을 확인하고 수정해 주세요.]\n\n${s.heading}에 대한 내용을 여기에 작성합니다. ${s.subheadings?.length ? '\n\n### ' + s.subheadings.join('\n\n### ') : ''}\n\n> ⚠️ **주의**: 이 텍스트는 AI가 생성한 초안입니다. 학술적 정확성을 직접 확인해 주세요.`,
        })),
        references: [
            '대한간호학회지 (사용자 확인 필요)',
            '기본간호학 교과서 (출처 직접 기입)',
        ],
        disclaimers: [
            '이 초안은 AI가 생성한 것이며, 학술적 정확도를 보장하지 않습니다.',
            '참고문헌은 정확한 출처를 직접 확인하고 수정해 주세요.',
            '교수님의 과제 요구사항에 맞추어 내용을 반드시 수정하세요.',
        ],
    })
}

/** PPT 아웃라인 생성 (mock) */
export async function generatePptOutline(topic: string): Promise<AIResponse<PptOutlineResult>> {
    await delay(700)
    return wrap<PptOutlineResult>({
        presentationTitle: topic || '간호학 발표 자료',
        totalSlides: 8,
        slides: [
            { slideNumber: 1, title: topic || '발표 제목', bullets: ['발표자: [이름]', '과목: [과목명]', '날짜: [날짜]'], layoutHint: 'title' },
            { slideNumber: 2, title: '목차', bullets: ['서론', '이론적 배경', '본론', '간호 적용', '결론', 'Q&A'], layoutHint: 'content' },
            { slideNumber: 3, title: '서론 — 연구 배경', bullets: ['주제 선정 이유', '현재 동향', '발표 목적'], layoutHint: 'content' },
            { slideNumber: 4, title: '이론적 배경', bullets: ['핵심 개념 정의', '관련 이론', '선행 연구 요약'], layoutHint: 'two-column' },
            { slideNumber: 5, title: '본론 — 분석', bullets: ['현황 분석', '데이터/사례', '비교 분석'], layoutHint: 'content' },
            { slideNumber: 6, title: '간호 실무 적용', bullets: ['간호 중재 방안', '실무 적용 가능성', '기대 효과'], layoutHint: 'content' },
            { slideNumber: 7, title: '결론 및 제언', bullets: ['핵심 요약', '제언', '개인 견해'], layoutHint: 'conclusion' },
            { slideNumber: 8, title: 'Q&A / 참고문헌', bullets: ['질문 받기', '참고문헌 목록'], layoutHint: 'conclusion' },
        ],
        estimatedDuration: '10-15분',
    })
}

/** AI 요약 (mock) */
export async function generateAISummary(inputText: string): Promise<AIResponse<AISummaryResult>> {
    await delay(1000)
    return wrap<AISummaryResult>({
        threeLine: [
            `이 자료는 "${inputText.slice(0, 20)}..."에 관한 핵심 내용을 다루고 있습니다.`,
            '주요 개념과 간호 중재 방안이 체계적으로 정리되어 있습니다.',
            '시험 대비 시 핵심 키워드와 비교표를 중심으로 학습하세요.',
        ],
        keyConcepts: [
            { term: '핵심 개념 1', definition: '해당 개념에 대한 정의 및 설명 (AI 생성 — 확인 필요)' },
            { term: '핵심 개념 2', definition: '관련 이론 및 실무 적용 사항 (AI 생성 — 확인 필요)' },
            { term: '핵심 개념 3', definition: '간호 중재와의 연관성 (AI 생성 — 확인 필요)' },
        ],
        examPoints: [
            '교수님 강조 표현 주의 ("중요", "시험에 나온다")',
            '비교 개념은 표로 정리하세요',
            '약물 부작용 관련 내용 암기 필수',
        ],
        flashCards: [
            { front: '핵심 개념 1이란?', back: '해당 개념에 대한 정의' },
            { front: '핵심 개념 2의 간호 중재는?', back: '관련 간호 중재 방안' },
        ],
        keywords: ['핵심용어1', '핵심용어2', '핵심용어3', '핵심용어4', '핵심용어5'],
    })
}

/** AI 퀴즈 생성 (mock, P2 대비) */
export async function generateQuiz(inputText: string, count: number = 5): Promise<AIResponse<QuizGenerationResult>> {
    await delay(1000)
    return wrap<QuizGenerationResult>({
        questions: Array.from({ length: count }, (_, i) => ({
            questionText: `[Mock] ${inputText.slice(0, 20)}... 관련 문제 ${i + 1}`,
            questionType: 'MULTIPLE_CHOICE' as const,
            options: ['보기 A', '보기 B', '보기 C (정답)', '보기 D'],
            answer: '보기 C (정답)',
            explanation: 'AI가 생성한 해설입니다. 실제 연동 시 정확한 해설이 제공됩니다.',
            difficulty: 'intermediate' as const,
        })),
    })
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
