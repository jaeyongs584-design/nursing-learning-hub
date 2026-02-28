'use client'

import { useState, useRef } from 'react'
import { Sparkles, ChevronDown, Loader2, Save, CheckCircle, Paperclip, BookOpen } from 'lucide-react'
import { generateAIQuizAction, saveAIQuizAction } from '@/actions/quiz.actions'
import type { QuizGenerationResult } from '@/lib/ai/types'
import { extractTextFromFile } from '@/lib/utils/file-parser'

export default function AIQuizGenerator({ courseId, initialNotes = [] }: { courseId: string, initialNotes?: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [inputText, setInputText] = useState('')
    const [questionCount, setQuestionCount] = useState(5)
    const [isLoading, setIsLoading] = useState(false)
    const [isParsing, setIsParsing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSaved, setIsSaved] = useState(false)
    const [result, setResult] = useState<QuizGenerationResult | null>(null)
    const [showNotesDropdown, setShowNotesDropdown] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 10 * 1024 * 1024) {
            alert('파일 용량은 10MB 이하만 가능합니다.')
            e.target.value = ''
            return
        }

        setIsParsing(true)
        try {
            const text = await extractTextFromFile(file)
            if (text) {
                // 기존 텍스트에 이어서 추가
                setInputText(prev => prev ? `${prev}\n\n[첨부 문서: ${file.name}]\n${text}` : `[첨부 문서: ${file.name}]\n${text}`)
            } else {
                alert('텍스트를 추출할 수 없는 파일이거나 빈 파일입니다.')
            }
        } catch (error: any) {
            console.error('File parse error:', error)
            alert(error.message || '파일을 읽는 데 실패했습니다.')
        } finally {
            setIsParsing(false)
            e.target.value = ''
        }
    }

    const handleLoadNote = (noteContent: string, noteTitle: string) => {
        setInputText(prev => prev ? `${prev}\n\n[불러온 노트: ${noteTitle}]\n${noteContent}` : `[불러온 노트: ${noteTitle}]\n${noteContent}`)
        setShowNotesDropdown(false)
    }

    const handleGenerate = async () => {
        if (!inputText.trim()) { alert('학습 내용을 입력해 주세요.'); return }
        setIsLoading(true)
        setIsSaved(false)
        try {
            const res = await generateAIQuizAction(inputText, questionCount)
            if (res.ok && res.data) {
                setResult(res.data)
            } else {
                alert(res.error || 'AI 퀴즈 생성에 실패했습니다.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!result) return
        setIsSaving(true)
        try {
            const questions = result.questions.map(q => ({
                question: q.questionText,
                options: q.options || [],
                answer: q.answer,
                explanation: q.explanation
            }))
            const title = `AI 퀴즈 — ${new Date().toLocaleDateString('ko-KR')}`
            const res = await saveAIQuizAction(courseId, title, questions)
            if (res.success) {
                setIsSaved(true)
            } else {
                alert(res.error || '저장에 실패했습니다.')
            }
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition flex gap-2 items-center text-sm"
            >
                <Sparkles size={16} />
                AI 퀴즈 생성
                <ChevronDown size={14} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="text-indigo-500" size={20} />
                                AI 퀴즈 자동 생성
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">학습 내용 텍스트나 노트를 제공하면 AI가 문제를 만들어 드려요.</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700">학습 내용 입력</label>
                                    <div className="flex gap-2">
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowNotesDropdown(!showNotesDropdown)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition"
                                            >
                                                <BookOpen size={14} /> 노트 불러오기
                                            </button>
                                            {showNotesDropdown && (
                                                <div className="absolute right-0 mt-2 w-64 bg-white border shadow-xl rounded-xl overflow-hidden z-10">
                                                    <div className="p-2 bg-gray-50 border-b text-xs font-bold text-gray-500">이 과목의 노트 ({initialNotes.length}개)</div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {initialNotes.length === 0 ? (
                                                            <div className="p-4 text-center text-xs text-gray-400">저장된 노트가 없습니다.</div>
                                                        ) : initialNotes.map(n => (
                                                            <button
                                                                key={n.id}
                                                                onClick={() => handleLoadNote(n.content || '', n.title || '제목 없음')}
                                                                className="w-full text-left p-3 hover:bg-indigo-50 border-b last:border-0 transition"
                                                            >
                                                                <div className="text-sm font-medium text-gray-800 truncate">{n.title}</div>
                                                                <div className="text-[10px] text-gray-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                                            className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                                        >
                                            {isParsing ? <Loader2 size={14} className="animate-spin" /> : <Paperclip size={14} />}
                                            문서 첨부
                                        </button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <textarea
                                        value={inputText}
                                        onChange={e => setInputText(e.target.value)}
                                        className="w-full h-40 p-3 border rounded-xl text-sm resize-y bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                                        placeholder="직접 입력하거나 위 버튼을 사용해 노트/문서를 추가하세요..."
                                        disabled={isParsing}
                                    />
                                    {isParsing && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center flex-col gap-2">
                                            <Loader2 size={24} className="text-indigo-500 animate-spin" />
                                            <span className="text-sm font-bold text-gray-600">문서를 분석 중입니다...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">문항 수</label>
                                    <div className="flex gap-2">
                                        {[5, 10, 20].map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setQuestionCount(n)}
                                                className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${questionCount === n ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            >
                                                {n}문제
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isLoading}
                                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                {isLoading ? '문제 생성 중...' : '퀴즈 생성하기'}
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                ⚡ Gemini AI가 학습 내용을 분석하여 문제를 생성합니다.
                            </p>
                        </div>

                        {/* 생성 결과 미리보기 */}
                        {result && (
                            <div className="p-6 border-t bg-gray-50">
                                <h4 className="font-bold text-gray-900 mb-4">📝 생성된 문제 미리보기 ({result.questions.length}문제)</h4>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                    {result.questions.map((q, i) => (
                                        <div key={i} className="p-4 bg-white rounded-lg border">
                                            <div className="flex items-start gap-2">
                                                <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{q.questionText}</p>
                                                    {q.options && (
                                                        <ul className="mt-2 space-y-1">
                                                            {q.options.map((opt, j) => (
                                                                <li key={j} className={`text-xs px-2 py-1 rounded ${opt === q.answer ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-500'}`}>
                                                                    {String.fromCharCode(65 + j)}. {opt}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-2">💡 {q.explanation}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 저장 버튼 */}
                                <div className="mt-4">
                                    {isSaved ? (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center flex items-center justify-center gap-2">
                                            <CheckCircle size={16} className="text-green-600" />
                                            <span className="text-sm font-bold text-green-700">퀴즈가 저장되었습니다! 퀴즈 목록에서 풀어보세요.</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {isSaving ? '저장 중...' : '퀴즈 목록에 저장하기'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="p-4 border-t flex justify-end">
                            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition font-medium">
                                닫기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
