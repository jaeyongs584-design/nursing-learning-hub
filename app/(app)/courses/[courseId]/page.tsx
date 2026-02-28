import { getTasksByCourseId } from '@/lib/services/task.service'
import Link from 'next/link'
import { AlertCircle, Clock } from 'lucide-react'

export default async function CourseDashboardPage({
    params
}: {
    params: Promise<{ courseId: string }>
}) {
    const { courseId } = await params
    const tasks = await getTasksByCourseId(courseId)
    const pendingTasks = tasks.filter(t => t.status !== 'DONE')

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">과목 대시보드</h2>

            <div className="grid md:grid-cols-2 gap-6">

                {/* Tasks Summary */}
                <section className="border rounded-lg p-5">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-semibold flex items-center gap-2">
                            <CheckSquare size={18} className="text-blue-500" />
                            진행 중인 과제
                        </h3>
                        <span className="text-sm bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full font-medium">
                            {pendingTasks.length}건
                        </span>
                    </div>

                    <div className="space-y-3">
                        {pendingTasks.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">등록된 과제가 없습니다.</p>
                        ) : (
                            pendingTasks.slice(0, 3).map(task => (
                                <div key={task.id} className="flex justify-between items-start text-sm bg-gray-50 p-3 rounded">
                                    <div>
                                        <div className="font-medium text-gray-900">{task.title}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Clock size={12} />
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '마감일 없음'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t text-center">
                        <Link href={`/courses/${courseId}/tasks`} className="text-sm text-blue-600 hover:underline">
                            과제 관리로 이동 &rarr;
                        </Link>
                    </div>
                </section>

                {/* Quick Links / Status */}
                <section className="border rounded-lg p-5">
                    <h3 className="font-semibold mb-4 border-b pb-2">빠른 접근</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href={`/courses/${courseId}/materials`} className="bg-gray-50 p-4 rounded text-center hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                            <div className="text-2xl mb-1">📚</div>
                            <div className="text-sm font-medium text-gray-700">수업 자료</div>
                        </Link>
                        <Link href={`/courses/${courseId}/notes`} className="bg-gray-50 p-4 rounded text-center hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                            <div className="text-2xl mb-1">📝</div>
                            <div className="text-sm font-medium text-gray-700">노트 작성</div>
                        </Link>
                        <Link href={`/courses/${courseId}/wrong-answers`} className="bg-gray-50 p-4 rounded text-center hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                            <div className="text-2xl mb-1">🚨</div>
                            <div className="text-sm font-medium text-gray-700">오답 복습</div>
                        </Link>
                        <Link href={`/courses/${courseId}/quizzes`} className="bg-gray-50 p-4 rounded text-center hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                            <div className="text-2xl mb-1">💡</div>
                            <div className="text-sm font-medium text-gray-700">퀴즈 풀기</div>
                        </Link>
                    </div>
                </section>

            </div>
        </div>
    )
}

// Temporary import placeholder
import { CheckSquare } from 'lucide-react'
