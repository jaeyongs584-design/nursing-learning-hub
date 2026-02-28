// ================================================================
// OpenAI 실제 연동 — OPENAI_API_KEY 환경변수가 있으면 자동 활성화
// mock.ts와 동일한 인터페이스로 구현되어 교체가 용이함
// ================================================================

import type {
    AIResponse,
    AISummaryResult,
    QuizGenerationResult,
    RequirementAnalysisResult,
    ReportOutlineResult,
    ReportDraftResult,
    PptOutlineResult,
} from './types'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'

function wrap<T>(data: T): AIResponse<T> {
    return {
        ok: true,
        data,
        error: null,
        provider: 'openai',
        generatedAt: new Date().toISOString(),
    }
}

function wrapError<T>(error: string): AIResponse<T> {
    return {
        ok: false,
        data: null,
        error,
        provider: 'openai',
        generatedAt: new Date().toISOString(),
    }
}

async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenAI API error: ${response.status} — ${err}`)
    }

    const json = await response.json()
    return json.choices?.[0]?.message?.content || '{}'
}

/** AI 요약 (OpenAI) */
export async function generateAISummaryOpenAI(inputText: string): Promise<AIResponse<AISummaryResult>> {
    try {
        const systemPrompt = `You are a nursing education AI assistant. Generate a study summary in Korean.
Return JSON with these exact fields:
- threeLine: string[] (3 key summary sentences)
- keyConcepts: {term: string, definition: string}[] (3-5 key concepts)
- examPoints: string[] (3-5 exam-relevant points)
- flashCards: {front: string, back: string}[] (3-5 cards)
- keywords: string[] (5-8 keywords)`

        const result = await callOpenAI(systemPrompt, `다음 학습 자료를 요약해주세요:\n\n${inputText}`)
        const parsed = JSON.parse(result) as AISummaryResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'OpenAI 호출 실패')
    }
}

/** AI 퀴즈 생성 (OpenAI) */
export async function generateQuizOpenAI(inputText: string, count: number = 5): Promise<AIResponse<QuizGenerationResult>> {
    try {
        const systemPrompt = `You are a nursing education quiz generator. Create ${count} multiple-choice questions in Korean.
Return JSON with field "questions" as an array. Each question object must have:
- questionText: string (the question)
- questionType: "MULTIPLE_CHOICE"
- options: string[] (4 options)
- answer: string (the correct option, must match one of the options exactly)
- explanation: string (why the answer is correct)
- difficulty: "basic" | "intermediate" | "exam_level"`

        const result = await callOpenAI(systemPrompt, `다음 내용으로 ${count}개 문제를 만들어주세요:\n\n${inputText}`)
        const parsed = JSON.parse(result) as QuizGenerationResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'OpenAI 호출 실패')
    }
}

/** 과제 요구사항 분석 (OpenAI) */
export async function analyzeRequirementsOpenAI(sourceText: string): Promise<AIResponse<RequirementAnalysisResult>> {
    try {
        const systemPrompt = `You are a nursing assignment analysis AI. Analyze the assignment requirements in Korean.
Return JSON with:
- purpose: string (assignment objective summary)
- submissionFormat: string (format requirements)
- evaluationPoints: string[] (grading criteria)
- requiredItems: string[] (required items checklist)
- warnings: string[] (important warnings)
- rawConfidence: "high" | "medium" | "low"`

        const result = await callOpenAI(systemPrompt, `다음 과제 공지를 분석해주세요:\n\n${sourceText}`)
        const parsed = JSON.parse(result) as RequirementAnalysisResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'OpenAI 호출 실패')
    }
}

/** 보고서 목차 생성 (OpenAI) */
export async function generateReportOutlineOpenAI(topic: string): Promise<AIResponse<ReportOutlineResult>> {
    try {
        const systemPrompt = `You are a nursing report outline generator. Generate a report outline in Korean.
Return JSON with:
- title: string
- sections: {heading: string, subheadings: string[], estimatedPages: number}[]
- totalEstimatedPages: number
- notes: string`

        const result = await callOpenAI(systemPrompt, `${topic} 주제로 간호학 보고서 목차를 만들어주세요.`)
        const parsed = JSON.parse(result) as ReportOutlineResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'OpenAI 호출 실패')
    }
}

/** 보고서 초안 생성 (OpenAI) */
export async function generateReportDraftOpenAI(topic: string, outline: ReportOutlineResult | null): Promise<AIResponse<ReportDraftResult>> {
    try {
        const outlineText = outline
            ? outline.sections.map(s => `${s.heading}: ${s.subheadings.join(', ')}`).join('\n')
            : '서론, 본론, 결론'

        const systemPrompt = `You are a nursing report draft generator. Generate a draft in Korean.
Return JSON with:
- title: string
- sections: {heading: string, content: string}[] (content in markdown)
- references: string[]
- disclaimers: string[]`

        const result = await callOpenAI(systemPrompt, `${topic} 주제로 보고서 초안을 작성해주세요.\n목차:\n${outlineText}`)
        const parsed = JSON.parse(result) as ReportDraftResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'OpenAI 호출 실패')
    }
}

/** PPT 아웃라인 생성 (OpenAI) */
export async function generatePptOutlineOpenAI(topic: string): Promise<AIResponse<PptOutlineResult>> {
    try {
        const systemPrompt = `You are a nursing presentation generator. Generate PPT slide outlines in Korean.
Return JSON with:
- presentationTitle: string
- totalSlides: number
- slides: {slideNumber: number, title: string, bullets: string[], layoutHint: "title"|"content"|"two-column"|"conclusion"}[]
- estimatedDuration: string`

        const result = await callOpenAI(systemPrompt, `${topic} 주제로 간호학 발표 PPT 아웃라인을 만들어주세요.`)
        const parsed = JSON.parse(result) as PptOutlineResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'OpenAI 호출 실패')
    }
}

/** OpenAI 사용 가능 여부 */
export function isOpenAIAvailable(): boolean {
    return OPENAI_API_KEY.length > 0
}
