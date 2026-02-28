import { getReviewItemsForSession } from '@/lib/services/review.service'
import ReviewSession from '@/components/ReviewSession'
import Link from 'next/link'
import { Brain } from 'lucide-react'

export default async function ReviewSessionPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>
}) {
    const { filter = 'all' } = await searchParams

    let items: Awaited<ReturnType<typeof getReviewItemsForSession>> = []
    let error: string | null = null

    try {
        items = await getReviewItemsForSession(filter)
    } catch (e: any) {
        error = e.message || '복습 데이터를 불러오지 못했습니다.'
    }

    const filterLabels: Record<string, string> = {
        all: '오늘 + 기한 초과',
        overdue: '기한 초과만',
        today: '오늘 복습만',
    }
    const filterLabel = filterLabels[filter] || '과목별 필터'

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <Link href="/review" className="text-sm text-blue-600 hover:underline mb-1 inline-block">
                        &larr; 스케줄로 돌아가기
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Brain className="text-indigo-600" size={24} />
                        복습 세션
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        필터: {filterLabel} · {items.length}개 항목
                    </p>
                </div>
            </div>

            {/* 에러 상태 */}
            {error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <div className="text-3xl mb-3">⚠️</div>
                    <p className="text-red-800 font-medium mb-2">오류가 발생했습니다</p>
                    <p className="text-sm text-red-600">{error}</p>
                    <Link
                        href="/review"
                        className="mt-4 inline-block bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition"
                    >
                        돌아가기
                    </Link>
                </div>
            ) : (
                <ReviewSession items={items} />
            )}
        </div>
    )
}
