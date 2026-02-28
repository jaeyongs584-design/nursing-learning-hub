import { getQuizWithQuestions } from '@/lib/services/quiz.service'
import QuizTakeForm from '@/components/QuizTakeForm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function QuizTakePage({ params }: { params: Promise<{ courseId: string, quizId: string }> }) {
    const { courseId, quizId } = await params
    const data = await getQuizWithQuestions(quizId)

    if (!data) {
        notFound()
    }

    const { quiz, questions } = data

    if (questions.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center space-y-4">
                <h2 className="text-2xl font-bold">문제가 없는 퀴즈입니다</h2>
                <p className="text-gray-500">문제를 먼저 추가한 후 퀴즈를 풀어주세요.</p>
                <Link href={`/courses/${courseId}/quizzes/${quizId}`}>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">퀴즈 관리로 돌아가기</button>
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="mb-8">
                <Link href={`/courses/${courseId}/quizzes/${quizId}`} className="text-sm text-gray-500 hover:text-blue-600 hover:underline mb-2 inline-block">
                    &larr; 취소하고 돌아가기
                </Link>
                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                    {quiz.title} <span className="text-blue-600">풀이 중</span>
                </h1>
                <p className="text-gray-500 mt-2">최선을 다해 문제를 풀어보세요. 제출 후 바로 결과를 확인할 수 있습니다.</p>
            </div>

            <QuizTakeForm quiz={quiz} questions={questions} courseId={courseId} />
        </div>
    )
}
