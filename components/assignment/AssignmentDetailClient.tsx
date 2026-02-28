'use client'

import { useState, useEffect } from 'react'
import AssignmentTabs, { type TabId } from '@/components/assignment/AssignmentTabs'
import RequirementsAnalyzer from '@/components/assignment/RequirementsAnalyzer'
import ReportWriter from '@/components/assignment/ReportWriter'
import PptOutlineGenerator from '@/components/assignment/PptOutlineGenerator'
import SubmissionChecklist from '@/components/assignment/SubmissionChecklist'
import AssignmentFilesTab from '@/components/assignment/AssignmentFilesTab'
import { Calendar, BookOpen, Clock, AlertCircle } from 'lucide-react'

interface AssignmentClientProps {
    task: {
        id: string
        title: string
        description: string | null
        due_date: string | null
        status: string
        course: { name: string } | null
    }
    assignment: {
        id: string
        weight_percent: number | null
        estimated_minutes: number | null
    } | null
    initialRequirements: unknown
    initialOutline: unknown
    initialDraft: unknown
    initialPpt: unknown
    assignmentFiles?: any[]
    courseId: string
}

export default function AssignmentDetailClient({
    task,
    assignment,
    initialRequirements,
    initialOutline,
    initialDraft,
    initialPpt,
    assignmentFiles = [],
    courseId,
}: AssignmentClientProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview')

    const assignmentId = assignment?.id || ''

    return (
        <div>
            <AssignmentTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* ── 개요 탭 ── */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{task.title}</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><BookOpen size={12} /> 과목</div>
                                <div className="font-semibold text-sm text-gray-800">{task.course?.name || '-'}</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Calendar size={12} /> 마감일</div>
                                <div className="font-semibold text-sm text-gray-800">
                                    {task.due_date ? new Date(task.due_date).toLocaleDateString('ko-KR') : '미정'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">상태</div>
                                <div className={`font-semibold text-sm ${task.status === 'DONE' ? 'text-green-600' : task.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-orange-600'}`}>
                                    {task.status === 'DONE' ? '완료' : task.status === 'IN_PROGRESS' ? '진행중' : '할 일'}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">점수 비중</div>
                                <div className="font-semibold text-sm text-gray-800">
                                    {assignment?.weight_percent ? `${assignment.weight_percent}%` : '-'}
                                </div>
                            </div>
                        </div>

                        {task.description && (
                            <div className="prose prose-sm max-w-none text-gray-700">
                                <p>{task.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <h4 className="font-bold text-blue-900 mb-3">🚀 빠른 시작 가이드</h4>
                        <ol className="space-y-2 text-sm text-blue-800">
                            <li><strong>1단계:</strong> <button onClick={() => setActiveTab('requirements')} className="underline font-medium">요구사항 탭</button>에서 과제 공지를 분석하세요.</li>
                            <li><strong>2단계:</strong> <button onClick={() => setActiveTab('report')} className="underline font-medium">보고서 작성 탭</button>에서 목차와 초안을 생성하세요.</li>
                            <li><strong>3단계:</strong> 발표 과제라면 <button onClick={() => setActiveTab('ppt')} className="underline font-medium">PPT 탭</button>에서 슬라이드 구조를 만드세요.</li>
                            <li><strong>4단계:</strong> <button onClick={() => setActiveTab('checklist')} className="underline font-medium">점검 탭</button>에서 누락 항목을 확인하고 제출하세요.</li>
                        </ol>
                    </div>
                </div>
            )}

            {/* ── 요구사항 탭 ── */}
            {activeTab === 'requirements' && (
                <RequirementsAnalyzer
                    assignmentId={assignmentId}
                    initialData={initialRequirements as any}
                />
            )}

            {/* ── 자료함 탭 ── */}
            {activeTab === 'files' && (
                <AssignmentFilesTab
                    assignmentId={assignmentId}
                    courseId={courseId}
                    initialFiles={assignmentFiles}
                />
            )}

            {/* ── 보고서 작성 탭 ── */}
            {activeTab === 'report' && (
                <ReportWriter
                    assignmentId={assignmentId}
                    initialOutline={initialOutline as any}
                    initialDraft={initialDraft as any}
                    topic={task.title}
                />
            )}

            {/* ── PPT 생성 탭 ── */}
            {activeTab === 'ppt' && (
                <PptOutlineGenerator
                    assignmentId={assignmentId}
                    initialPpt={initialPpt as any}
                    topic={task.title}
                />
            )}

            {/* ── 제출 전 점검 탭 ── */}
            {activeTab === 'checklist' && (
                <SubmissionChecklist />
            )}
        </div>
    )
}
