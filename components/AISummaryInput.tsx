'use client'

import { useState, useRef, useTransition } from 'react'
import { createAISummaryAction, deleteAISummaryAction } from '@/actions/ai_summary.actions'
import { saveNoteAction } from '@/actions/note.actions'
import type { AISummaryResult } from '@/lib/ai/types'
import { Sparkles, BookOpen, Target, CreditCard, Key, Paperclip, Loader2, FileText, Save, CheckCircle, Trash2 } from 'lucide-react'
import { extractTextFromFile } from '@/lib/utils/file-parser'

export default function AISummaryInput({ courseId, initialSummaries = [] }: { courseId: string, initialSummaries?: any[] }) {
    const [inputText, setInputText] = useState('')
    const [result, setResult] = useState<AISummaryResult | null>(null)
    const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isParsing, setIsParsing] = useState(false)
    const [isSavingNote, startSavingNote] = useTransition()
    const [isNoteSaved, setIsNoteSaved] = useState(false)
    const [activeTab, setActiveTab] = useState<'3line' | 'concepts' | 'exam' | 'cards'>('3line')
    const [savedSummaries, setSavedSummaries] = useState(initialSummaries)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleGenerate = async () => {
        if (!inputText.trim()) { alert('학습 내용을 붙여넣거나 파일을 첨부해 주세요.'); return }
        setIsLoading(true)
        try {
            const res = await createAISummaryAction(courseId, inputText)
            if (res.ok && res.data) {
                setResult(res.data.result_json as AISummaryResult)
                setActiveSummaryId(res.data.id as string)
                // 새로 생성된 요약을 목록 맨 앞에 추가
                setSavedSummaries(prev => [res.data, ...prev])
            } else {
                alert(res.error || '요약 생성에 실패했습니다.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsParsing(true)
        try {
            const extractedText = await extractTextFromFile(file)

            // 기존 텍스트에 추가할지, 덮어쓸지 여부 (여기서는 부분 덮어쓰기 성격이 큼, 여기서는 이전 내용 누적)
            setInputText(prev => prev ? `${prev}\n\n--- [${file.name} 내용] ---\n\n${extractedText}` : extractedText)

        } catch (error: any) {
            alert(error.message || '파일에서 텍스트를 추출하는 중 오류가 발생했습니다.')
        } finally {
            setIsParsing(false)
            // 인풋 리셋 (같은 파일 다시 선택 가능하도록)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleSummaryClick = (summary: any) => {
        setResult(summary.result_json as AISummaryResult)
        setActiveSummaryId(summary.id as string)
        setInputText(summary.input_text as string)
        setIsNoteSaved(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleDeleteSummary = async (e: React.MouseEvent | null, id: string) => {
        if (e) e.stopPropagation() // prevent summary click
        if (!confirm('이 AI 요약 기록을 삭제하시겠습니까? (저장된 공통 노트는 유지됩니다)')) return
        const res = await deleteAISummaryAction(id, courseId)
        if (res.ok) {
            setSavedSummaries(prev => prev.filter(s => s.id !== id))
            if (id === activeSummaryId) {
                setResult(null)
                setActiveSummaryId(null)
                setInputText('')
            }
        } else {
            alert(res.error || '삭제에 실패했습니다.')
        }
    }

    const handleSaveToNote = () => {
        if (!result) return
        startSavingNote(async () => {
            const formData = new FormData()
            formData.append('course_id', courseId)
            const title = `AI 요약 노트 — ${new Date().toLocaleDateString('ko-KR')}`
            formData.append('title', title)
            formData.append('note_type', 'SUMMARY')

            // 노트 본문 구성 (마크다운 없이 가독성 좋은 평문 형태)
            let content = `[ 3줄 요약 ]\n`
            result.threeLine.forEach((line, index) => content += `${index + 1}. ${line}\n`)

            content += `\n[ 핵심 개념 ]\n`
            result.keyConcepts.forEach(c => content += `• ${c.term} : ${c.definition}\n`)

            formData.append('content', content.trim())

            const res = await saveNoteAction(formData)
            if (res.success) {
                setIsNoteSaved(true)
            } else {
                alert(res.error || '저장에 실패했습니다.')
            }
        })
    }

    const tabs = [
        { id: '3line' as const, label: '3줄 요약', icon: BookOpen },
        { id: 'concepts' as const, label: '핵심 개념', icon: Key },
        { id: 'exam' as const, label: '시험 포인트', icon: Target },
        { id: 'cards' as const, label: '암기 카드', icon: CreditCard },
    ]

    return (
        <div className="space-y-6">
            {/* 입력 영역 */}
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen size={18} className="text-blue-500" />
                        학습 내용 입력
                    </h3>

                    {/* 파일 첨부 버튼 (숨겨진 input과 매핑) */}
                    <div>
                        <input
                            type="file"
                            accept=".txt, .pdf"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isParsing || isLoading}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                            {isParsing ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
                            {isParsing ? '문서 읽는 중...' : '문서 첨부 (PDF, TXT)'}
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        className="w-full h-48 p-4 border border-gray-200 rounded-xl text-sm resize-y bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition"
                        placeholder="수업 내용, 교재 텍스트를 붙여넣거나 위 '문서 첨부' 버튼을 눌러 PDF/TXT 파일을 업로드하세요..."
                        disabled={isParsing}
                    />
                    {/* 파싱 중 오버레이 */}
                    {isParsing && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center flex-col gap-2">
                            <Loader2 size={24} className="text-blue-500 animate-spin" />
                            <span className="text-sm font-bold text-gray-600">문서에서 텍스트를 추출하고 있습니다...</span>
                            <span className="text-xs text-gray-400">PDF 용량에 따라 시간이 걸릴 수 있습니다.</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-3">
                    <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border">
                        ⚡ <strong className="text-gray-600">Gemini AI</strong>가 핵심을 추출하여 4가지 형태로 정리합니다.
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || isParsing || inputText.trim().length === 0}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {isLoading ? 'AI 분석 중...' : 'AI 요약 생성'}
                    </button>
                </div>
            </div>

            {/* 결과 출력 */}
            {result && (
                <div className="bg-white border rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex border-b bg-gray-50 overflow-x-auto">
                        {tabs.map(tab => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 text-sm font-medium transition ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="p-6">
                        {activeTab === '3line' && (
                            <div className="space-y-3">
                                {result.threeLine.map((line, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                                        <p className="text-sm text-gray-800 leading-relaxed pt-1">{line}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'concepts' && (
                            <div className="space-y-3">
                                {result.keyConcepts.map((concept, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-lg border hover:border-blue-200 transition">
                                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {concept.term}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-2 pl-3.5 leading-relaxed">{concept.definition}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'exam' && (
                            <div className="space-y-2">
                                {result.examPoints.map((point, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-lg border border-amber-100 hover:shadow-sm transition">
                                        <Target size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-amber-900 leading-relaxed">{point}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'cards' && (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {result.flashCards.map((card, i) => (
                                    <FlashCard key={i} front={card.front} back={card.back} index={i + 1} />
                                ))}
                            </div>
                        )}

                        {result.keywords && result.keywords.length > 0 && (
                            <div className="mt-8 pt-5 border-t">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 px-1 flex items-center gap-1.5">
                                    <FileText size={14} /> 주요 키워드
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.keywords.map((kw, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-lg font-medium border border-blue-100">
                                            #{kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row items-center justify-between border-t gap-4">
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-yellow-500" />
                            이 요약은 AI에 의해 생성된 초안입니다. 작성된 내용을 반드시 검토하세요.
                        </p>

                        <div className="flex-shrink-0 flex items-center gap-2">
                            {activeSummaryId && (
                                <button
                                    onClick={() => handleDeleteSummary(null, activeSummaryId)}
                                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-sm font-bold rounded-lg border border-red-200 transition flex items-center gap-2"
                                    title="이 요약본 기록 지우기"
                                >
                                    <Trash2 size={16} /> 기록 지우기
                                </button>
                            )}
                            {isNoteSaved ? (
                                <div className="px-4 py-2 bg-green-50 text-green-700 text-sm font-bold rounded-lg border border-green-200 flex items-center gap-2">
                                    <CheckCircle size={16} /> 노트 & 요약에 저장됨
                                </div>
                            ) : (
                                <button
                                    onClick={handleSaveToNote}
                                    disabled={isSavingNote}
                                    className="px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSavingNote ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    노트 & 요약에 저장
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 저장된 요약 목록 */}
            {savedSummaries.length > 0 && (
                <section className="bg-white border rounded-xl p-6 shadow-sm mt-8">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-purple-500" />
                        저장된 요약 ({savedSummaries.length}개)
                        <span className="text-xs font-normal text-gray-400 ml-2">클릭하여 다시 보기</span>
                    </h3>
                    <div className="space-y-3">
                        {savedSummaries.map((summary: any) => {
                            const resJson = summary.result_json as AISummaryResult | null
                            const inputT = (summary.input_text as string) || ''
                            return (
                                <div
                                    key={summary.id as string}
                                    onClick={() => handleSummaryClick(summary)}
                                    className="w-full text-left p-4 bg-gray-50 rounded-lg border hover:border-blue-400 hover:shadow-sm hover:bg-blue-50/50 transition duration-200 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="text-xs text-gray-400 font-medium">
                                                {new Date(summary.created_at as string).toLocaleString('ko-KR')}
                                            </div>
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                                                {summary.ai_provider as string}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteSummary(e, summary.id as string)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                                            title="기록 삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                        {inputT}
                                    </p>
                                    {
                                        resJson?.threeLine && (
                                            <div className="space-y-1 mt-3 pt-3 border-t border-gray-200/60">
                                                {resJson.threeLine.slice(0, 2).map((line, i) => (
                                                    <p key={i} className="text-[11px] text-gray-500 truncate">• {line}</p>
                                                ))}
                                                {resJson.threeLine.length > 2 && (
                                                    <p className="text-[11px] text-gray-400 italic">...기타 내용 포함</p>
                                                )}
                                            </div>
                                        )
                                    }
                                </div>
                            )
                        })}
                    </div>
                </section>
            )
            }
        </div >
    )
}

function FlashCard({ front, back, index }: { front: string; back: string, index: number }) {
    const [flipped, setFlipped] = useState(false)
    return (
        <button
            onClick={() => setFlipped(!flipped)}
            className={`w-full min-h-[120px] p-5 rounded-2xl border-2 text-left transition-all duration-300 relative group overflow-hidden ${flipped
                ? 'bg-blue-600 border-blue-600 shadow-md transform scale-[1.02]'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
        >
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${flipped ? 'text-blue-200' : 'text-gray-400'}`}>
                {flipped ? '정답' : `Q${index}`}
            </div>
            <p className={`text-sm font-medium leading-relaxed transition-colors ${flipped ? 'text-white' : 'text-gray-900'}`}>
                {flipped ? back : front}
            </p>

            {/* 호버 힌트 아이콘 */}
            <div className={`absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${flipped ? 'text-blue-300' : 'text-gray-300'}`}>
                <RefreshCw size={14} className={flipped ? '' : 'rotate-180'} />
            </div>
        </button>
    )
}

import { RefreshCw } from 'lucide-react'
