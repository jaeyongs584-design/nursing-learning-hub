import { getReviewSchedule } from '@/lib/services/review.service'
import Link from 'next/link'
import { Brain, RefreshCw, AlertTriangle, Clock, CheckCircle2, Play, BookOpen, Sparkles } from 'lucide-react'

export default async function ReviewSchedulePage() {
    let items: Awaited<ReturnType<typeof getReviewSchedule>> = []
    try {
        items = await getReviewSchedule()
    } catch {
        // DB 테이블 미존재 시 빈 배열
    }

    const overdueItems = items.filter(i => i.urgency === 'overdue')
    const todayItems = items.filter(i => i.urgency === 'today')
    const upcomingItems = items.filter(i => i.urgency === 'upcoming')
    const activeCount = overdueItems.length + todayItems.length

    const urgencyConfig = {
        overdue: { label: '기한 초과', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: AlertTriangle, iconColor: 'text-red-500' },
        today: { label: '오늘 복습', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: Clock, iconColor: 'text-orange-500' },
        upcoming: { label: '예정', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: Brain, iconColor: 'text-blue-500' },
    }

    const renderItems = (list: typeof items, urgency: keyof typeof urgencyConfig) => {
        const config = urgencyConfig[urgency]
        if (list.length === 0) return null
        return (
            <section className="space-y-3">
                <h3 className="font-bold text-lg flex justify-between items-center">
                    <span className="flex items-center gap-2">
                        <config.icon size={18} className={config.iconColor} />
                        {config.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text} font-medium`}>{list.length}</span>
                </h3>
                <div className="space-y-2">
                    {list.map(item => (
                        <div key={item.id} className={`p-4 rounded-xl border ${config.border} ${config.bg} transition hover:shadow-sm`}>
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.type === 'wrong_answer' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {item.type === 'wrong_answer' ? '오답' : '퀴즈'}
                                        </span>
                                        <span className="text-xs text-gray-500">{item.courseName}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                                    {item.detail && <p className="text-xs text-gray-500 mt-0.5 truncate">{item.detail}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                        <span>복습 {item.reviewCount}회 완료</span>
                                        <span>•</span>
                                        <span>다음: {new Date(item.nextReviewDate).toLocaleDateString('ko-KR')}</span>
                                    </div>
                                </div>
                                <Link
                                    href={`/courses/${item.courseId}/wrong-answers`}
                                    className="bg-white text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-medium border transition flex-shrink-0"
                                >
                                    보기
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <RefreshCw className="text-blue-600" size={28} />
                        복습 스케줄
                    </h1>
                    <p className="text-gray-500 mt-2">Leitner 시스템 기반으로 최적의 복습 시점을 알려드려요.</p>
                </div>
            </div>

            {/* 요약 카드 + 세션 시작 버튼 */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-700">{overdueItems.length}</div>
                    <div className="text-xs text-red-600 mt-1">기한 초과</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-700">{todayItems.length}</div>
                    <div className="text-xs text-orange-600 mt-1">오늘 복습</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">{upcomingItems.length}</div>
                    <div className="text-xs text-blue-600 mt-1">예정</div>
                </div>
                <Link
                    href={activeCount > 0 ? '/review/session?filter=all' : '#'}
                    className={`rounded-xl p-4 text-center transition flex flex-col items-center justify-center gap-1 ${activeCount > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <Play size={20} />
                    <div className="text-xs font-bold mt-1">복습 시작</div>
                    <div className="text-[10px] opacity-80">{activeCount}개 항목</div>
                </Link>
            </div>

            {/* 필터별 복습 세션 시작 */}
            {activeCount > 0 && (
                <div className="flex gap-2 flex-wrap">
                    <Link
                        href="/review/session?filter=all"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-2"
                    >
                        <Play size={14} />
                        전체 복습 ({activeCount})
                    </Link>
                    {overdueItems.length > 0 && (
                        <Link
                            href="/review/session?filter=overdue"
                            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                        >
                            기한 초과만 ({overdueItems.length})
                        </Link>
                    )}
                    {todayItems.length > 0 && (
                        <Link
                            href="/review/session?filter=today"
                            className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-200 transition"
                        >
                            오늘 복습만 ({todayItems.length})
                        </Link>
                    )}
                </div>
            )}

            {items.length === 0 ? (
                <div className="p-16 text-center bg-gray-50 border border-dashed rounded-2xl">
                    <div className="text-5xl mb-4">🎉</div>
                    <p className="text-gray-600 font-medium text-lg">복습할 내용이 없습니다!</p>
                    <p className="text-sm text-gray-400 mt-2 mb-6">오답노트를 작성하거나 퀴즈를 풀면 복습 스케줄이 자동 생성됩니다.</p>
                    <div className="flex gap-3 justify-center">
                        <Link href="/courses" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition flex items-center gap-2">
                            <BookOpen size={16} />
                            퀴즈 풀러 가기
                        </Link>
                        <Link href="/courses" className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center gap-2">
                            <Sparkles size={16} />
                            오답노트 만들기
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {renderItems(overdueItems, 'overdue')}
                    {renderItems(todayItems, 'today')}
                    {renderItems(upcomingItems, 'upcoming')}
                </div>
            )}

            {/* 알고리즘 설명 */}
            <section className="bg-gray-50 border rounded-xl p-5 text-sm text-gray-600">
                <h4 className="font-bold text-gray-800 mb-2">📚 Leitner 복습 알고리즘</h4>
                <p>오답을 기록한 시점을 기준으로 <strong>1일 → 3일 → 7일 → 14일 → 30일</strong> 간격으로 복습 일정이 자동 생성됩니다.</p>
                <p className="mt-1">복습 세션에서 <strong>앎</strong>으로 평가하면 7일 후, <strong>헷갈림</strong>은 3일 후, <strong>모름/다시보기</strong>는 내일 다시 복습합니다.</p>
            </section>
        </div>
    )
}
