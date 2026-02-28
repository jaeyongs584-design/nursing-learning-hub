import { getProfessorStyle } from '@/lib/services/professor-style.service'
import ProfessorStyleEditor from '@/components/ProfessorStyleEditor'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default async function ProfessorStylePage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    let initialStyle = null
    try {
        initialStyle = await getProfessorStyle(courseId)
    } catch {
        // DB 테이블 미존재 시 null
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="mb-6">
                <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                    &larr; 과목 대시보드로 돌아가기
                </Link>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <GraduationCap className="text-indigo-600" size={28} />
                    교수 스타일 태깅
                </h2>
                <p className="text-gray-500 mt-1">교수님의 출제 유형과 강조 포인트를 기록하면 AI가 맞춤형 학습 추천을 해드려요.</p>
            </div>

            <ProfessorStyleEditor courseId={courseId} initialStyle={initialStyle} />
        </div>
    )
}
