'use client'

import { useState } from 'react'
import { deleteQuizAction } from '@/actions/quiz.actions'
import type { Quiz } from '@/lib/services/quiz.service'
import Link from 'next/link'

export default function QuizItem({ quiz, courseId }: { quiz: Quiz, courseId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // prevent navigating
        if (!confirm('정말 이 퀴즈를 삭제하시겠습니까? 안의 문제들도 모두 삭제됩니다.')) return;
        setIsDeleting(true)
        await deleteQuizAction(quiz.id, courseId)
        setIsDeleting(false)
    }

    return (
        <Link
            href={`/courses/${courseId}/quizzes/${quiz.id}`}
            className={`block p-5 border rounded-xl bg-white ${isDeleting ? 'opacity-50' : 'hover:border-blue-400 hover:shadow-md'} transition group relative`}
        >
            <div className="flex justify-between items-start pr-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                            <span className="text-sm">💡</span> 퀴즈 세트
                        </span>
                        <span className="text-xs text-gray-400 px-2">생성일: {new Date(quiz.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition">{quiz.title}</h4>
                    {quiz.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{quiz.description}</p>
                    )}
                </div>
            </div>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                title="삭제"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
            </button>
        </Link>
    )
}
