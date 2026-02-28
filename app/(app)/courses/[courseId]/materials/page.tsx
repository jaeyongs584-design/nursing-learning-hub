import { getMaterialsByCourseId } from '@/lib/services/material.service'
import MaterialUpload from '@/components/MaterialUpload'
import MaterialItem from '@/components/MaterialItem'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default async function CourseMaterialsPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const materials = await getMaterialsByCourseId(courseId)

    const files = materials.filter(m => m.source_type === 'FILE')
    const links = materials.filter(m => m.source_type === 'LINK')

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                        &larr; 대시보드로 돌아가기
                    </Link>
                    <h2 className="text-2xl font-bold flex items-center gap-2">수업 자료</h2>
                    <p className="text-gray-500 mt-1">강의 교재, 참고 문헌, 유용한 영상 링크 등을 모아두세요.</p>
                </div>
                <Link
                    href={`/courses/${courseId}/ai-summary`}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 shadow-sm flex-shrink-0"
                >
                    <Sparkles size={16} />
                    AI 요약 생성
                </Link>
            </div>

            <MaterialUpload courseId={courseId} />

            <div className="space-y-8">
                {/* 첨부 파일 리스트 */}
                <section>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 pb-2 border-b">
                        <span className="text-blue-500">📄</span>
                        <span>첨부 파일</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium ml-2">{files.length}</span>
                    </h3>

                    {files.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 border border-dashed rounded-xl">
                            <p className="text-gray-500 text-sm">업로드된 수업 자료 파일이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {files.map(material => (
                                <MaterialItem key={material.id} material={material} />
                            ))}
                        </div>
                    )}
                </section>

                {/* 외부 링크 리스트 */}
                <section>
                    <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 pb-2 border-b">
                        <span className="text-green-500">🔗</span>
                        <span>외부 링크</span>
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium ml-2">{links.length}</span>
                    </h3>

                    {links.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 border border-dashed rounded-xl">
                            <p className="text-gray-500 text-sm">등록된 외부 링크(영상, 웹페이지 등)가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {links.map(material => (
                                <MaterialItem key={material.id} material={material} />
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    )
}
