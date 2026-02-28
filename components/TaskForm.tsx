'use client'

import { useState } from 'react'
import { createTaskAction } from '@/actions/task.actions'

export default function TaskForm({ courseId }: { courseId?: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        if (courseId) {
            formData.append('course_id', courseId)
        }

        try {
            const res = await createTaskAction(formData)
            if (res?.error) {
                alert(res.error)
            } else {
                setIsOpen(false)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
                + 새 과제 추가
            </button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-white border p-4 rounded-xl shadow-sm mb-6">
            <h3 className="font-semibold mb-4 text-gray-900">새 과제 등록</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">과제명 *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full border rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="예: 간호학개론 3장 요약"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">상세 설명</label>
                    <textarea
                        name="description"
                        rows={2}
                        className="w-full border rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="과제에 대한 상세 내용을 적어주세요"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">마감일</label>
                        <input
                            type="datetime-local"
                            name="due_date"
                            className="w-full border rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">우선순위</label>
                        <select name="priority" className="w-full border rounded p-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
                            <option value="LOW">낮음</option>
                            <option value="MEDIUM" selected>보통</option>
                            <option value="HIGH">높음</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </form>
    )
}
