import { getWrongAnswersByCourseId } from '@/lib/services/wrong_answer.service'
import WrongAnswerForm from '@/components/WrongAnswerForm'
import WrongAnswerItem from '@/components/WrongAnswerItem'
import Link from 'next/link'

export default async function CourseWrongAnswersPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const wrongAnswers = await getWrongAnswersByCourseId(courseId)

    // Optional MVP: client-side filtering by tag (for now, simply list them)
    // Actually, to keep MVP simple, we'll just show the list.

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block font-medium">
                    &larr; 대시보드로 돌아가기
                </Link>
                <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">오답 복습 피드</h2>
                    <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full font-semibold">{wrongAnswers.length}개</span>
                </div>
                <p className="text-gray-500 mt-2">틀렸던 문제를 기록하고 분석하여 같은 실수를 반복하지 마세요.</p>
            </div>

            <WrongAnswerForm courseId={courseId} />

            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-red-500">📝</span>
                        기록된 오답 노트
                    </h3>
                </div>

                {wrongAnswers.length === 0 ? (
                    <div className="p-12 text-center bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center">
                        <div className="text-4xl mb-4">🙌</div>
                        <p className="text-gray-500 font-medium">잘하고 있어요! 아직 기록된 오답이 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-1">시험이나 퀴즈에서 틀린 문제가 생기면 이곳에 가장 먼저 기록해보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {wrongAnswers.map((note: any) => (
                            <WrongAnswerItem key={note.id} note={note} courseId={courseId} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
