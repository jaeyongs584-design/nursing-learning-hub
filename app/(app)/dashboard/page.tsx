import { getActiveSemester, getSemesters } from '@/lib/services/semester.service'
import { getCourses } from '@/lib/services/course.service'
import { getRecentTasks } from '@/lib/services/task.service'
import { getStudyStats } from '@/lib/services/stats.service'
import { getReviewSummary } from '@/lib/services/review.service'
import { getTodaySchedule, getDayName } from '@/lib/services/schedule.service'
import Link from 'next/link'
import { BookOpen, AlertCircle, Clock, Brain, FileText, Target, ClipboardList, Sparkles, Calendar, ArrowRight, RefreshCw, MapPin, CheckCircle2, Circle } from 'lucide-react'

export default async function DashboardPage() {
    const activeSemester = await getActiveSemester()
    const courses = await getCourses(activeSemester?.id)
    const recentTasks = await getRecentTasks(10)
    const hasSemesters = (await getSemesters()).length > 0
    const stats = await getStudyStats()
    const todaySchedule = await getTodaySchedule()
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

    const now = new Date()
    const todayLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${getDayName(now.getDay())}요일`

    // D-day 계산
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

    // 이번 주 마감 과제
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
    const thisWeekTasks = recentTasks.filter(t => {
        if (!t.due_date) return false
        const due = new Date(t.due_date)
        return due <= endOfWeek
    })

    // 오늘 마감 과제
    const todayTasks = recentTasks.filter(t => {
        if (!t.due_date) return false
        const due = new Date(t.due_date)
        return due.toDateString() === now.toDateString()
    })

    // 일반 할 일 (course_id가 없는 것)
    const generalTodos = recentTasks.filter(t => !t.course_id)

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Today Header */}
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <p className="text-sm text-gray-500">좋은 하루 보내세요! 👋</p>
                    <h1 className="text-3xl font-bold text-gray-900">
                        📅 {todayLabel}
                    </h1>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-gray-500">현재 학기</div>
                    <div className="text-lg font-semibold text-blue-600">{activeSemester?.name || '설정 필요'}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 오늘 수업 */}
                    <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
                            <h2 className="font-bold text-lg flex items-center gap-2 text-blue-900">
                                <Clock size={20} className="text-blue-600" />
                                오늘의 수업
                            </h2>
                            <Link href="/timetable" className="text-xs text-blue-600 hover:underline">시간표 보기</Link>
                        </div>
                        {todaySchedule.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">오늘은 수업이 없습니다! 🎉</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {todaySchedule.map((sched, idx) => {
                                    const color = sched.course?.color_code || '#3B82F6'
                                    const nowMinutes = now.getHours() * 60 + now.getMinutes()
                                    const [sh, sm] = sched.start_time.split(':').map(Number)
                                    const [eh, em] = sched.end_time.split(':').map(Number)
                                    const startMin = sh * 60 + sm
                                    const endMin = eh * 60 + em
                                    const isNow = nowMinutes >= startMin && nowMinutes < endMin
                                    const isPast = nowMinutes >= endMin

                                    return (
                                        <Link
                                            key={sched.id}
                                            href={`/courses/${sched.course_id}`}
                                            className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition ${isPast ? 'opacity-50' : ''}`}
                                        >
                                            <div
                                                className="w-1 h-12 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: color }}
                                            />
                                            <div className="flex-shrink-0 w-20 text-center">
                                                <div className="text-sm font-bold text-gray-900">{sched.start_time.slice(0, 5)}</div>
                                                <div className="text-[10px] text-gray-400">~{sched.end_time.slice(0, 5)}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">{sched.course?.name}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    {sched.location && <><MapPin size={10} /> {sched.location}</>}
                                                    {sched.course?.professor && <span className="ml-2">· {sched.course.professor} 교수님</span>}
                                                </p>
                                            </div>
                                            {isNow && (
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold animate-pulse">
                                                    수업 중
                                                </span>
                                            )}
                                            {isPast && (
                                                <span className="text-xs text-gray-400">완료</span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* 이번 주 마감 과제 */}
                    <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-orange-50 flex justify-between items-center">
                            <h2 className="font-bold text-lg flex items-center gap-2 text-orange-900">
                                <AlertCircle size={20} className="text-orange-600" />
                                이번 주 마감 과제
                            </h2>
                            <Link href="/tasks" className="text-xs text-blue-600 hover:underline">전체 보기</Link>
                        </div>
                        {thisWeekTasks.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                이번 주 마감인 과제가 없습니다! 🎉
                            </div>
                        ) : (
                            <div className="divide-y">
                                {thisWeekTasks.slice(0, 6).map(task => {
                                    const deadline = getDeadlineInfo(task.due_date)
                                    return (
                                        <div key={task.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                                            <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${deadline?.isOverdue ? 'bg-red-100 text-red-700' :
                                                    deadline?.isUrgent ? 'bg-orange-100 text-orange-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                <span className="text-[9px]">마감</span>
                                                <span className="text-sm">{deadline?.label}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-gray-900 truncate">{task.title}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {/* @ts-ignore */}
                                                    {task.course?.name || '일반 할 일'}
                                                    {task.due_date && ` · ${new Date(task.due_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}`}
                                                </p>
                                            </div>
                                            {task.course_id && (
                                                <Link
                                                    href={`/courses/${task.course_id}/tasks/${task.id}`}
                                                    className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition flex items-center gap-1"
                                                >
                                                    <Sparkles size={10} />
                                                    AI
                                                </Link>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* 최근 노트 */}
                    <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-purple-50 flex justify-between items-center">
                            <h2 className="font-bold text-lg flex items-center gap-2 text-purple-900">
                                <FileText size={20} className="text-purple-600" />
                                최근 노트
                            </h2>
                        </div>
                        {stats.recentNotes.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                아직 작성한 노트가 없습니다. 📝
                            </div>
                        ) : (
                            <div className="divide-y">
                                {stats.recentNotes.map(note => (
                                    <Link key={note.id} href={`/courses/${note.course_id}/notes`} className="block p-4 hover:bg-gray-50 transition">
                                        <h4 className="font-medium text-sm text-gray-900">{note.title}</h4>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                            <span>{note.course_name}</span>
                                            <span>•</span>
                                            <span>{new Date(note.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">

                    {/* Quick Stats */}
                    <section className="grid grid-cols-2 gap-3">
                        <div className="bg-white border rounded-xl p-3.5 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Brain size={14} className="text-blue-600" />
                                <span className="text-[10px] font-medium text-gray-400">퀴즈</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.totalQuizAttempts}<span className="text-xs text-gray-400 ml-0.5">회</span></div>
                        </div>
                        <div className="bg-white border rounded-xl p-3.5 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                                <ClipboardList size={14} className="text-green-600" />
                                <span className="text-[10px] font-medium text-gray-400">과제 완료</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.completedTasksRatio}</div>
                        </div>
                        <div className="bg-white border rounded-xl p-3.5 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Target size={14} className="text-orange-600" />
                                <span className="text-[10px] font-medium text-gray-400">오답 노트</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.totalWrongAnswerNotes}<span className="text-xs text-gray-400 ml-0.5">건</span></div>
                        </div>
                        <div className="bg-white border rounded-xl p-3.5 shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                                <FileText size={14} className="text-purple-600" />
                                <span className="text-[10px] font-medium text-gray-400">노트</span>
                            </div>
                            <div className="text-xl font-bold text-gray-900">{stats.totalNotes}<span className="text-xs text-gray-400 ml-0.5">개</span></div>
                        </div>
                    </section>

                    {/* AI 학습 도우미 */}
                    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg">
                        <h3 className="font-bold flex items-center gap-2 mb-3">
                            <Sparkles size={18} />
                            AI 학습 도우미
                        </h3>
                        <p className="text-blue-100 text-xs mb-4">과목을 선택하면 AI가 도와드려요!</p>
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

                    {/* 복습 스케줄 */}
                    <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <RefreshCw size={16} className="text-blue-600" />
                                복습 알림
                            </h3>
                            <Link href="/review" className="text-xs text-blue-600 hover:underline">전체 보기</Link>
                        </div>
                        {reviewSummary.total === 0 ? (
                            <div className="p-5 text-center text-gray-400 text-sm">
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
                                <Link
                                    href="/review"
                                    className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 py-1 transition"
                                >
                                    복습 시작하기 →
                                </Link>
                            </div>
                        )}
                    </section>

                    {/* 내 과목 */}
                    <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                <BookOpen size={16} className="text-blue-600" />
                                내 과목
                            </h3>
                            <Link href="/courses" className="text-xs text-blue-600 hover:underline">전체 보기</Link>
                        </div>
                        {courses.length === 0 ? (
                            <div className="p-5 text-center text-gray-400 text-sm">
                                등록된 과목이 없습니다.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {courses.slice(0, 5).map(course => (
                                    <Link key={course.id} href={`/courses/${course.id}`} className="block p-3 hover:bg-gray-50 transition">
                                        <h4 className="font-medium text-sm text-gray-900 truncate">{course.name}</h4>
                                        <p className="text-xs text-gray-500 mt-0.5">{course.professor && `${course.professor} 교수님`}</p>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    )
}
