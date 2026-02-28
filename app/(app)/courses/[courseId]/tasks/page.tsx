import { getTasksByCourseId } from '@/lib/services/task.service'
import TaskForm from '@/components/TaskForm'
import TaskItem from '@/components/TaskItem'
import Link from 'next/link'

export default async function CourseTasksPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const tasks = await getTasksByCourseId(courseId)

    // Group tasks
    const pendingTasks = tasks.filter(t => t.status !== 'DONE')
    const completedTasks = tasks.filter(t => t.status === 'DONE')

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                        &larr; 대시보드로 돌아가기
                    </Link>
                    <h2 className="text-2xl font-bold flex items-center gap-2">과제 관리</h2>
                </div>
                <TaskForm courseId={courseId} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* 진행 중인 과제 */}
                <section>
                    <h3 className="font-semibold text-lg flex justify-between items-center mb-4 border-b pb-2">
                        <span>진행 중</span>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{pendingTasks.length}</span>
                    </h3>

                    {pendingTasks.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 border border-dashed rounded-xl flex flex-col items-center justify-center">
                            <p className="text-gray-500 font-medium mb-2">진행 중인 과제가 없습니다.</p>
                            <p className="text-xs text-gray-400 mb-4">우측 상단 '새 과제 등록' 버튼을 눌러 과제를 추가하고,<br />AI 보고서 작성 도우미를 체험해 보세요!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingTasks.map(task => (
                                <TaskItem key={task.id} task={task} courseId={courseId} />
                            ))}
                        </div>
                    )}
                </section>

                {/* 완료된 과제 */}
                <section>
                    <h3 className="font-semibold text-lg flex justify-between items-center mb-4 border-b pb-2 text-gray-500">
                        <span>완료됨</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{completedTasks.length}</span>
                    </h3>

                    {completedTasks.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 border border-dashed rounded-xl">
                            <p className="text-gray-400 text-sm">완료된 과제가 아직 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 opacity-75">
                            {completedTasks.map(task => (
                                <TaskItem key={task.id} task={task} courseId={courseId} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
