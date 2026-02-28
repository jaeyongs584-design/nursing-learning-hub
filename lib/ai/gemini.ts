// ================================================================
// Google Gemini API 연동
// GEMINI_API_KEY 환경변수가 있으면 자동 활성화
// Gemini 2.0 Flash 사용 (무료 티어 지원)
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function wrap<T>(data: T): AIResponse<T> {
    return { ok: true, data, error: null, provider: 'other', generatedAt: new Date().toISOString() }
}

function wrapError<T>(error: string): AIResponse<T> {
    return { ok: false, data: null, error, provider: 'other', generatedAt: new Date().toISOString() }
}

async function callGemini(prompt: string): Promise<string> {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                responseMimeType: 'application/json',
            },
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`Gemini API error: ${response.status} — ${err}`)
    }

    const json = await response.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    return text
}

/** AI 요약 (Gemini) */
export async function generateAISummaryGemini(inputText: string): Promise<AIResponse<AISummaryResult>> {
    try {
        const prompt = `당신은 간호학 교육 AI 어시스턴트입니다. 아래 학습 자료를 분석해서 학습에 도움이 되는 요약을 한국어로 생성하세요.

다음 JSON 형식으로 정확히 응답하세요:
{
  "threeLine": ["3줄 핵심 요약 문장1", "문장2", "문장3"],
  "keyConcepts": [{"term": "핵심용어1", "definition": "정의/설명"}, ...],
  "examPoints": ["시험 출제 포인트1", ...],
  "flashCards": [{"front": "질문", "back": "답"}, ...],
  "keywords": ["핵심키워드1", "핵심키워드2", ...]
}

학습 자료:
${inputText}`

        const result = await callGemini(prompt)
        const parsed = JSON.parse(result) as AISummaryResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'Gemini 호출 실패')
    }
}

/** AI 퀴즈 생성 (Gemini) */
export async function generateQuizGemini(inputText: string, count: number = 5): Promise<AIResponse<QuizGenerationResult>> {
    try {
        const prompt = `당신은 간호학 퀴즈 생성 AI입니다. 아래 내용을 기반으로 ${count}개의 4지선다 문제를 한국어로 만드세요.

다음 JSON 형식으로 정확히 응답하세요:
{
  "questions": [
    {
      "questionText": "문제 텍스트",
      "questionType": "MULTIPLE_CHOICE",
      "options": ["보기1", "보기2", "보기3", "보기4"],
      "answer": "정답 (options 중 하나와 정확히 일치해야 함)",
      "explanation": "왜 이 답이 정답인지 상세 해설",
      "difficulty": "basic" 또는 "intermediate" 또는 "exam_level"
    }
  ]
}

학습 내용:
${inputText}`

        const result = await callGemini(prompt)
        const parsed = JSON.parse(result) as QuizGenerationResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'Gemini 호출 실패')
    }
}

/** 과제 요구사항 분석 (Gemini) */
export async function analyzeRequirementsGemini(sourceText: string): Promise<AIResponse<RequirementAnalysisResult>> {
    try {
        const prompt = `당신은 간호학 과제 분석 AI입니다. 아래 과제 공지를 분석하세요.

다음 JSON 형식으로 응답하세요:
{
  "purpose": "과제 목적 요약",
  "submissionFormat": "제출 형식 요구사항",
  "evaluationPoints": ["평가 기준1", "평가 기준2", ...],
  "requiredItems": ["필수 포함 항목1", ...],
  "warnings": ["주의사항1", ...],
  "rawConfidence": "high" 또는 "medium" 또는 "low"
}

과제 공지:
${sourceText}`

        const result = await callGemini(prompt)
        const parsed = JSON.parse(result) as RequirementAnalysisResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'Gemini 호출 실패')
    }
}

/** 보고서 목차 생성 (Gemini) */
export async function generateReportOutlineGemini(topic: string): Promise<AIResponse<ReportOutlineResult>> {
    try {
        const prompt = `당신은 간호학 보고서 목차 생성 AI입니다. "${topic}" 주제로 간호학 보고서 목차를 만들어주세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "보고서 제목",
  "sections": [{"heading": "I. 서론", "subheadings": ["배경", "목적"], "estimatedPages": 1}, ...],
  "totalEstimatedPages": 8,
  "notes": "작성 팁"
}`

        const result = await callGemini(prompt)
        const parsed = JSON.parse(result) as ReportOutlineResult
        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'Gemini 호출 실패')
    }
}

/** 보고서 초안 생성 (Gemini) */
export async function generateReportDraftGemini(topic: string, outline: ReportOutlineResult | null): Promise<AIResponse<ReportDraftResult>> {
    try {
        const outlineText = outline
            ? outline.sections.map(s => `${s.heading}: ${s.subheadings.join(', ')}`).join('\n')
            : '서론, 본론, 결론'

        const prompt = `당신은 간호학 보고서 초안 생성 AI입니다. "${topic}" 주제로 보고서 초안을 작성하세요.

※ 중요: '#', '*', '-' 같은 마크다운 기호를 절대 사용하지 말고, 자연스러운 문단(줄바꿈)만으로 사람이 읽기 편한 평문(Plain Text) 형태로 작성하세요.

목차:
${outlineText}

다음 JSON 형식으로 응답하세요:
{
  "title": "보고서 제목",
  "sections": [{"heading": "섹션 제목", "content": "마크다운없는 깔끔한 줄바꿈 평문 내용"}, ...],
  "references": ["참고문헌1", ...],
  "disclaimers": ["주의사항1", ...]
}`

        const result = await callGemini(prompt)
        const parsed = JSON.parse(result) as ReportDraftResult

        // 마크다운 기호 강제 제거
        const stripMd = (s: string) => s.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/^-\s*/gm, '').replace(/`/g, '').trim()
        if (parsed.title) parsed.title = stripMd(parsed.title)
        if (parsed.sections) {
            parsed.sections = parsed.sections.map(sec => ({
                ...sec,
                heading: stripMd(sec.heading),
                content: sec.content.replace(/\*\*/g, '').replace(/`/g, '')
            }))
        }

        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'Gemini 호출 실패')
    }
}

/** PPT 아웃라인 생성 (Gemini) */
export async function generatePptOutlineGemini(topic: string): Promise<AIResponse<PptOutlineResult>> {
    try {
        const prompt = `당신은 간호학 발표 자료 생성 AI입니다. "${topic}" 주제로 PPT 슬라이드 아웃라인을 만들어주세요.

※ 중요: 슬라이드 제목과 내용(bullets)에 '#', '**', '*', '-' 같은 마크다운 기호를 절대 사용하지 마세요. 사람이 읽기 편한 평문만 사용하세요.

다음 JSON 형식으로 응답하세요:
{
  "presentationTitle": "발표 제목",
  "totalSlides": 8,
  "slides": [{"slideNumber": 1, "title": "슬라이드 제목", "bullets": ["마크다운 없는 평문 내용1", "마크다운 없는 평문 내용2"], "layoutHint": "title"}, ...],
  "estimatedDuration": "10-15분"
}

layoutHint는 "title", "content", "two-column", "conclusion" 중 하나로 지정하세요.`

        const result = await callGemini(prompt)
        const parsed = JSON.parse(result) as PptOutlineResult

        // 마크다운 기호 강제 제거 (Gemini가 프롬프트를 무시하는 경우 대비)
        const stripMd = (s: string) => s.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/^-\s*/gm, '').replace(/`/g, '').trim()
        if (parsed.presentationTitle) parsed.presentationTitle = stripMd(parsed.presentationTitle)
        if (parsed.slides) {
            parsed.slides = parsed.slides.map(slide => ({
                ...slide,
                title: stripMd(slide.title),
                bullets: slide.bullets.map(b => stripMd(b))
            }))
        }

        return wrap(parsed)
    } catch (error: any) {
        return wrapError(error.message || 'Gemini 호출 실패')
    }
}

/** Gemini 사용 가능 여부 */
export function isGeminiAvailable(): boolean {
    return GEMINI_API_KEY.length > 0
}
