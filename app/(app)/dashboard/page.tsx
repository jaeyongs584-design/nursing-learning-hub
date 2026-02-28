import { getActiveSemester, getSemesters } from '@/lib/services/semester.service'
import { getCourses } from '@/lib/services/course.service'
import { getRecentTasks } from '@/lib/services/task.service'
import { getStudyStats } from '@/lib/services/stats.service'
import { getReviewSummary } from '@/lib/services/review.service'
import Link from 'next/link'
import { BookOpen, AlertCircle, Clock, Brain, FileText, Target, ClipboardList, Sparkles, BarChart3, Calendar, ArrowRight, RefreshCw } from 'lucide-react'

export default async function DashboardPage() {
    const activeSemester = await getActiveSemester()
    const courses = await getCourses(activeSemester?.id)
    const recentTasks = await getRecentTasks(4)
    const hasSemesters = (await getSemesters()).length > 0
    const stats = await getStudyStats()
    let reviewSummary = { overdue: 0, today: 0, upcoming: 0, total: 0, topItems: [] as any[] }
    try { reviewSummary = await getReviewSummary() } catch { }

    if (!hasSemesters) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                    <BookOpen size={48} className="text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Nursing Hub에 오신 것을 환영합니다</h2>
                <p className="text-gray-600 max-w-md mb-8">
                    학업 관리를 시작하려면 가장 먼저 현재 수강하실 학기를 설정해야 합니다.
                    아래 버튼을 눌러 첫 번째 학기를 등록해 보세요!
                </p>
                <Link
                    href="/courses"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
                >
                    내 과목 / 학기 설정하기
                </Link>
            </div>
        )
    }

    // D-day 계산
    const now = new Date()
    const getDeadlineInfo = (dueDate: string | null) => {
        if (!dueDate) return null
        const due = new Date(dueDate)
        const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        return {
            dDay: diff,
            label: diff === 0 ? 'D-Day' : diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`,
            isUrgent: diff <= 3 && diff >= 0,
            isOverdue: diff < 0,
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">학습 대시보드</h1>
                    <p className="text-gray-500 mt-1">오늘의 주요 일정과 학습 현황을 한눈에 확인하세요.</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">현재 학기</div>
                    <div className="text-lg font-semibold text-blue-600">{activeSemester?.name || '설정 필요'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Stats Cards */}
                    <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white border rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-blue-100 p-1.5 rounded-lg">
                                    <Brain size={16} className="text-blue-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">퀴즈 풀이</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalQuizAttempts}<span className="text-sm text-gray-400 ml-0.5">회</span></div>
                            <div className="text-xs text-gray-400 mt-1">평균 {stats.averageQuizScore}점</div>
                        </div>
                        <div className="bg-white border rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-green-100 p-1.5 rounded-lg">
                                    <ClipboardList size={16} className="text-green-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">과제 완료</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.completedTasksRatio}</div>
                            <div className="text-xs text-gray-400 mt-1">완료/전체</div>
                        </div>
                        <div className="bg-white border rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-orange-100 p-1.5 rounded-lg">
                                    <Target size={16} className="text-orange-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">오답 노트</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalWrongAnswerNotes}<span className="text-sm text-gray-400 ml-0.5">건</span></div>
                            <div className="text-xs text-gray-400 mt-1">복습 필요</div>
                        </div>
                        <div className="bg-white border rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-purple-100 p-1.5 rounded-lg">
                                    <FileText size={16} className="text-purple-600" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">노트</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.totalNotes}<span className="text-sm text-gray-400 ml-0.5">개</span></div>
                            <div className="text-xs text-gray-400 mt-1">작성됨</div>
                        </div>
                    </section>

                    {/* Active Courses Summary */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BookOpen className="text-blue-500" />
                                내 과목 현황
                            </h2>
                            <Link href="/courses" className="text-sm text-blue-600 hover:underline">모두 보기</Link>
                        </div>

                        {courses.length === 0 ? (
                            <div className="bg-white border border-dashed rounded-xl p-8 text-center">
                                <p className="text-gray-500 mb-4">이번 학기에 등록된 과목이 없습니다.</p>
                                <Link href="/courses" className="text-blue-600 hover:underline font-medium">과목 등록하러 가기</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {courses.slice(0, 4).map(course => (
                                    <Link href={`/courses/${course.id}`} key={course.id} className="block group">
                                        <div className="bg-white border rounded-lg p-5 hover:shadow-md transition">
                                            <div className="flex items-start justify-between">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 truncate pr-2">{course.name}</h3>
                                            </div>
                                            <div className="text-sm text-gray-500 mt-2">
                                                {course.professor && <span>{course.professor} 교수님</span>}
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">✨ AI요약</span>
                                                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">🧩 퀴즈</span>
                                                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">📊 약점</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recent Notes */}
                    <section className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold flex items-center gap-2">
                                <FileText className="text-purple-500" size={18} />
                                최근 노트
                            </h2>
                        </div>
                        <div className="divide-y">
                            {stats.recentNotes.length === 0 ? (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    아직 작성한 노트가 없습니다. 과목 페이지에서 노트를 작성해 보세요! 📝
                                </div>
                            ) : (
                                stats.recentNotes.map(note => (
                                    <Link key={note.id} href={`/courses/${note.course_id}/notes`} className="block p-4 hover:bg-gray-50 transition">
                                        <h4 className="font-medium text-sm text-gray-900">{note.title}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span>{note.course_name}</span>
                                            <span>•</span>
                                            <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>

                </div>

                {/* Right Column (Narrower) */}
                <div className="space-y-6">

                    {/* Quick AI Actions */}
                    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-5 text-white shadow-lg">
                        <h3 className="font-bold flex items-center gap-2 mb-3">
                            <Sparkles size={18} />
                            AI 학습 도우미
                        </h3>
                        <p className="text-blue-100 text-xs mb-4">공부할 내용을 입력하면 AI가 도와드려요!</p>
                        <div className="space-y-2">
                            {courses.slice(0, 3).map(course => (
                                <Link
                                    key={course.id}
                                    href={`/courses/${course.id}/ai-summary`}
                                    className="flex items-center justify-between bg-white/15 hover:bg-white/25 rounded-lg px-3 py-2.5 text-sm transition"
                                >
                                    <span className="truncate pr-2">{course.name}</span>
                                    <ArrowRight size={14} className="flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Upcoming Tasks with D-day */}
                    <section className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h2 className="font-bold flex items-center gap-2">
                                <AlertCircle className="text-orange-500" size={18} />
                                마감 임박 과제
                            </h2>
                            <Link href="/tasks" className="text-xs text-blue-600 hover:underline">전체 보기</Link>
                        </div>
                        <div className="divide-y">
                            {recentTasks.length === 0 ? (
                                <div className="p-6 text-center bg-gray-50 border-gray-100 flex flex-col items-center justify-center">
                                    <p className="text-gray-500 font-medium mb-1">
                                        등록된 과제가 없습니다! 🎉
                                    </p>
                                    <p className="text-xs text-gray-400 mb-4">
                                        새 과제를 등록하고 AI 보고서 초안 작성을 체험해 보세요.
                                    </p>
                                    <Link href="/courses" className="text-xs bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm">
                                        + 새 과제 추가하기
                                    </Link>
                                </div>
                            ) : (
                                recentTasks.map(task => {
                                    const deadline = getDeadlineInfo(task.due_date)
                                    return (
                                        <div key={task.id} className="p-4 hover:bg-gray-50 transition">
                                            <div className="flex items-start gap-3">
                                                {/* D-day badge */}
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center text-xs font-bold ${deadline?.isOverdue ? 'bg-red-100 text-red-700' :
                                                    deadline?.isUrgent ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {deadline ? (
                                                        <>
                                                            <span className="text-[10px]">마감</span>
                                                            <span className="text-sm">{deadline.label}</span>
                                                        </>
                                                    ) : (
                                                        <Calendar size={16} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm text-gray-900 truncate">{task.title}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                        {/* @ts-ignore - Supabase nested join type */}
                                                        {task.course && <span className="truncate max-w-[120px]">{task.course.name}</span>}
                                                        {task.due_date && (
                                                            <>
                                                                <span>•</span>
                                                                <span className={deadline?.isOverdue ? 'text-red-600 font-medium' : ''}>
                                                                    {new Date(task.due_date).toLocaleDateString('ko-KR')}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {task.course_id && (
                                                        <Link
                                                            href={`/courses/${task.course_id}/tasks/${task.id}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition mt-2 border border-indigo-100"
                                                        >
                                                            <Sparkles size={12} /> AI 도우미 (보고서/PPT)
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </section>

                    {/* 복습 스케줄 요약 */}
                    <section className="bg-white border rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <RefreshCw size={16} className="text-blue-600" />
                                복습 스케줄
                            </h3>
                            <Link href="/review" className="text-xs text-blue-600 hover:underline">전체 보기</Link>
                        </div>
                        {reviewSummary.total === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                복습할 항목이 없습니다! 🎉
                            </div>
                        ) : (
                            <div className="p-4 space-y-3">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-red-50 rounded-lg p-2">
                                        <div className="text-lg font-bold text-red-700">{reviewSummary.overdue}</div>
                                        <div className="text-[10px] text-red-600">초과</div>
                                    </div>
                                    <div className="bg-orange-50 rounded-lg p-2">
                                        <div className="text-lg font-bold text-orange-700">{reviewSummary.today}</div>
                                        <div className="text-[10px] text-orange-600">오늘</div>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-2">
                                        <div className="text-lg font-bold text-blue-700">{reviewSummary.upcoming}</div>
                                        <div className="text-[10px] text-blue-600">예정</div>
                                    </div>
                                </div>
                                {reviewSummary.topItems.length > 0 && (
                                    <div className="space-y-1.5">
                                        {reviewSummary.topItems.slice(0, 3).map((item: any) => (
                                            <div key={item.id} className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded-lg">
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.urgency === 'overdue' ? 'bg-red-500' :
                                                    item.urgency === 'today' ? 'bg-orange-500' : 'bg-blue-500'
                                                    }`} />
                                                <span className="truncate text-gray-700">{item.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <Link
                                    href="/review"
                                    className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-1 transition"
                                >
                                    복습 시작하기 →
                                </Link>
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    )
}
