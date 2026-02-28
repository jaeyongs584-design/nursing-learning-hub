'use client'

import { useState } from 'react'
import { addQuizQuestionAction } from '@/actions/quiz.actions'

export default function QuestionForm({ quizId }: { quizId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [questionType, setQuestionType] = useState<'MULTIPLE_CHOICE' | 'SHORT_ANSWER'>('MULTIPLE_CHOICE')
    const [options, setOptions] = useState(['', '', '', '']) // Default 4 options

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)

        const questionText = formData.get('question_text') as string
        const answer = formData.get('answer') as string
        const explanation = formData.get('explanation') as string

        // Filter out empty options
        const validOptions = questionType === 'MULTIPLE_CHOICE' ? options.filter(o => o.trim() !== '') : []

        try {
            const res = await addQuizQuestionAction(quizId, questionText, questionType, validOptions, answer, explanation)
            if (res?.error) {
                alert(res.error)
            } else {
                setIsOpen(false)
                setOptions(['', '', '', '']) // Reset
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options]
        newOptions[index] = value
        setOptions(newOptions)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition"
            >
                + 새 문항 추가하기
            </button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-white border-2 border-blue-100 p-6 rounded-xl shadow-lg mt-6">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold text-gray-900 text-lg">새 문항 출제</h3>
                <div className="flex gap-2">
                    <label className={`px-3 py-1.5 rounded-md text-sm cursor-pointer font-medium transition ${questionType === 'MULTIPLE_CHOICE' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <input type="radio" name="question_type" className="hidden" value="MULTIPLE_CHOICE" checked={questionType === 'MULTIPLE_CHOICE'} onChange={() => setQuestionType('MULTIPLE_CHOICE')} />
                        객관식
                    </label>
                    <label className={`px-3 py-1.5 rounded-md text-sm cursor-pointer font-medium transition ${questionType === 'SHORT_ANSWER' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <input type="radio" name="question_type" className="hidden" value="SHORT_ANSWER" checked={questionType === 'SHORT_ANSWER'} onChange={() => setQuestionType('SHORT_ANSWER')} />
                        주관식 (단답형)
                    </label>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">문제 지문 📝</label>
                    <textarea
                        name="question_text"
                        required
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition"
                        placeholder="문제를 상세히 입력하세요."
                    />
                </div>

                {questionType === 'MULTIPLE_CHOICE' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label className="block text-sm font-bold text-blue-900 mb-3">보기 (객관식 옵션)</label>
                        <div className="space-y-2">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => updateOption(idx, e.target.value)}
                                        className="flex-1 border rounded p-2 text-sm focus:border-blue-500 bg-white"
                                        placeholder={`보기 ${idx + 1} 내용`}
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-blue-600 mt-2 ml-8 font-medium">* 비워둔 보기는 자동으로 제외됩니다.</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-green-800 mb-2">정답 🎯</label>
                    <input
                        type="text"
                        name="answer"
                        required
                        className="w-full border border-green-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 bg-green-50 focus:bg-white transition"
                        placeholder={questionType === 'MULTIPLE_CHOICE' ? "정답 번호 (예: 1) 또는 텍스트 그대로 입력" : "정확한 답안을 입력하세요."}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2">해설 (선택)</label>
                    <textarea
                        name="explanation"
                        rows={2}
                        className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition"
                        placeholder="이 문제에 대한 추가적인 설명이나 풀이를 적어주세요."
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-5 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-600 transition"
                    >
                        문제 작성을 취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 shadow-md transition"
                    >
                        {isSubmitting ? '추가 중...' : '문항 추가하기'}
                    </button>
                </div>
            </div>
        </form>
    )
}
