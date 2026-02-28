import { Sparkles, FileText, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { getAISummaries } from '@/actions/ai_summary.actions'
import AISummaryInput from '@/components/AISummaryInput'
import type { AISummaryResult } from '@/lib/ai/types'

export default async function AISummaryPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const summaries = await getAISummaries(courseId)

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="mb-6">
                <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                    &larr; 대시보드로 돌아가기
                </Link>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-yellow-500" size={24} />
                    AI 요약
                </h2>
                <p className="text-gray-500 mt-1">수업 자료와 노트를 AI가 핵심만 정리해 드려요.</p>
            </div>

            {/* 메인 요약 입력 컴포넌트 (내부에서 요약 히스토리 조회/클릭 지원) */}
            <AISummaryInput courseId={courseId} initialSummaries={summaries} />

            {/* 기능 안내 */}
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                <h4 className="font-bold text-blue-900 mb-2">📋 AI 요약이 제공하는 것</h4>
                <ul className="space-y-1.5 text-sm text-blue-800">
                    <li>📝 <strong>3줄 요약</strong> — 핵심 내용을 빠르게 파악</li>
                    <li>🧠 <strong>핵심 개념 정리</strong> — 용어 + 정의</li>
                    <li>🎯 <strong>시험 포인트</strong> — 시험에 나올 가능성 높은 항목</li>
                    <li>🃏 <strong>암기 카드</strong> — 플래시카드 자동 생성</li>
                    <li>🔑 <strong>빈출 키워드</strong> — 시험 빈출 용어 정리</li>
                </ul>
            </section>
        </div>
    )
}
