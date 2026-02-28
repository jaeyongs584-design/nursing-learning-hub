import { getAllTasksForCalendar } from '@/lib/services/task.service'
import CalendarView from '@/components/calendar/CalendarView'
import { Calendar } from 'lucide-react'

export default async function CalendarPage() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const tasks = await getAllTasksForCalendar(year, month)

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Calendar className="text-blue-600" />
                    학습 캘린더
                </h1>
                <p className="text-gray-500 mt-1">과제 마감일을 달력으로 확인하고 일정을 관리하세요.</p>
            </div>

            <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <CalendarView
                    tasks={tasks as any}
                    initialYear={year}
                    initialMonth={month}
                />
            </div>
        </div>
    )
}
