'use client'

import { useState, useCallback } from 'react'
import { recordReviewAction, saveSessionSummaryAction } from '@/actions/review.actions'
import type { ReviewRating } from '@/actions/review.actions'
import type { ReviewItem } from '@/lib/services/review.service'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, RotateCcw, CheckCircle2, Brain, AlertTriangle, XCircle, BookOpen, ArrowRight, Sparkles } from 'lucide-react'

type SessionResult = {
    itemId: string
    rating: ReviewRating
}

const ratingConfig = {
    know: { label: '앎 ✅', emoji: '✅', color: 'bg-green-600 hover:bg-green-700', desc: '완벽히 알고 있어요', nextText: '7일 후 복습' },
    confused: { label: '헷갈림 🤔', emoji: '🤔', color: 'bg-orange-500 hover:bg-orange-600', desc: '좀 더 복습 필요', nextText: '3일 후 복습' },
    forgot: { label: '모름 ❌', emoji: '❌', color: 'bg-red-600 hover:bg-red-700', desc: '기억이 안 나요', nextText: '내일 복습' },
    again: { label: '다시보기 🔄', emoji: '🔄', color: 'bg-gray-600 hover:bg-gray-700', desc: '바로 다시 볼게요', nextText: '내일 복습' },
}

export default function ReviewSession({ items }: { items: ReviewItem[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [results, setResults] = useState<SessionResult[]>([])
    const [phase, setPhase] = useState<'session' | 'summary'>('session')
    const [isSaving, setIsSaving] = useState(false)

    const current = items[currentIndex]
    const progress = items.length > 0 ? ((currentIndex) / items.length) * 100 : 0

    const handleRate = useCallback(async (rating: ReviewRating) => {
        if (!current) return

        // 한장 평가 기록
        await recordReviewAction(current.id, current.type, rating)

        const newResults = [...results, { itemId: current.id, rating }]
        setResults(newResults)

        // 다시보기는 끝에 다시 추가
        if (rating === 'again') {
            // 이미 items 배열에 있으므로 별도 조치 불필요 (실제로는 서버에서 다시 조회)
        }

        // 다음 카드 또는 종료
        if (currentIndex + 1 < items.length) {
            setCurrentIndex(prev => prev + 1)
            setShowAnswer(false)
        } else {
            // 세션 종료
            setIsSaving(true)
            await saveSessionSummaryAction(newResults)
            setIsSaving(false)
            setPhase('summary')
        }
    }, [current, currentIndex, results, items.length])

    // ═══════════════════════════════════════════════
    // Empty 상태
    // ═══════════════════════════════════════════════
    if (items.length === 0) {
        return (
            <div className="max-w-xl mx-auto text-center py-16">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">복습할 항목이 없습니다!</h2>
                <p className="text-gray-500 mb-8">오답노트를 작성하거나 퀴즈를 풀면 복습 스케줄이 자동 생성됩니다.</p>
                <div className="flex gap-3 justify-center">
                    <Link
                        href="/courses"
                        className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <BookOpen size={16} />
                        퀴즈 풀러 가기
                    </Link>
                    <Link
                        href="/courses"
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2"
                    >
                        <Sparkles size={16} />
                        오답노트 만들기
                    </Link>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════════
    // 세션 종료 요약
    // ═══════════════════════════════════════════════
    if (phase === 'summary') {
        const knowCount = results.filter(r => r.rating === 'know').length
        const confusedCount = results.filter(r => r.rating === 'confused').length
        const forgotCount = results.filter(r => r.rating === 'forgot').length
        const againCount = results.filter(r => r.rating === 'again').length
        const total = results.length

        return (
            <div className="max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🏆</div>
                    <h2 className="text-2xl font-bold text-gray-900">복습 세션 완료!</h2>
                    <p className="text-gray-500 mt-1">{total}개 항목을 복습했습니다.</p>
                </div>

                {/* 결과 통계 */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-green-700">{knowCount}</div>
                        <div className="text-xs text-green-600 mt-1">✅ 알고 있음</div>
                        <div className="text-[10px] text-green-500 mt-0.5">7일 후 복습</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-orange-700">{confusedCount}</div>
                        <div className="text-xs text-orange-600 mt-1">🤔 헷갈림</div>
                        <div className="text-[10px] text-orange-500 mt-0.5">3일 후 복습</div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-red-700">{forgotCount}</div>
                        <div className="text-xs text-red-600 mt-1">❌ 모름</div>
                        <div className="text-[10px] text-red-500 mt-0.5">내일 복습</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-gray-700">{againCount}</div>
                        <div className="text-xs text-gray-600 mt-1">🔄 다시보기</div>
                        <div className="text-[10px] text-gray-500 mt-0.5">내일 복습</div>
                    </div>
                </div>

                {/* 진행률 바 */}
                <div className="bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
                    <div className="h-full flex">
                        <div className="bg-green-500 transition-all" style={{ width: `${(knowCount / total) * 100}%` }} />
                        <div className="bg-orange-400 transition-all" style={{ width: `${(confusedCount / total) * 100}%` }} />
                        <div className="bg-red-500 transition-all" style={{ width: `${(forgotCount / total) * 100}%` }} />
                        <div className="bg-gray-400 transition-all" style={{ width: `${(againCount / total) * 100}%` }} />
                    </div>
                </div>

                {/* 다음 복습 안내 */}
                {(confusedCount + forgotCount + againCount) > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
                        <p className="text-sm text-blue-800 font-medium">
                            📅 {confusedCount + forgotCount + againCount}개 항목이 다음 복습에 포함됩니다.
                        </p>
                    </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-3">
                    <Link
                        href="/review"
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold text-sm text-center hover:bg-gray-200 transition"
                    >
                        스케줄로 돌아가기
                    </Link>
                    <Link
                        href="/review/session"
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm text-center hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={14} />
                        다시 복습하기
                    </Link>
                </div>
            </div>
        )
    }

    // ═══════════════════════════════════════════════
    // 카드 복습 세션
    // ═══════════════════════════════════════════════
    return (
        <div className="max-w-2xl mx-auto">
            {/* 진행 바 */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500">
                        {currentIndex + 1} / {items.length}
                    </span>
                    <span className="text-sm text-gray-500">
                        {Math.round(progress)}% 완료
                    </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-indigo-600 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* 카드 */}
            <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
                {/* 카드 헤더 — 출처/과목 */}
                <div className="px-6 py-3 bg-gray-50 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${current.type === 'wrong_answer' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                            {current.type === 'wrong_answer' ? '오답' : '퀴즈'}
                        </span>
                        <span className="text-xs text-gray-500">{current.courseName}</span>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${current.urgency === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {current.urgency === 'overdue' ? '기한 초과' : '오늘 복습'}
                    </span>
                </div>

                {/* 문제 영역 */}
                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">문제</h3>
                        <p className="text-lg font-medium text-gray-900 leading-relaxed">{current.question}</p>
                    </div>

                    {/* 내가 쓴 답 (오답노트인 경우) */}
                    {current.userAnswer && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                            <h4 className="text-xs font-bold text-red-600 mb-1">내가 쓴 답</h4>
                            <p className="text-sm text-red-800">{current.userAnswer}</p>
                        </div>
                    )}

                    {/* 정답/해설 토글 */}
                    {!showAnswer ? (
                        <button
                            onClick={() => setShowAnswer(true)}
                            className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold text-sm hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                        >
                            <Eye size={16} />
                            정답 & 해설 보기
                        </button>
                    ) : (
                        <div className="space-y-3 animate-fadeIn">
                            {/* 정답 */}
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                <h4 className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    정답
                                </h4>
                                <p className="text-sm text-green-900 font-medium">{current.correctAnswer}</p>
                            </div>

                            {/* 해설 */}
                            {current.explanation && (
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <h4 className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                                        <Brain size={12} />
                                        해설
                                    </h4>
                                    <p className="text-sm text-blue-900 leading-relaxed">{current.explanation}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 평가 버튼 */}
                {showAnswer && (
                    <div className="p-4 border-t bg-gray-50">
                        <p className="text-xs text-gray-500 text-center mb-3">이 개념을 얼마나 알고 있나요?</p>
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.entries(ratingConfig) as [ReviewRating, typeof ratingConfig.know][]).map(([key, config]) => (
                                <button
                                    key={key}
                                    onClick={() => handleRate(key)}
                                    className={`${config.color} text-white py-3 rounded-xl text-center transition flex flex-col items-center gap-1`}
                                >
                                    <span className="text-lg">{config.emoji}</span>
                                    <span className="text-[10px] font-bold">{config.label.split(' ')[0]}</span>
                                    <span className="text-[8px] opacity-70">{config.nextText}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex justify-between items-center mt-4 text-sm">
                <Link href="/review" className="text-gray-500 hover:text-gray-700 transition flex items-center gap-1">
                    <ChevronLeft size={14} />
                    스케줄로 돌아가기
                </Link>
                <span className="text-gray-400">
                    복습 {results.length}회 완료
                </span>
            </div>
        </div>
    )
}
