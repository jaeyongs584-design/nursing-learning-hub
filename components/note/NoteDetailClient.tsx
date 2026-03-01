'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { generateNoteAISummaryAction, generateQuizFromNoteAction } from '@/actions/note.actions'
import { Save, Sparkles, Lightbulb, BookOpen, Brain, FlaskConical, Loader2 } from 'lucide-react'

type NoteData = {
    id: string
    course_id: string
    title: string
    content: string | null
    ai_summary: string | null
    ai_keypoints: any[] | null
    ai_exam_points: string[] | null
    ai_flashcards: { front: string; back: string }[] | null
    ai_generated_at: string | null
}

export default function NoteDetailClient({ note }: { note: NoteData }) {
    const router = useRouter()
    const [title, setTitle] = useState(note.title || '')
    const [content, setContent] = useState(note.content || '')
    const [saving, startSaving] = useTransition()
    const [aiLoading, setAiLoading] = useState(false)
    const [quizLoading, setQuizLoading] = useState(false)
    const [aiError, setAiError] = useState<string | null>(null)
    const [showFlashcardIdx, setShowFlashcardIdx] = useState<number | null>(null)

    // Parse AI summary
    let threeLine: string[] = []
    try {
        if (note.ai_summary) threeLine = JSON.parse(note.ai_summary)
    } catch { }

    const handleSave = () => {
        startSaving(async () => {
            const fd = new FormData()
            fd.set('id', note.id)
            fd.set('course_id', note.course_id)
            fd.set('title', title)
            fd.set('content', content)
            fd.set('note_type', 'STUDY')
            const res = await fetch('/api/note-save', { method: 'POST', body: fd })
            // Simple save via server action
            const { saveNoteAction } = await import('@/actions/note.actions')
            await saveNoteAction(fd)
            router.refresh()
        })
    }

    const handleAISummary = async () => {
        if (!content.trim()) {
            setAiError('먼저 노트 내용을 입력하세요.')
            return
        }
        setAiLoading(true)
        setAiError(null)
        const result = await generateNoteAISummaryAction(note.id)
        if (result.error) setAiError(result.error)
        else router.refresh()
        setAiLoading(false)
    }

    const handleGenerateQuiz = async () => {
        if (!content.trim()) {
            setAiError('먼저 노트 내용을 입력하세요.')
            return
        }
        setQuizLoading(true)
        setAiError(null)
        const result = await generateQuizFromNoteAction(note.id)
        if (result.error) {
            setAiError(result.error)
            setQuizLoading(false)
        } else if (result.quizId) {
            router.push(`/courses/${result.courseId}/quizzes/${result.quizId}`)
        }
    }

    return (
        <div className="space-y-6">
            {/* Title */}
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold border-none outline-none bg-transparent placeholder:text-gray-300"
                placeholder="노트 제목..."
            />

            {/* Content */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[300px] border border-gray-200 rounded-xl p-4 text-sm leading-relaxed resize-y focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
                placeholder="수업 내용을 여기에 정리하세요...&#10;&#10;정리 후 'AI 요약'을 눌러 핵심 개념, 시험 포인트, 암기카드를 자동 생성할 수 있습니다."
            />

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50"
                >
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    저장
                </button>
                <button
                    onClick={handleAISummary}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {aiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    AI 요약
                </button>
                <button
                    onClick={handleGenerateQuiz}
                    disabled={quizLoading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                    {quizLoading ? <Loader2 size={15} className="animate-spin" /> : <FlaskConical size={15} />}
                    퀴즈 만들기
                </button>
            </div>

            {aiError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{aiError}</div>
            )}

            {/* ── AI 결과 패널 ── */}
            {note.ai_generated_at && (
                <div className="space-y-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Sparkles size={12} />
                        AI 분석 결과 · {new Date(note.ai_generated_at).toLocaleDateString('ko-KR')}
                    </div>

                    {/* 3줄 요약 */}
                    {threeLine.length > 0 && (
                        <section className="bg-indigo-50 rounded-xl p-4">
                            <h3 className="font-bold text-sm text-indigo-800 flex items-center gap-1.5 mb-2">
                                <BookOpen size={14} /> 3줄 요약
                            </h3>
                            <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-700">
                                {threeLine.map((line, i) => <li key={i}>{line}</li>)}
                            </ol>
                        </section>
                    )}

                    {/* 핵심 개념 */}
                    {note.ai_keypoints && note.ai_keypoints.length > 0 && (
                        <section className="bg-blue-50 rounded-xl p-4">
                            <h3 className="font-bold text-sm text-blue-800 flex items-center gap-1.5 mb-2">
                                <Brain size={14} /> 핵심 개념
                            </h3>
                            <div className="space-y-2">
                                {note.ai_keypoints.map((kp: any, i: number) => (
                                    <div key={i} className="text-sm">
                                        <span className="font-semibold text-blue-700">{kp.term}</span>
                                        <span className="text-gray-600 ml-1.5">— {kp.definition}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 시험 포인트 */}
                    {note.ai_exam_points && note.ai_exam_points.length > 0 && (
                        <section className="bg-orange-50 rounded-xl p-4">
                            <h3 className="font-bold text-sm text-orange-800 flex items-center gap-1.5 mb-2">
                                <Lightbulb size={14} /> 시험 포인트
                            </h3>
                            <ul className="space-y-1.5 text-sm text-gray-700">
                                {note.ai_exam_points.map((pt: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-orange-500 font-bold text-xs mt-0.5">{i + 1}</span>
                                        {pt}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* 암기카드 */}
                    {note.ai_flashcards && note.ai_flashcards.length > 0 && (
                        <section className="bg-purple-50 rounded-xl p-4">
                            <h3 className="font-bold text-sm text-purple-800 flex items-center gap-1.5 mb-3">
                                <FlaskConical size={14} /> 암기카드 ({note.ai_flashcards.length}개)
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {note.ai_flashcards.map((card: { front: string; back: string }, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setShowFlashcardIdx(showFlashcardIdx === i ? null : i)}
                                        className="text-left bg-white border border-purple-100 rounded-lg p-3 hover:shadow-md transition"
                                    >
                                        <div className="text-xs font-bold text-purple-600 mb-1">Q{i + 1}</div>
                                        <div className="text-sm text-gray-800">{card.front}</div>
                                        {showFlashcardIdx === i && (
                                            <div className="mt-2 pt-2 border-t border-purple-100 text-sm text-purple-700 font-medium">
                                                💡 {card.back}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    )
}
