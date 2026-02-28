'use client'

import { useState } from 'react'
import { saveWrongAnswerAction } from '@/actions/wrong_answer.actions'
import { useRouter } from 'next/navigation'

export default function CopyToWrongAnswerButton({
    courseId,
    question,
    myAnswer,
    correctAnswer,
    explanation
}: {
    courseId: string
    question: string
    myAnswer: string
    correctAnswer: string
    explanation: string
}) {
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const router = useRouter()

    const handleCopy = async () => {
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.append('course_id', courseId)
            formData.append('question', question)
            formData.append('my_answer', myAnswer)
            formData.append('correct_answer', correctAnswer)
            formData.append('reason', '퀴즈 풀이 중 오답')
            formData.append('explanation', explanation || '')

            const result = await saveWrongAnswerAction(formData)
            if (result?.error) {
                alert(result.error)
            } else {
                setSaved(true)
                if (confirm('오답노트에 성공적으로 복사되었습니다. 오답노트 페이지로 이동할까요?')) {
                    router.push(`/courses/${courseId}/wrong-answers`)
                }
            }
        } catch (error) {
            console.error(error)
            alert('오류가 발생했습니다.')
        } finally {
            setIsSaving(false)
        }
    }

    if (saved) {
        return (
            <button disabled className="mt-4 bg-gray-100 text-gray-500 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1">
                <span>✅</span> 복사 완료됨
            </button>
        )
    }

    return (
        <button
            onClick={handleCopy}
            disabled={isSaving}
            className="mt-4 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-lg font-bold text-sm transition flex items-center gap-1"
        >
            <span>📝</span> {isSaving ? '복사 중...' : '오답노트에 복사하기'}
        </button>
    )
}
