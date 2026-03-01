import { getReviewSummary } from '@/lib/services/review.service'
import Link from 'next/link'
import { Brain, RefreshCw, AlertTriangle, Clock, Calendar, Play, BookOpen, Sparkles } from 'lucide-react'

export default async function ReviewSchedulePage() {
    let summary = { overdue: 0, today: 0, upcoming: 0, total: 0 }
    try {
        summary = await getReviewSummary()
    } catch { }

    const activeCount = summary.overdue + summary.today

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <RefreshCw className="text-indigo-600" size={24} />
                    복습 스케줄
                </h1>
                <p className="text-gray-400 text-sm mt-2">Leitner 시스템 기반으로 최적의 복습 시점을 알려드려요.</p>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-red-700">{summary.overdue}</div>
                    <div className="text-xs text-red-500 mt-1 font-medium">기한 초과</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-orange-700">{summary.today}</div>
                    <div className="text-xs text-orange-500 mt-1 font-medium">오늘 복습</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
                    <div className="text-3xl font-bold text-blue-700">{summary.upcoming}</div>
                    <div className="text-xs text-blue-500 mt-1 font-medium">예정</div>
                </div>
                <Link
                    href={activeCount > 0 ? '/review/session?filter=all' : '#'}
                    className={`rounded-2xl p-5 text-center transition flex flex-col items-center justify-center gap-1.5 ${activeCount > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <Play size={22} />
                    <div className="text-xs font-bold">복습 시작</div>
                    <div className="text-[10px] opacity-80">{activeCount}개 항목</div>
                </Link>
            </div>

            {/* 필터별 세션 시작 */}
            {activeCount > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <Link
                        href="/review/session?filter=all"
                        className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <Play size={14} /> 전체 복습 ({activeCount})
                    </Link>
                    {summary.overdue > 0 && (
                        <Link
                            href="/review/session?filter=overdue"
                            className="bg-red-50 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-100 transition"
                        >
                            기한 초과만 ({summary.overdue})
                        </Link>
                    )}
                    {summary.today > 0 && (
                        <Link
                            href="/review/session?filter=today"
                            className="bg-orange-50 text-orange-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-100 transition"
                        >
                            오늘만 ({summary.today})
                        </Link>
                    )}
                </div>
            )}

            {summary.total === 0 ? (
                <div className="p-16 text-center bg-gray-50 border border-dashed rounded-2xl">
                    <Brain size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-600 font-medium text-lg">복습할 내용이 없습니다!</p>
                    <p className="text-sm text-gray-400 mt-2 mb-6">퀴즈를 풀고 오답을 기록하면 복습 스케줄이 자동 생성됩니다.</p>
                    <Link href="/courses" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition inline-flex items-center gap-2">
                        <BookOpen size={16} /> 퀴즈 풀러 가기
                    </Link>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <h3 className="font-bold text-sm text-gray-700">복습 진행 현황</h3>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full rounded-full transition-all"
                                style={{ width: `${summary.total > 0 ? ((summary.total - activeCount) / summary.total) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">{summary.total - activeCount}/{summary.total} 완료</span>
                    </div>
                </div>
            )}

            {/* Leitner 설명 */}
            <section className="bg-gray-50 border border-gray-100 rounded-2xl p-5 text-sm text-gray-500">
                <h4 className="font-bold text-gray-700 mb-2">📚 Leitner 복습 알고리즘</h4>
                <p>오답을 기록한 시점을 기준으로 <strong>1일 → 3일 → 7일 → 14일 → 30일</strong> 간격으로 복습이 자동 예약됩니다.</p>
                <p className="mt-1">복습 세션에서 <strong className="text-green-600">알고있음</strong> → 다음 단계, <strong className="text-amber-600">헷갈림</strong> → 3일 후, <strong className="text-red-600">모름</strong> → Box 1로 리셋.</p>
            </section>
        </div>
    )
}
