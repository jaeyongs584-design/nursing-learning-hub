'use client'

import { updateTaskStatusAction } from '@/actions/task.actions'
import { useTransition } from 'react'
import { X, Sparkles, Calendar, Clock, AlertTriangle, BookOpen } from 'lucide-react'
import Link from 'next/link'
import type { CalendarTask } from './CalendarView'

export default function TaskDetailModal({
    task,
    onClose,
}: {
    task: CalendarTask
    onClose: () => void
}) {
    const [isPending, startTransition] = useTransition()

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE'
        startTransition(() => {
            updateTaskStatusAction(task.id, newStatus, task.course_id || undefined)
        })
    }

    const priorityConfig = {
        LOW: { label: '낮음', color: 'bg-green-100 text-green-700', icon: '🟢' },
        MEDIUM: { label: '보통', color: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
        HIGH: { label: '높음', color: 'bg-red-100 text-red-700', icon: '🔴' },
    }

    const statusConfig = {
        TODO: { label: '대기 중', color: 'bg-gray-100 text-gray-700' },
        IN_PROGRESS: { label: '진행 중', color: 'bg-blue-100 text-blue-700' },
        DONE: { label: '완료', color: 'bg-green-100 text-green-700' },
    }

    const prio = priorityConfig[task.priority || 'MEDIUM']
    const stat = statusConfig[task.status || 'TODO']

    const dDay = (() => {
        if (!task.due_date) return null
        const diff = Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (diff === 0) return 'D-Day'
        if (diff > 0) return `D-${diff}`
        return `D+${Math.abs(diff)}`
    })()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${prio.color}`}>
                            {prio.icon} {prio.label}
                        </span>
                        {dDay && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dDay.startsWith('D+') ? 'bg-red-100 text-red-700' :
                                    dDay === 'D-Day' || dDay === 'D-1' || dDay === 'D-2' || dDay === 'D-3' ? 'bg-orange-100 text-orange-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {dDay}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>

                    {task.description && (
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">
                            {task.description}
                        </p>
                    )}

                    <div className="space-y-3">
                        {/* Course */}
                        {task.course && (
                            <div className="flex items-center gap-3 text-sm">
                                <BookOpen size={16} className="text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600">{task.course.name}</span>
                            </div>
                        )}

                        {/* Due date */}
                        {task.due_date && (
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                                <span className="text-gray-600">
                                    마감: {new Date(task.due_date).toLocaleDateString('ko-KR', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        )}

                        {/* Created */}
                        <div className="flex items-center gap-3 text-sm">
                            <Clock size={16} className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">
                                생성: {new Date(task.created_at).toLocaleDateString('ko-KR', {
                                    year: 'numeric', month: 'long', day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Status changer */}
                    <div className="flex items-center gap-3 pt-2 border-t">
                        <span className="text-sm font-medium text-gray-700">상태:</span>
                        <select
                            value={task.status || 'TODO'}
                            onChange={handleStatusChange}
                            disabled={isPending}
                            className="border text-sm rounded-xl px-3 py-2 bg-gray-50 hover:bg-white focus:ring-2 focus:ring-blue-300 transition cursor-pointer flex-1"
                        >
                            <option value="TODO">⏳ 대기 중</option>
                            <option value="IN_PROGRESS">🔄 진행 중</option>
                            <option value="DONE">✅ 완료</option>
                        </select>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 rounded-b-2xl flex justify-between items-center">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition">
                        닫기
                    </button>
                    {task.course_id && (
                        <Link
                            href={`/courses/${task.course_id}/tasks/${task.id}`}
                            className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-1.5"
                        >
                            <Sparkles size={14} />
                            AI 도우미
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
