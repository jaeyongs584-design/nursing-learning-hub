'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TaskDetailModal from './TaskDetailModal'
import DailyProgressBar from './DailyProgressBar'

export type CalendarTask = {
    id: string
    title: string
    description: string | null
    due_date: string | null
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | null
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' | null
    course_id: string | null
    course: { name: string; color_code: string | null } | null
    created_at: string
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

function getColor(task: CalendarTask, idx: number) {
    return task.course?.color_code || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]
}

export default function CalendarView({
    tasks,
    initialYear,
    initialMonth,
    compact = false,
    onMonthChange,
}: {
    tasks: CalendarTask[]
    initialYear: number
    initialMonth: number
    compact?: boolean
    onMonthChange?: (year: number, month: number) => void
}) {
    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)
    const [selectedDate, setSelectedDate] = useState<number | null>(new Date().getDate())
    const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null)

    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

    // Calendar grid
    const firstDay = new Date(year, month - 1, 1).getDay()
    const daysInMonth = new Date(year, month, 0).getDate()

    // Group tasks by day
    const tasksByDay: Record<number, CalendarTask[]> = {}
    tasks.forEach(t => {
        if (!t.due_date) return
        const d = new Date(t.due_date)
        if (d.getFullYear() === year && d.getMonth() + 1 === month) {
            const day = d.getDate()
            if (!tasksByDay[day]) tasksByDay[day] = []
            tasksByDay[day].push(t)
        }
    })

    const handlePrev = () => {
        const newMonth = month === 1 ? 12 : month - 1
        const newYear = month === 1 ? year - 1 : year
        setMonth(newMonth)
        setYear(newYear)
        setSelectedDate(null)
        onMonthChange?.(newYear, newMonth)
    }

    const handleNext = () => {
        const newMonth = month === 12 ? 1 : month + 1
        const newYear = month === 12 ? year + 1 : year
        setMonth(newMonth)
        setYear(newYear)
        setSelectedDate(null)
        onMonthChange?.(newYear, newMonth)
    }

    const selectedTasks = selectedDate ? (tasksByDay[selectedDate] || []) : []

    return (
        <div className={compact ? '' : 'space-y-4'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={handlePrev} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                    <ChevronLeft size={18} className="text-gray-600" />
                </button>
                <h3 className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-xl'}`}>
                    {year}년 {month}월
                </h3>
                <button onClick={handleNext} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                    <ChevronRight size={18} className="text-gray-600" />
                </button>
            </div>

            {/* Weekdays header */}
            <div className="grid grid-cols-7 text-center mb-1">
                {WEEKDAYS.map((wd, i) => (
                    <div key={wd} className={`text-xs font-semibold py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                        {wd}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                {/* Empty cells before first day */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-50 min-h-[48px]" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dayTasks = tasksByDay[day] || []
                    const isToday = isCurrentMonth && day === today.getDate()
                    const isSelected = day === selectedDate
                    const dayOfWeek = (firstDay + i) % 7

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDate(day === selectedDate ? null : day)}
                            className={`
                                bg-white min-h-[48px] ${compact ? 'p-1' : 'p-1.5'} flex flex-col items-center transition-all relative
                                ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-blue-50 z-10' : 'hover:bg-gray-50'}
                            `}
                        >
                            <span className={`
                                text-xs font-medium leading-none mb-1
                                ${isToday ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : ''}
                                ${dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'}
                                ${isToday ? '!text-white' : ''}
                            `}>
                                {day}
                            </span>

                            {/* Task dots */}
                            {dayTasks.length > 0 && (
                                <div className="flex gap-0.5 flex-wrap justify-center mt-0.5">
                                    {dayTasks.slice(0, compact ? 3 : 4).map((t, idx) => (
                                        <span
                                            key={t.id}
                                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'DONE' ? 'opacity-40' : ''}`}
                                            style={{ backgroundColor: getColor(t, idx) }}
                                            title={t.title}
                                        />
                                    ))}
                                    {dayTasks.length > (compact ? 3 : 4) && (
                                        <span className="text-[8px] text-gray-400 leading-none">+{dayTasks.length - (compact ? 3 : 4)}</span>
                                    )}
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Selected day task list */}
            {selectedDate && !compact && (
                <div className="mt-4 space-y-3">
                    <DailyProgressBar tasks={selectedTasks} date={`${year}년 ${month}월 ${selectedDate}일`} />

                    {selectedTasks.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 text-sm bg-white border rounded-xl">
                            이 날짜에 마감인 과제가 없습니다.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {selectedTasks.map((task, idx) => (
                                <button
                                    key={task.id}
                                    onClick={() => setSelectedTask(task)}
                                    className="w-full text-left bg-white border rounded-xl p-3.5 hover:shadow-md transition flex items-center gap-3"
                                >
                                    <span
                                        className="w-2 h-8 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: getColor(task, idx) }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className={`font-semibold text-sm truncate ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                {task.title}
                                            </h4>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {task.status === 'DONE' ? '완료' : task.status === 'IN_PROGRESS' ? '진행중' : '대기'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                            {task.course?.name || '과목 미지정'}
                                            {task.due_date && ` · ${new Date(task.due_date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex-shrink-0 ${task.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-200' :
                                            task.priority === 'LOW' ? 'bg-green-50 text-green-600 border-green-200' :
                                                'bg-yellow-50 text-yellow-600 border-yellow-200'
                                        }`}>
                                        {task.priority === 'HIGH' ? '높음' : task.priority === 'LOW' ? '낮음' : '보통'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Compact mode: small selected day tasks */}
            {selectedDate && compact && selectedTasks.length > 0 && (
                <div className="mt-3 space-y-1.5">
                    {selectedTasks.slice(0, 3).map((task, idx) => (
                        <button
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="w-full text-left flex items-center gap-2 bg-white border rounded-lg px-3 py-2 hover:shadow-sm transition"
                        >
                            <span className="w-1.5 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: getColor(task, idx) }} />
                            <span className={`text-xs truncate flex-1 ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                {task.title}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${task.status === 'DONE' ? 'bg-green-100 text-green-600' :
                                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                                        'bg-gray-100 text-gray-500'
                                }`}>
                                {task.status === 'DONE' ? '✓' : task.status === 'IN_PROGRESS' ? '●' : '○'}
                            </span>
                        </button>
                    ))}
                    {selectedTasks.length > 3 && (
                        <p className="text-[10px] text-gray-400 text-center">외 {selectedTasks.length - 3}개 과제</p>
                    )}
                </div>
            )}

            {/* Task detail modal */}
            {selectedTask && (
                <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    )
}
