'use client'

import { useState } from 'react'
import { saveWrongAnswerAction } from '@/actions/wrong_answer.actions'

export default function WrongAnswerForm({ courseId }: { courseId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        formData.append('course_id', courseId)

        try {
            const res = await saveWrongAnswerAction(formData)
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
                + 새 오답노트 등록
            </button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-white border-2 border-red-100 p-6 rounded-xl shadow-md mb-8 max-w-3xl">
            <h3 className="font-bold text-gray-900 text-lg mb-6 border-b pb-2 flex items-center gap-2">
                <span className="text-red-500">🚨</span> 오답 꼼꼼히 기록하기
            </h3>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">어떤 문제였나요? *</label>
                    <textarea
                        name="question"
                        required
                        rows={3}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
                        placeholder="틀린 문제의 지문이나 핵심 문항을 적어주세요."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <label className="block text-xs font-bold text-red-800 mb-2">내가 선택한 답 (오답)</label>
                        <textarea
                            name="my_answer"
                            rows={2}
                            className="w-full border-red-200 rounded p-2 text-sm focus:ring-red-500"
                            placeholder="왜 이 답을 골랐는지 기억나나요?"
                        />
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <label className="block text-xs font-bold text-green-800 mb-2">실제 정답</label>
                        <textarea
                            name="correct_answer"
                            rows={2}
                            className="w-full border-green-200 rounded p-2 text-sm focus:ring-green-500"
                            placeholder="정답 내용을 적어주세요."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">틀린 이유 분석 🧠</label>
                    <textarea
                        name="reason"
                        rows={2}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
                        placeholder="단순 실수? 개념 부족? 지문 오독? 틀린 원인을 명확히 적어보세요."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">핵심 해설 및 개념 정리</label>
                    <textarea
                        name="explanation"
                        rows={3}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
                        placeholder="이 문제를 풀기 위해 꼭 알아야 할 핵심 개념을 정리하세요."
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">태그 (선택)</label>
                    <input
                        type="text"
                        name="tags"
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition"
                        placeholder="쉼표(,)로 구분하여 입력 예: 투약, 약리학, 중간고사"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-5 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-600 transition"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm transition"
                    >
                        {isSubmitting ? '저장 중...' : '오답노트 완성'}
                    </button>
                </div>
            </div>
        </form>
    )
}
