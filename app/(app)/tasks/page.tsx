import { getRecentTasks } from '@/lib/services/task.service'
import TaskForm from '@/components/TaskForm'
import TaskItem from '@/components/TaskItem'
import Link from 'next/link'
import { ListTodo, Clock, CheckCircle2 } from 'lucide-react'

export default async function GlobalTasksPage() {
    const tasks = await getRecentTasks(100)

    const todoTasks = tasks.filter(t => t.status === 'TODO')
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS')
    const doneTasks = tasks.filter(t => t.status === 'DONE')

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">전체 과제 관리</h1>
                    <p className="text-gray-500 mt-1">모든 과목의 과제를 한눈에 확인하고 관리하세요.</p>
                </div>
                <TaskForm />
            </div>

            {/* 3-column Board View */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* 할 일 */}
                <section className="bg-gray-50 p-4 rounded-xl border">
                    <h3 className="font-semibold text-lg flex justify-between items-center mb-4 pb-2 border-b">
                        <span className="flex items-center gap-2">
                            <ListTodo size={18} className="text-gray-500" />
                            할 일
                        </span>
                        <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{todoTasks.length}</span>
                    </h3>
                    <div className="space-y-3 min-h-[200px]">
                        {todoTasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">할 일이 없습니다.</div>
                        ) : (
                            todoTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))
                        )}
                    </div>
                </section>

                {/* 진행 중 */}
                <section className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h3 className="font-semibold text-lg flex justify-between items-center mb-4 pb-2 border-b border-blue-200 text-blue-900">
                        <span className="flex items-center gap-2">
                            <Clock size={18} className="text-blue-500" />
                            진행 중
                        </span>
                        <span className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full">{inProgressTasks.length}</span>
                    </h3>
                    <div className="space-y-3 min-h-[200px]">
                        {inProgressTasks.length === 0 ? (
                            <div className="text-center py-8 text-blue-400/70 text-sm">진행 중인 과제가 없습니다.</div>
                        ) : (
                            inProgressTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))
                        )}
                    </div>
                </section>

                {/* 완료 */}
                <section className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <h3 className="font-semibold text-lg flex justify-between items-center mb-4 pb-2 border-b border-green-200 text-green-900">
                        <span className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-green-500" />
                            완료
                        </span>
                        <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">{doneTasks.length}</span>
                    </h3>
                    <div className="space-y-3 min-h-[200px]">
                        {doneTasks.length === 0 ? (
                            <div className="text-center py-8 text-green-400/70 text-sm">완료된 과제가 없습니다.</div>
                        ) : (
                            doneTasks.map(task => (
                                <TaskItem key={task.id} task={task} />
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    )
}
