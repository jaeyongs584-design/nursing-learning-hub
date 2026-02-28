import { getWeaknessAnalysis } from '@/lib/services/weakness.service'
import Link from 'next/link'
import { BarChart3, TrendingUp, AlertTriangle, Lightbulb, Target } from 'lucide-react'

export default async function AnalyticsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const analysis = await getWeaknessAnalysis(courseId)

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="mb-6">
                <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                    &larr; 대시보드로 돌아가기
                </Link>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="text-purple-500" size={24} />
                    약점 분석
                </h2>
                <p className="text-gray-500 mt-1">퀴즈 결과를 분석하여 약한 부분을 찾아드려요.</p>
            </div>

            {analysis.totalAttempts === 0 ? (
                <div className="bg-white border rounded-xl p-8 shadow-sm text-center">
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="font-bold text-gray-900 mb-2">아직 데이터가 부족합니다</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        퀴즈를 풀기 시작하면 여기에 약점 분석이 표시됩니다!
                    </p>
                    <Link
                        href={`/courses/${courseId}/quizzes`}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition"
                    >
                        <Lightbulb size={16} />
                        퀴즈 풀러 가기
                    </Link>
                </div>
            ) : (
                <>
                    {/* 전체 요약 카드 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white border rounded-xl p-5 shadow-sm text-center">
                            <div className="text-3xl font-black text-blue-600">{analysis.totalAttempts}</div>
                            <div className="text-sm text-gray-500 mt-1">총 퀴즈 시도</div>
                        </div>
                        <div className="bg-white border rounded-xl p-5 shadow-sm text-center">
                            <div className={`text-3xl font-black ${analysis.overallAccuracy >= 70 ? 'text-green-600' : analysis.overallAccuracy >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                                {analysis.overallAccuracy}%
                            </div>
                            <div className="text-sm text-gray-500 mt-1">전체 정확도</div>
                        </div>
                        <div className="bg-white border rounded-xl p-5 shadow-sm text-center">
                            <div className="text-3xl font-black text-orange-500">{analysis.weakTopics.length}</div>
                            <div className="text-sm text-gray-500 mt-1">약점 항목</div>
                        </div>
                    </div>

                    {/* 최근 추세 */}
                    {analysis.recentTrend.length > 0 && (
                        <section className="bg-white border rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp size={18} className="text-green-500" />
                                최근 성적 추세
                            </h3>
                            <div className="flex items-end gap-2 h-40">
                                {analysis.recentTrend.map((point, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-xs font-bold text-gray-600">{point.accuracy}%</span>
                                        <div className="w-full bg-gray-100 rounded-t-md relative" style={{ height: '120px' }}>
                                            <div
                                                className={`absolute bottom-0 w-full rounded-t-md transition-all ${point.accuracy >= 70 ? 'bg-green-400' : point.accuracy >= 50 ? 'bg-orange-400' : 'bg-red-400'}`}
                                                style={{ height: `${point.accuracy}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400">{point.date}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 유형별 분석 */}
                    {analysis.typeBreakdown.length > 0 && (
                        <section className="bg-white border rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Target size={18} className="text-blue-500" />
                                문제 유형별 정확도
                            </h3>
                            <div className="space-y-3">
                                {analysis.typeBreakdown.map((type, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-20 text-sm font-medium text-gray-700 text-right">{type.type}</div>
                                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${type.accuracy >= 70 ? 'bg-green-500' : type.accuracy >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                style={{ width: `${type.accuracy}%` }}
                                            />
                                        </div>
                                        <div className="w-16 text-sm font-bold text-gray-700">{type.accuracy}%</div>
                                        <div className="w-16 text-xs text-gray-400">{type.count}문제</div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 약점 TOP */}
                    {analysis.weakTopics.length > 0 && (
                        <section className="bg-white border rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-orange-500" />
                                약점 TOP {analysis.weakTopics.length}
                            </h3>
                            <div className="space-y-2">
                                {analysis.weakTopics.map((topic, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-lg">
                                        <span className="text-sm text-gray-800 truncate flex-1">{topic.topic}</span>
                                        <span className="font-bold text-red-600 text-sm ml-4">{topic.accuracy}%</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 추천 사항 */}
                    <section className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <h4 className="font-bold text-blue-900 mb-3">💡 AI 추천</h4>
                        <ul className="space-y-2">
                            {analysis.recommendations.map((rec, i) => (
                                <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                                    <span className="mt-0.5">→</span> {rec}
                                </li>
                            ))}
                        </ul>
                    </section>
                </>
            )}
        </div>
    )
}
