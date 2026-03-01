'use client'

import { useState } from 'react'
import { reviewItemAction } from '@/actions/review.actions'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, CheckCircle2, Brain, AlertTriangle, XCircle, ArrowRight } from 'lucide-react'

type ReviewItem = {
    id: string
    source_type: string
    box: number
    next_review_at: string
    courseName?: string
    question?: string
    correctAnswer?: string
    explanation?: string
    title?: string
}

export default function ReviewSession({ items }: { items: ReviewItem[] }) {
    const [idx, setIdx] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [completed, setCompleted] = useState(0)
    const [loading, setLoading] = useState(false)
    const [finished, setFinished] = useState(false)

    if (items.length === 0) {
        return (
            <div className="text-center py-16">
                <Brain size={48} className="mx-auto mb-4 text-gray-200" />
                <h2 className="text-lg font-bold text-gray-600 mb-2">복습할 항목이 없습니다</h2>
                <p className="text-sm text-gray-400 mb-6">모든 복습을 완료했거나 아직 등록된 항목이 없습니다.</p>
                <Link href="/review" className="text-indigo-600 font-semibold text-sm hover:underline">← 돌아가기</Link>
            </div>
        )
    }

    if (finished) {
        return (
            <div className="text-center py-16">
                <CheckCircle2 size={56} className="mx-auto mb-4 text-green-500" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">복습 완료! 🎉</h2>
                <p className="text-sm text-gray-500 mb-6">총 {completed}개 항목을 복습했습니다.</p>
                <Link href="/review" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition text-sm">
                    돌아가기
                </Link>
            </div>
        )
    }

    const item = items[idx]

    const handleAction = async (result: 'know' | 'unsure' | 'forgot') => {
        setLoading(true)
        await reviewItemAction(item.id, result)
        setCompleted(c => c + 1)
        setShowAnswer(false)
        if (idx + 1 >= items.length) {
            setFinished(true)
        } else {
            setIdx(i => i + 1)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            {/* Progress */}
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${((idx) / items.length) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 font-medium">{idx + 1} / {items.length}</span>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                {/* Header */}
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">{item.courseName}</span>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                        Box {item.box}/5
                    </span>
                </div>

                {/* Question */}
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {item.question || item.title || '복습 항목'}
                    </h3>

                    {!showAnswer ? (
                        <button
                            onClick={() => setShowAnswer(true)}
                            className="flex items-center gap-2 mt-4 text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition"
                        >
                            <Eye size={16} />
                            정답 보기
                        </button>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {item.correctAnswer && (
                                <div className="bg-green-50 rounded-xl p-4">
                                    <div className="text-xs font-bold text-green-700 mb-1">정답</div>
                                    <div className="text-sm text-green-800">{item.correctAnswer}</div>
                                </div>
                            )}
                            {item.explanation && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <div className="text-xs font-bold text-blue-700 mb-1">해설</div>
                                    <div className="text-sm text-blue-800">{item.explanation}</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {showAnswer && (
                    <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-400 mb-3 text-center">이 문제를 얼마나 알고 있나요?</p>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => handleAction('know')}
                                disabled={loading}
                                className="flex flex-col items-center gap-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                            >
                                <CheckCircle2 size={20} />
                                <span className="text-xs font-bold">알고있음</span>
                                <span className="text-[9px] opacity-70">다음 단계로</span>
                            </button>
                            <button
                                onClick={() => handleAction('unsure')}
                                disabled={loading}
                                className="flex flex-col items-center gap-1 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition disabled:opacity-50"
                            >
                                <AlertTriangle size={20} />
                                <span className="text-xs font-bold">헷갈림</span>
                                <span className="text-[9px] opacity-70">3일 후 복습</span>
                            </button>
                            <button
                                onClick={() => handleAction('forgot')}
                                disabled={loading}
                                className="flex flex-col items-center gap-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50"
                            >
                                <XCircle size={20} />
                                <span className="text-xs font-bold">모름</span>
                                <span className="text-[9px] opacity-70">내일 다시</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
