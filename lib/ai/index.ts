// ================================================================
// AI Provider 라우터
// 우선순위: GEMINI_API_KEY → OPENAI_API_KEY → mock
// ================================================================

import * as mock from './mock'
import * as openai from './openai'
import * as gemini from './gemini'
import type {
    AIResponse,
    AISummaryResult,
    QuizGenerationResult,
    RequirementAnalysisResult,
    ReportOutlineResult,
    ReportDraftResult,
    PptOutlineResult,
} from './types'

const useGemini = gemini.isGeminiAvailable()
const useOpenAI = !useGemini && openai.isOpenAIAvailable()

export async function analyzeRequirements(sourceText: string): Promise<AIResponse<RequirementAnalysisResult>> {
    if (useGemini) return gemini.analyzeRequirementsGemini(sourceText)
    if (useOpenAI) return openai.analyzeRequirementsOpenAI(sourceText)
    return mock.analyzeRequirements(sourceText)
}

export async function generateReportOutline(topic: string): Promise<AIResponse<ReportOutlineResult>> {
    if (useGemini) return gemini.generateReportOutlineGemini(topic)
    if (useOpenAI) return openai.generateReportOutlineOpenAI(topic)
    return mock.generateReportOutline(topic)
}

export async function generateReportDraft(topic: string, outline: ReportOutlineResult | null): Promise<AIResponse<ReportDraftResult>> {
    if (useGemini) return gemini.generateReportDraftGemini(topic, outline)
    if (useOpenAI) return openai.generateReportDraftOpenAI(topic, outline)
    return mock.generateReportDraft(topic, outline)
}

export async function generatePptOutline(topic: string): Promise<AIResponse<PptOutlineResult>> {
    if (useGemini) return gemini.generatePptOutlineGemini(topic)
    if (useOpenAI) return openai.generatePptOutlineOpenAI(topic)
    return mock.generatePptOutline(topic)
}

export async function generateAISummary(inputText: string): Promise<AIResponse<AISummaryResult>> {
    if (useGemini) return gemini.generateAISummaryGemini(inputText)
    if (useOpenAI) return openai.generateAISummaryOpenAI(inputText)
    return mock.generateAISummary(inputText)
}

export async function generateQuiz(inputText: string, count: number = 5): Promise<AIResponse<QuizGenerationResult>> {
    if (useGemini) return gemini.generateQuizGemini(inputText, count)
    if (useOpenAI) return openai.generateQuizOpenAI(inputText, count)
    return mock.generateQuiz(inputText, count)
}

export function getActiveProvider(): 'gemini' | 'openai' | 'mock' {
    if (useGemini) return 'gemini'
    if (useOpenAI) return 'openai'
    return 'mock'
}
