import GradeCalculator from '@/components/GradeCalculator'
import Link from 'next/link'

export default async function GradeCalcPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block font-medium">
                    &larr; 대시보드로 돌아가기
                </Link>
                <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">🎯 성적 시뮬레이터</h2>
                </div>
                <p className="text-gray-500 mt-2">평가 비율과 현재 점수를 입력하면, 목표 학점까지 필요한 점수를 알려드려요.</p>
            </div>

            <GradeCalculator />
        </div>
    )
}
