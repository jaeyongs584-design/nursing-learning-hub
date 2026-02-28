'use client'

import { useState, useTransition } from 'react'
import { createScheduleAction, deleteScheduleAction } from '@/actions/schedule.actions'
import { X, Trash2, Plus } from 'lucide-react'

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

type Course = { id: string; name: string; color_code: string | null }

export function ScheduleForm({ courses, onClose }: { courses: Course[]; onClose: () => void }) {
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        startTransition(async () => {
            const result = await createScheduleAction(formData)
            if (result.success) onClose()
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-lg font-bold">수업 시간 추가</h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">과목</label>
                        <select name="course_id" required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50">
                            <option value="">과목 선택</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">요일</label>
                        <select name="day_of_week" required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50">
                            {DAYS.map((d, i) => (
                                <option key={i} value={i}>{d}요일</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
                            <input type="time" name="start_time" required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
                            <input type="time" name="end_time" required className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">강의실</label>
                        <input type="text" name="location" placeholder="예: 본관 301호" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
                        <input type="text" name="memo" placeholder="선택사항" className="w-full border rounded-xl px-3 py-2.5 text-sm bg-gray-50" />
                    </div>
                    <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-60">
                        {isPending ? '추가 중...' : '수업 추가'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export function ScheduleDeleteButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()
    return (
        <button
            onClick={() => { if (confirm('이 수업 시간을 삭제합니까?')) startTransition(async () => { await deleteScheduleAction(id) }) }}
            disabled={isPending}
            className="text-gray-300 hover:text-red-500 p-0.5 transition"
        >
            <Trash2 size={13} />
        </button>
    )
}
