import { getQuizzesByCourseId } from '@/lib/services/quiz.service'
import { getNotesByCourseId } from '@/lib/services/note.service'
import QuizForm from '@/components/QuizForm'
import QuizItem from '@/components/QuizItem'
import AIQuizGenerator from '@/components/AIQuizGenerator'
import Link from 'next/link'

export default async function CourseQuizzesPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const quizzes = await getQuizzesByCourseId(courseId)
    const notes = await getNotesByCourseId(courseId)

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block font-medium">
                        &larr; 대시보드로 돌아가기
                    </Link>
                    <div className="flex items-center gap-3 mt-1">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">퀴즈 풀기</h2>
                    </div>
                    <p className="text-gray-500 mt-2">나만의 퀴즈 세트를 만들고 실력을 점검해 보세요.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <AIQuizGenerator courseId={courseId} initialNotes={notes} />
                    <QuizForm courseId={courseId} />
                </div>
            </div>

            <div className="mt-8">
                {quizzes.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center">
                        <div className="text-5xl mb-4">🧩</div>
                        <p className="text-gray-600 font-bold text-lg mb-2">등록된 퀴즈가 없습니다.</p>
                        <p className="text-gray-500 mb-6">배운 내용을 바탕으로 퀴즈를 직접 만들면 학습 효과가 배가 됩니다!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {quizzes.map(quiz => (
                            <QuizItem key={quiz.id} quiz={quiz} courseId={courseId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
