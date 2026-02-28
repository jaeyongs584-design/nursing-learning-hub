'use client'

import { useState } from 'react'
import { createQuizAction } from '@/actions/quiz.actions'
import { useRouter } from 'next/navigation'

export default function QuizForm({ courseId }: { courseId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        formData.append('course_id', courseId)

        try {
            const res = await createQuizAction(formData)
            if (res?.error) {
                alert(res.error)
            } else if (res?.success && res.quizId) {
                // Redirect to quiz detail/edit page where questions can be added
                setIsOpen(false)
                router.push(`/courses/${courseId}/quizzes/${res.quizId}`)
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
                + 새 퀴즈 만들기
            </button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-white border p-6 rounded-xl shadow-md mb-8 max-w-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-4 border-b pb-2">새 퀴즈 세트 만들기</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">퀴즈 제목 *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="예: 3주차 해부학 복습 퀴즈"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-1">설명 (선택)</label>
                    <textarea
                        name="description"
                        rows={2}
                        className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="이 퀴즈 세트에 대한 간단한 설명을 적어주세요."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2 mt-2">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-600 transition"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm transition"
                    >
                        {isSubmitting ? '생성 중...' : '만들기 및 문제 추가'}
                    </button>
                </div>
            </div>
        </form>
    )
}
