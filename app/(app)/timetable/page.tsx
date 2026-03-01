import { getWeeklySchedule, getDayName } from '@/lib/services/schedule.service'
import { getCourses } from '@/lib/services/course.service'
import { getActiveSemester } from '@/lib/services/semester.service'
import Link from 'next/link'
import { Clock, MapPin, Calendar } from 'lucide-react'
import { ScheduleDeleteButton } from '@/components/schedule/ScheduleForm'
import TimetableClient from '@/components/schedule/TimetableClient'

const WEEKDAYS = ['월', '화', '수', '목', '금']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8시~19시

const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

function timeToHour(time: string) {
    const [h, m] = time.split(':').map(Number)
    return h + m / 60
}

export default async function TimetablePage() {
    const activeSemester = await getActiveSemester()
    const courses = await getCourses(activeSemester?.id)
    const schedules = await getWeeklySchedule()

    // Group schedules by day (1=월 ~ 5=금)
    const byDay: Record<number, typeof schedules> = {}
    for (let i = 1; i <= 5; i++) byDay[i] = []
    schedules.forEach(s => {
        if (s.day_of_week >= 1 && s.day_of_week <= 5) {
            byDay[s.day_of_week].push(s)
        }
    })

    const todayDow = new Date().getDay() // 0=Sun

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Calendar className="text-blue-600" />
                        주간 시간표
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {activeSemester?.name || '학기 설정 필요'} · 수업 일정을 한눈에 확인하세요
                    </p>
                </div>
                <TimetableClient courses={courses.map(c => ({ id: c.id, name: c.name, color_code: c.color_code }))} />
            </div>

            {/* Timetable grid */}
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <div className="grid grid-cols-6 border-b">
                    <div className="p-3 bg-gray-50 text-center text-xs font-medium text-gray-400">시간</div>
                    {WEEKDAYS.map((day, i) => (
                        <div key={day} className={`p-3 text-center text-sm font-semibold border-l ${todayDow === i + 1 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                            }`}>
                            {day}
                            {todayDow === i + 1 && <span className="ml-1 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full">오늘</span>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-6 relative" style={{ minHeight: `${HOURS.length * 60}px` }}>
                    {/* Time column */}
                    <div className="border-r">
                        {HOURS.map(hour => (
                            <div key={hour} className="h-[60px] flex items-start justify-center pt-1 text-xs text-gray-400 border-b">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    {[1, 2, 3, 4, 5].map(dayNum => (
                        <div key={dayNum} className="border-l relative">
                            {HOURS.map(hour => (
                                <div key={hour} className="h-[60px] border-b border-gray-100" />
                            ))}

                            {/* Schedule blocks */}
                            {byDay[dayNum].map((sched, idx) => {
                                const startH = timeToHour(sched.start_time)
                                const endH = timeToHour(sched.end_time)
                                const top = (startH - 8) * 60
                                const height = (endH - startH) * 60
                                const color = sched.course?.color_code || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]

                                return (
                                    <div
                                        key={sched.id}
                                        className="absolute left-1 right-1 rounded-lg px-2 py-1.5 overflow-hidden group hover:shadow-lg transition-shadow"
                                        style={{
                                            top: `${top}px`,
                                            height: `${Math.max(height, 30)}px`,
                                            backgroundColor: `${color}20`,
                                            borderLeft: `3px solid ${color}`,
                                        }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <Link href={`/courses/${sched.course_id}`} className="min-w-0 flex-1">
                                                <p className="text-xs font-bold truncate" style={{ color }}>{sched.course?.name}</p>
                                                {height >= 50 && (
                                                    <>
                                                        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-0.5">
                                                            <Clock size={9} />
                                                            {sched.start_time.slice(0, 5)}~{sched.end_time.slice(0, 5)}
                                                        </p>
                                                        {sched.location && (
                                                            <p className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                                                <MapPin size={9} />
                                                                {sched.location}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </Link>
                                            <ScheduleDeleteButton id={sched.id} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Saturday/Sunday (if any) */}
            {schedules.some(s => s.day_of_week === 0 || s.day_of_week === 6) && (
                <div className="bg-white border rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-3">주말 수업</h3>
                    <div className="space-y-2">
                        {schedules
                            .filter(s => s.day_of_week === 0 || s.day_of_week === 6)
                            .map(s => (
                                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <span className="text-sm font-medium text-gray-700">{getDayName(s.day_of_week)}요일</span>
                                    <span className="text-sm text-gray-600">{s.start_time.slice(0, 5)}~{s.end_time.slice(0, 5)}</span>
                                    <span className="text-sm font-semibold text-gray-900">{s.course?.name}</span>
                                    {s.location && <span className="text-xs text-gray-500"><MapPin size={10} className="inline" /> {s.location}</span>}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}
