'use client'

import { useState } from 'react'
import { analyzeRequirementsAction } from '@/actions/assignment.actions'
import type { RequirementAnalysisResult } from '@/lib/ai/types'
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function RequirementsAnalyzer({
    assignmentId,
    initialData,
}: {
    assignmentId: string
    initialData?: { analysis_json: RequirementAnalysisResult; source_text: string } | null
}) {
    const [sourceText, setSourceText] = useState(initialData?.source_text || '')
    const [result, setResult] = useState<RequirementAnalysisResult | null>(initialData?.analysis_json || null)
    const [isLoading, setIsLoading] = useState(false)

    const handleAnalyze = async () => {
        if (!sourceText.trim()) { alert('과제 공지 내용을 붙여넣어 주세요.'); return }
        setIsLoading(true)
        try {
            const res = await analyzeRequirementsAction(assignmentId, sourceText)
            if (res.ok && res.data) {
                setResult(res.data.analysis_json as RequirementAnalysisResult)
            } else {
                alert(res.error || '분석에 실패했습니다.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* 입력 영역 */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <ClipboardIcon /> 과제 공지 / 루브릭 입력
                </h3>
                <textarea
                    value={sourceText}
                    onChange={e => setSourceText(e.target.value)}
                    className="w-full h-40 p-4 border border-gray-200 rounded-xl text-sm resize-y bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition"
                    placeholder="교수님의 과제 공지, 루브릭, 평가 기준 등을 붙여넣어 주세요..."
                />
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="mt-3 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                    <Sparkles size={16} />
                    {isLoading ? 'AI 분석 중...' : 'AI 요구사항 분석'}
                </button>
                <p className="text-xs text-gray-400 mt-2">⚡ Gemini AI가 과제 요구사항을 구조화하여 정리합니다.</p>
            </div>

            {/* 결과 표시 */}
            {result && (
                <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <h4 className="font-bold text-blue-900 mb-2">📋 과제 목적</h4>
                        <p className="text-sm text-blue-800">{result.purpose}</p>
                    </div>

                    <div className="bg-white border rounded-xl p-5">
                        <h4 className="font-bold text-gray-900 mb-2">📄 제출 형식</h4>
                        <p className="text-sm text-gray-700">{result.submissionFormat}</p>
                    </div>

                    <div className="bg-white border rounded-xl p-5">
                        <h4 className="font-bold text-gray-900 mb-3">🎯 평가 포인트</h4>
                        <ul className="space-y-2">
                            {result.evaluationPoints.map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <span className="text-blue-500 mt-0.5">•</span> {point}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white border rounded-xl p-5">
                        <h4 className="font-bold text-gray-900 mb-3">✅ 필수 포함 항목</h4>
                        <ul className="space-y-2">
                            {result.requiredItems.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {result.warnings.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                            <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                                <AlertTriangle size={16} /> 주의사항
                            </h4>
                            <ul className="space-y-2">
                                {result.warnings.map((w, i) => (
                                    <li key={i} className="text-sm text-amber-800">⚠️ {w}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 text-center">
                        🤖 AI가 생성한 초안입니다. 교수님의 실제 지시사항을 우선 따르세요.
                    </p>
                </div>
            )}
        </div>
    )
}

function ClipboardIcon() {
    return <span className="text-lg">📝</span>
}
