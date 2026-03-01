import { getActiveSemester, getSemesters } from '@/lib/services/semester.service'
import { getCourses } from '@/lib/services/course.service'
import { getRecentTasks } from '@/lib/services/task.service'
import { getStudyStats } from '@/lib/services/stats.service'
import { getReviewSummary } from '@/lib/services/review.service'
import { getTodaySchedule, getDayName } from '@/lib/services/schedule.service'
import Link from 'next/link'
import { BookOpen, AlertCircle, Clock, Brain, FileText, Target, ClipboardList, Sparkles, Calendar, ArrowRight, RefreshCw, MapPin, Plus } from 'lucide-react'
import MiniCalendar from '@/components/dashboard/MiniCalendar'
import CreateNoteButton from '@/components/note/CreateNoteButton'

export default async function DashboardPage() {
    const activeSemester = await getActiveSemester()
    const courses = await getCourses(activeSemester?.id)
    const recentTasks = await getRecentTasks(10)
    const hasSemesters = (await getSemesters()).length > 0
    const stats = await getStudyStats()
    const todaySchedule = await getTodaySchedule()
    let reviewSummary = { overdue: 0, today: 0, upcoming: 0, total: 0 }
    try { reviewSummary = await getReviewSummary() } catch { }

    if (!hasSemesters) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                    <BookOpen size={36} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Nursing Hub에 오신 것을 환영합니다</h2>
                <p className="text-gray-500 max-w-md mb-8 text-sm leading-relaxed">
                    학업 관리를 시작하려면 먼저 학기를 설정해야 합니다. 아래 버튼을 눌러 시작하세요.
                </p>
                <Link
                    href="/courses"
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md text-sm"
                >
                    시작하기 →
                </Link>
            </div>
        )
    }

    const now = new Date()
    const todayLabel = `${now.getMonth() + 1}월 ${now.getDate()}일 ${getDayName(now.getDay())}요일`

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

    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()))
    const thisWeekTasks = recentTasks.filter(t => {
        if (!t.due_date) return false
        const due = new Date(t.due_date)
        return due <= endOfWeek
    })

    const pendingTasks = recentTasks.filter(t => t.status !== 'DONE')
    const doneTasks = recentTasks.filter(t => t.status === 'DONE')

    return (
        <div className="max-w-6xl mx-auto">
            {/* "오늘" Hero Header */}
            <div className="mb-8">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                            {activeSemester?.name}
                        </p>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            {todayLabel}
                        </h1>
                    </div>
                    <Link
                        href="/tasks"
                        className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition"
                    >
                        <Plus size={13} />
                        할 일 추가
                    </Link>
                </div>
                <div className="mt-4 h-px bg-gradient-to-r from-indigo-200 via-purple-200 to-transparent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* ══════════ Left: Main Content (8 cols) ══════════ */}
                <div className="lg:col-span-8 space-y-6">

                    {/* ── 오늘 수업 ── */}
                    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <h2 className="font-bold text-base flex items-center gap-2 text-gray-800">
                                <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Clock size={15} className="text-blue-600" />
                                </span>
                                오늘의 수업
                            </h2>
                            <Link href="/timetable" className="text-xs text-gray-400 hover:text-indigo-600 transition font-medium">
                                시간표 →
                            </Link>
                        </div>
                        {todaySchedule.length === 0 ? (
                            <div className="px-5 py-10 text-center">
                                <Calendar size={28} className="mx-auto mb-2 text-gray-200" />
                                <p className="text-sm text-gray-400">오늘은 수업이 없습니다 🎉</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {todaySchedule.map((sched) => {
                                    const color = sched.course?.color_code || '#6366f1'
                                    const nowMin = now.getHours() * 60 + now.getMinutes()
                                    const [sh, sm] = sched.start_time.split(':').map(Number)
                                    const [eh, em] = sched.end_time.split(':').map(Number)
                                    const isNow = nowMin >= sh * 60 + sm && nowMin < eh * 60 + em
                                    const isPast = nowMin >= eh * 60 + em

                                    return (
                                        <Link
                                            key={sched.id}
                                            href={`/courses/${sched.course_id}`}
                                            className={`flex items-center gap-4 px-5 py-3.5 transition group ${isPast ? 'opacity-40' : 'hover:bg-gray-50'}`}
                                        >
                                            <div className="w-0.5 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                            <div className="flex-shrink-0 w-16">
                                                <div className="text-sm font-bold text-gray-800">{sched.start_time.slice(0, 5)}</div>
                                                <div className="text-[10px] text-gray-400">~{sched.end_time.slice(0, 5)}</div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm text-gray-800 truncate group-hover:text-indigo-600 transition">{sched.course?.name}</h3>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    {sched.location && <><MapPin size={9} /> {sched.location}</>}
                                                    {sched.course?.professor && <span>· {sched.course.professor}</span>}
                                                </p>
                                            </div>
                                            <CreateNoteButton courseId={sched.course_id} sessionId={sched.id} small />
                                            {isNow && (
                                                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* ── 이번 주 마감 과제 ── */}
                    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <h2 className="font-bold text-base flex items-center gap-2 text-gray-800">
                                <span className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
                                    <AlertCircle size={15} className="text-orange-500" />
                                </span>
                                이번 주 마감
                            </h2>
                            <Link href="/tasks" className="text-xs text-gray-400 hover:text-indigo-600 transition font-medium">
                                전체 보기 →
                            </Link>
                        </div>
                        {thisWeekTasks.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                이번 주 마감인 항목이 없습니다 🎉
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {thisWeekTasks.slice(0, 5).map(task => {
                                    const deadline = getDeadlineInfo(task.due_date)
                                    return (
                                        <div key={task.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50 transition">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold leading-tight ${deadline?.isOverdue ? 'bg-red-50 text-red-600' :
                                                deadline?.isUrgent ? 'bg-orange-50 text-orange-600' :
                                                    'bg-gray-50 text-gray-500'
                                                }`}>
                                                <span className="text-[8px] opacity-60">마감</span>
                                                <span className="text-xs">{deadline?.label}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-gray-800 truncate">{task.title}</h4>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {/* @ts-ignore */}
                                                    {task.course?.name || '일반 할 일'}
                                                    {task.due_date && ` · ${new Date(task.due_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}`}
                                                </p>
                                            </div>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${task.status === 'DONE' ? 'bg-green-50 text-green-600' :
                                                task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-gray-100 text-gray-500'
                                                }`}>
                                                {task.status === 'DONE' ? '완료' : task.status === 'IN_PROGRESS' ? '진행중' : '대기'}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </section>

                    {/* ── 최근 노트 ── */}
                    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <h2 className="font-bold text-base flex items-center gap-2 text-gray-800">
                                <span className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <FileText size={15} className="text-purple-500" />
                                </span>
                                최근 노트
                            </h2>
                        </div>
                        {stats.recentNotes.length === 0 ? (
                            <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                아직 작성한 노트가 없습니다 📝
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats.recentNotes.map(note => (
                                    <Link key={note.id} href={`/courses/${note.course_id}/notes`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition group">
                                        <span className="w-1.5 h-8 rounded-full bg-purple-200 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm text-gray-800 truncate group-hover:text-indigo-600 transition">{note.title}</h4>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{note.course_name} · {new Date(note.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* ══════════ Right: Sidebar Widgets (4 cols) ══════════ */}
                <div className="lg:col-span-4 space-y-6">

                    {/* ── 미니 캘린더 ── */}
                    <section className="bg-white rounded-2xl border border-gray-100 p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <MiniCalendar tasks={recentTasks.map(t => ({ due_date: t.due_date }))} />
                    </section>

                    {/* ── Quick Stats ── */}
                    <section className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Brain, color: 'text-blue-500', bg: 'bg-blue-50', label: '퀴즈', value: `${stats.totalQuizAttempts}회` },
                            { icon: ClipboardList, color: 'text-emerald-500', bg: 'bg-emerald-50', label: '과제 완료', value: stats.completedTasksRatio },
                            { icon: Target, color: 'text-amber-500', bg: 'bg-amber-50', label: '오답', value: `${stats.totalWrongAnswerNotes}건` },
                            { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50', label: '노트', value: `${stats.totalNotes}개` },
                        ].map(({ icon: Icon, color, bg, label, value }) => (
                            <div key={label} className="bg-white rounded-xl border border-gray-100 p-3.5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                                <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                                    <Icon size={14} className={color} />
                                </div>
                                <div className="text-lg font-bold text-gray-900 leading-tight">{value}</div>
                                <div className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</div>
                            </div>
                        ))}
                    </section>

                    {/* ── AI 학습 도우미 ── */}
                    <section className="rounded-2xl p-5 text-white overflow-hidden relative gradient-animate" style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1)',
                        backgroundSize: '200% 200%',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.25)',
                    }}>
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
                            <Sparkles size={16} />
                            AI 학습 도우미
                        </h3>
                        <div className="space-y-1.5">
                            {courses.slice(0, 3).map(course => (
                                <Link
                                    key={course.id}
                                    href={`/courses/${course.id}/ai-summary`}
                                    className="flex items-center justify-between bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 text-xs font-medium transition"
                                >
                                    <span className="truncate pr-2">{course.name}</span>
                                    <ArrowRight size={12} className="flex-shrink-0 opacity-60" />
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* ── 복습 알림 ── */}
                    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="px-5 py-3.5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <h3 className="font-bold text-sm flex items-center gap-2 text-gray-800">
                                <span className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center">
                                    <RefreshCw size={12} className="text-blue-500" />
                                </span>
                                복습 알림
                            </h3>
                            <Link href="/review" className="text-[10px] text-gray-400 hover:text-indigo-600 transition font-medium">보기 →</Link>
                        </div>
                        {reviewSummary.total === 0 ? (
                            <div className="px-5 py-5 text-center text-gray-400 text-xs">
                                복습 할 항목이 없습니다 🎉
                            </div>
                        ) : (
                            <div className="p-4">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="rounded-lg p-2 bg-red-50">
                                        <div className="text-base font-bold text-red-600">{reviewSummary.overdue}</div>
                                        <div className="text-[9px] text-red-500 font-medium">초과</div>
                                    </div>
                                    <div className="rounded-lg p-2 bg-amber-50">
                                        <div className="text-base font-bold text-amber-600">{reviewSummary.today}</div>
                                        <div className="text-[9px] text-amber-500 font-medium">오늘</div>
                                    </div>
                                    <div className="rounded-lg p-2 bg-blue-50">
                                        <div className="text-base font-bold text-blue-600">{reviewSummary.upcoming}</div>
                                        <div className="text-[9px] text-blue-500 font-medium">예정</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* ── 내 과목 ── */}
                    <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="px-5 py-3.5 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-light)' }}>
                            <h3 className="font-bold text-sm flex items-center gap-2 text-gray-800">
                                <span className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
                                    <BookOpen size={12} className="text-indigo-500" />
                                </span>
                                내 과목
                            </h3>
                            <Link href="/courses" className="text-[10px] text-gray-400 hover:text-indigo-600 transition font-medium">전체 →</Link>
                        </div>
                        {courses.length === 0 ? (
                            <div className="px-5 py-5 text-center text-gray-400 text-xs">등록된 과목이 없습니다</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {courses.slice(0, 4).map(course => (
                                    <Link key={course.id} href={`/courses/${course.id}`} className="flex items-center gap-2.5 px-5 py-2.5 hover:bg-gray-50 transition group">
                                        <span
                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: course.color_code || '#6366f1' }}
                                        />
                                        <span className="text-sm text-gray-700 truncate group-hover:text-indigo-600 transition font-medium">{course.name}</span>
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
