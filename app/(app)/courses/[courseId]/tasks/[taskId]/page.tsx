import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
    getAssignmentDetail,
    ensureAssignment,
    getLatestRequirements,
    getLatestDraft,
    getAssignmentFiles,
} from '@/actions/assignment.actions'
import AssignmentDetailClient from '@/components/assignment/AssignmentDetailClient'

export default async function TaskDetailPage({
    params,
}: {
    params: Promise<{ courseId: string; taskId: string }>
}) {
    const { courseId, taskId } = await params

    // 기존 task + assignment 확장 데이터 조회
    const detail = await getAssignmentDetail(taskId)

    if (!detail?.task) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center">
                <p className="text-gray-500">과제를 찾을 수 없습니다.</p>
                <Link href={`/courses/${courseId}/tasks`} className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                    과제 목록으로 돌아가기
                </Link>
            </div>
        )
    }

    // assignment 확장 테이블 자동 생성 (없으면)
    const assignment = detail.assignment || await ensureAssignment(taskId, courseId)

    // 저장된 데이터 미리 조회
    let initialRequirements = null
    let initialOutline = null
    let initialDraft = null
    let initialPpt = null
    let assignmentFiles: any[] = []

    if (assignment?.id) {
        ;[initialRequirements, initialOutline, initialDraft, initialPpt, assignmentFiles] = await Promise.all([
            getLatestRequirements(assignment.id),
            getLatestDraft(assignment.id, 'report_outline'),
            getLatestDraft(assignment.id, 'report_draft'),
            getLatestDraft(assignment.id, 'ppt_outline'),
            getAssignmentFiles(assignment.id)
        ])
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* 헤더 */}
            <div>
                <Link
                    href={`/courses/${courseId}/tasks`}
                    className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mb-2"
                >
                    <ArrowLeft size={14} />
                    과제 목록으로 돌아가기
                </Link>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                        📝 {detail.task.title}
                    </h1>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        AI 워크스페이스
                    </span>
                </div>
            </div>

            {/* 과제 AI 스튜디오 */}
            <AssignmentDetailClient
                task={detail.task}
                assignment={assignment}
                initialRequirements={initialRequirements}
                initialOutline={initialOutline}
                initialDraft={initialDraft}
                initialPpt={initialPpt}
                assignmentFiles={assignmentFiles}
                courseId={courseId}
            />
        </div>
    )
}
