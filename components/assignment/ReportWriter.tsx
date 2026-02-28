'use client'

import { useState } from 'react'
import { generateOutlineAction, generateDraftAction, updateDraftContent } from '@/actions/assignment.actions'
import type { ReportOutlineResult, ReportDraftResult } from '@/lib/ai/types'
import { Sparkles, Save, FileText, ChevronDown, ChevronUp } from 'lucide-react'

export default function ReportWriter({
    assignmentId,
    initialOutline,
    initialDraft,
    topic,
}: {
    assignmentId: string
    initialOutline?: { id: string; content_json: ReportOutlineResult; version_no: number } | null
    initialDraft?: { id: string; content_text: string; content_json: ReportDraftResult; version_no: number } | null
    topic: string
}) {
    const [outline, setOutline] = useState<ReportOutlineResult | null>(initialOutline?.content_json || null)
    const [draftText, setDraftText] = useState(initialDraft?.content_text || '')
    const [draftId, setDraftId] = useState(initialDraft?.id || '')
    const [draftJson, setDraftJson] = useState<ReportDraftResult | null>(initialDraft?.content_json || null)
    const [isOutlineLoading, setIsOutlineLoading] = useState(false)
    const [isDraftLoading, setIsDraftLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [showOutline, setShowOutline] = useState(true)

    const handleGenerateOutline = async () => {
        setIsOutlineLoading(true)
        try {
            const res = await generateOutlineAction(assignmentId, topic)
            if (res.ok && res.data) {
                setOutline(res.data.content_json as ReportOutlineResult)
            }
        } finally {
            setIsOutlineLoading(false)
        }
    }

    const handleGenerateDraft = async () => {
        setIsDraftLoading(true)
        try {
            const res = await generateDraftAction(assignmentId, topic)
            if (res.ok && res.data) {
                setDraftText(res.data.content_text)
                setDraftId(res.data.id)
                setDraftJson(res.data.content_json as ReportDraftResult)
            }
        } finally {
            setIsDraftLoading(false)
        }
    }

    const handleSave = async () => {
        if (!draftId) return
        setIsSaving(true)
        await updateDraftContent(draftId, draftText)
        setIsSaving(false)
    }

    return (
        <div className="space-y-6">
            {/* 목차 생성 */}
            <section className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        📑 보고서 목차
                    </h3>
                    <div className="flex gap-2">
                        {outline && (
                            <button onClick={() => setShowOutline(!showOutline)} className="text-gray-400 hover:text-gray-600 p-1">
                                {showOutline ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                        )}
                        <button
                            onClick={handleGenerateOutline}
                            disabled={isOutlineLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Sparkles size={14} />
                            {isOutlineLoading ? '생성 중...' : outline ? '재생성' : '목차 생성'}
                        </button>
                    </div>
                </div>

                {outline && showOutline && (
                    <div className="space-y-2">
                        {outline.sections.map((section, i) => (
                            <div key={i} className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-semibold text-sm text-gray-800">{section.heading}</div>
                                {section.subheadings.length > 0 && (
                                    <div className="ml-4 mt-1 space-y-0.5">
                                        {section.subheadings.map((sub, j) => (
                                            <div key={j} className="text-xs text-gray-500">— {sub}</div>
                                        ))}
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 mt-1">약 {section.estimatedPages}페이지</div>
                            </div>
                        ))}
                        <p className="text-xs text-gray-400 mt-2">💡 {outline.notes}</p>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                            <Sparkles size={14} className="mt-0.5 flex-shrink-0" />
                            <p>이 목차는 AI가 생성한 초안입니다. 실제 과제 제출 시에는 본인의 생각과 연구 내용을 바탕으로 내용을 수정하고 보완해야 합니다.</p>
                        </div>
                    </div>
                )}
            </section>

            {/* 초안 생성 */}
            <section className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" />
                        보고서 초안
                    </h3>
                    <div className="flex gap-2">
                        {draftId && (
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save size={14} />
                                {isSaving ? '저장 중...' : '저장'}
                            </button>
                        )}
                        <button
                            onClick={handleGenerateDraft}
                            disabled={isDraftLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Sparkles size={14} />
                            {isDraftLoading ? '생성 중...' : draftText ? '재생성' : '초안 생성'}
                        </button>
                    </div>
                </div>

                {draftText ? (
                    <>
                        <div className="mt-4 flex items-start gap-2">
                            <Sparkles size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-gray-500 leading-relaxed">
                                <strong>AI 초안 안내:</strong> 생성된 텍스트는 참고용 뼈대입니다.
                                반드시 본인의 언어로 다시 다듬어 작성하고, 사실 관계 및 인용구의 정확성을 직접 확인하세요.<br />
                                (저장 버튼을 누르면 위 편집창에서 직접 수정한 내용이 저장됩니다.)
                            </p>
                        </div>
                        <textarea
                            value={draftText}
                            onChange={e => setDraftText(e.target.value)}
                            className="w-full min-h-[400px] mt-3 p-4 border border-gray-200 rounded-xl text-sm resize-y bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white font-mono leading-relaxed transition"
                            placeholder="이곳에서 직접 내용을 수정하고 다듬을 수 있습니다..."
                        />
                        {draftJson?.disclaimers && draftJson.disclaimers.length > 0 && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-xs font-bold text-amber-800 mb-1">⚠️ 주의</p>
                                {draftJson.disclaimers.map((d, i) => (
                                    <p key={i} className="text-xs text-amber-700">• {d}</p>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 bg-gray-50 border border-dashed rounded-xl text-center text-gray-500 text-sm">
                        목차를 먼저 생성한 후 초안을 생성하면, 목차 구조에 맞는 초안이 만들어집니다.
                    </div>
                )}
            </section>
        </div>
    )
}
