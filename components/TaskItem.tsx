'use client'

import { updateTaskStatusAction, deleteTaskAction } from '@/actions/task.actions'
import type { Task } from '@/lib/services/task.service'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Sparkles, Calendar, Clock, Trash2 } from 'lucide-react'

export default function TaskItem({ task, courseId }: { task: Task; courseId?: string }) {
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as 'TODO' | 'IN_PROGRESS' | 'DONE'
        startTransition(() => {
            // @ts-ignore
            updateTaskStatusAction(task.id, newStatus, task.course_id)
        })
    }

    const handleDelete = async () => {
        if (!confirm('이 과제를 정말 삭제하시겠습니까?')) return;
        setIsDeleting(true)
        // @ts-ignore
        await deleteTaskAction(task.id, task.course_id)
        setIsDeleting(false)
    }

    const priorityConfig = {
        LOW: { label: '낮음', color: 'bg-green-100 text-green-700 border-green-200' },
        MEDIUM: { label: '보통', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        HIGH: { label: '높음', color: 'bg-red-100 text-red-700 border-red-200' }
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        TODO: { label: '대기 중', color: 'text-gray-500' },
        IN_PROGRESS: { label: '진행 중', color: 'text-blue-600' },
        DONE: { label: '완료', color: 'text-green-600' },
    }

    const priority = priorityConfig[task.priority || 'MEDIUM']
    const cId = courseId || task.course_id

    return (
        <div className={`border rounded-xl bg-white ${isDeleting ? 'opacity-50' : 'hover:shadow-md'} transition overflow-hidden`}>
            {/* 상단: 제목 + 우선순위 + 상태 */}
            <div className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between gap-3">
                    {/* 좌측: 우선순위 뱃지 + 제목 */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${priority.color}`}>
                            {priority.label}
                        </span>
                        <h4 className="font-bold text-gray-900 truncate text-base">{task.title}</h4>
                    </div>
                    {/* 우측: 상태 셀렉트 + 삭제 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                            value={task.status || 'TODO'}
                            onChange={handleStatusChange}
                            disabled={isPending}
                            className="border text-xs rounded-lg px-2 py-1 bg-gray-50 hover:bg-white focus:ring-1 focus:ring-blue-300 transition cursor-pointer"
                        >
                            <option value="TODO">대기 중</option>
                            <option value="IN_PROGRESS">진행 중</option>
                            <option value="DONE">완료</option>
                        </select>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-gray-300 hover:text-red-500 p-1 rounded transition disabled:opacity-50"
                            title="삭제"
                        >
                            <Trash2 size={15} />
                        </button>
                    </div>
                </div>

                {/* 설명 (제목 바로 아래) */}
                {task.description && (
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 pl-[calc(0.5rem+2px+0.5rem)]">
                        {task.description}
                    </p>
                )}
            </div>

            {/* 하단: 날짜 + AI 도우미 버튼 */}
            <div className="px-5 py-2.5 bg-gray-50/70 border-t flex items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    {task.due_date && (
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            마감: {new Date(task.due_date).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        생성: {new Date(task.created_at).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
                    </span>
                </div>

                {cId && (
                    <Link
                        href={`/courses/${cId}/tasks/${task.id}`}
                        className="bg-indigo-600 text-white hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
                    >
                        <Sparkles size={12} />
                        AI 도우미
                    </Link>
                )}
            </div>
        </div>
    )
}
