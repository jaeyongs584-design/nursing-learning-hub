'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Quiz, QuizQuestion } from '@/lib/services/quiz.service'
import { submitQuizAttemptAction } from '@/actions/quiz_attempt.actions'

export default function QuizTakeForm({
    quiz,
    questions,
    courseId
}: {
    quiz: Quiz
    questions: QuizQuestion[]
    courseId: string
}) {
    const router = useRouter()
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleOptionSelect = (questionId: string, option: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: option
        }))
    }

    const handleTextChange = (questionId: string, text: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: text
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validation: Ensure all questions have an answer (optional, but good UX)
        if (Object.keys(answers).length < questions.length) {
            if (!confirm('아직 풀지 않은 문제가 있습니다. 그래도 제출하시겠습니까?')) {
                return
            }
        }

        setIsSubmitting(true)
        try {
            const attemptId = await submitQuizAttemptAction(courseId, quiz.id, answers)
            // Redirect to result page
            router.push(`/courses/${courseId}/quizzes/${quiz.id}/attempts/${attemptId}`)
        } catch (error) {
            console.error(error)
            alert('제출 중 오류가 발생했습니다.')
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
            {questions.map((q, idx) => (
                <div key={q.id} className="bg-white border rounded-xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 whitespace-pre-wrap leading-relaxed">
                        <span className="text-blue-600 mr-2">{idx + 1}.</span>
                        {q.question_text}
                    </h3>

                    {q.question_type === 'MULTIPLE_CHOICE' && q.options && (
                        <div className="space-y-3">
                            {(Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string)).map((opt: string, oIdx: number) => (
                                <label
                                    key={oIdx}
                                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition ${answers[q.id] === opt ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                                >
                                    <input
                                        type="radio"
                                        name={`question_${q.id}`}
                                        value={opt}
                                        checked={answers[q.id] === opt}
                                        onChange={() => handleOptionSelect(q.id, opt)}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-800 font-medium">{opt}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {q.question_type === 'SHORT_ANSWER' && (
                        <div>
                            <textarea
                                rows={3}
                                value={answers[q.id] || ''}
                                onChange={(e) => handleTextChange(q.id, e.target.value)}
                                placeholder="정답을 입력하세요."
                                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                            />
                        </div>
                    )}
                </div>
            ))}

            <div className="sticky bottom-6 bg-white border rounded-xl p-4 shadow-lg flex justify-between items-center z-10">
                <div className="text-gray-600 font-medium">
                    <span className="text-blue-600 font-bold">{Object.keys(answers).length}</span> / {questions.length} 문항 완료
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {isSubmitting ? '제출 및 채점 중...' : '최종 답안 제출하기'}
                </button>
            </div>
        </form>
    )
}
