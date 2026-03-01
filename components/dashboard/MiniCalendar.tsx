'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function MiniCalendar({ tasks }: { tasks: { due_date: string | null }[] }) {
    const [date, setDate] = useState(new Date())
    const year = date.getFullYear()
    const month = date.getMonth()

    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Build set of days with tasks
    const taskDays = new Set<number>()
    tasks.forEach(t => {
        if (!t.due_date) return
        const d = new Date(t.due_date)
        if (d.getFullYear() === year && d.getMonth() === month) {
            taskDays.add(d.getDate())
        }
    })

    const prevMonth = () => setDate(new Date(year, month - 1, 1))
    const nextMonth = () => setDate(new Date(year, month + 1, 1))

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-1 rounded-md hover:bg-gray-100 transition">
                    <ChevronLeft size={14} className="text-gray-400" />
                </button>
                <span className="text-sm font-semibold text-gray-700">
                    {year}년 {month + 1}월
                </span>
                <button onClick={nextMonth} className="p-1 rounded-md hover:bg-gray-100 transition">
                    <ChevronRight size={14} className="text-gray-400" />
                </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 text-center mb-1">
                {WEEKDAYS.map((wd, i) => (
                    <div key={wd} className={`text-[10px] font-semibold py-0.5 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                        {wd}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`e-${i}`} className="h-7" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const isToday = isCurrentMonth && day === today.getDate()
                    const hasTask = taskDays.has(day)
                    const dow = (firstDay + i) % 7

                    return (
                        <div
                            key={day}
                            className={`h-7 flex flex-col items-center justify-center rounded-md text-xs relative transition
                                ${isToday ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-gray-50'}
                                ${dow === 0 && !isToday ? 'text-red-400' : ''}
                                ${dow === 6 && !isToday ? 'text-blue-400' : ''}
                                ${!isToday && dow !== 0 && dow !== 6 ? 'text-gray-600' : ''}
                            `}
                        >
                            {day}
                            {hasTask && (
                                <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-indigo-500'
                                    }`} />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
