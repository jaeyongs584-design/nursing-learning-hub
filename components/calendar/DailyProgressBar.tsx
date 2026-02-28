'use client'

import type { CalendarTask } from './CalendarView'

export default function DailyProgressBar({
    tasks,
    date,
}: {
    tasks: CalendarTask[]
    date: string
}) {
    const total = tasks.length
    const done = tasks.filter(t => t.status === 'DONE').length
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const todo = tasks.filter(t => t.status === 'TODO' || !t.status).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    if (total === 0) return null

    return (
        <div className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-gray-800">{date} 과제 현황</h4>
                <span className="text-xs font-bold text-blue-600">{pct}% 완료</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
                {done > 0 && (
                    <div
                        className="bg-green-500 h-full transition-all duration-500"
                        style={{ width: `${(done / total) * 100}%` }}
                    />
                )}
                {inProgress > 0 && (
                    <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${(inProgress / total) * 100}%` }}
                    />
                )}
                {todo > 0 && (
                    <div
                        className="bg-gray-300 h-full transition-all duration-500"
                        style={{ width: `${(todo / total) * 100}%` }}
                    />
                )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2 text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full" /> 완료 {done}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" /> 진행중 {inProgress}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-300 rounded-full" /> 대기 {todo}
                </span>
            </div>
        </div>
    )
}
