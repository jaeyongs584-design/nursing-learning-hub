import { getNotesByCourseId } from '@/lib/services/note.service'
import { getMaterialsByCourseId } from '@/lib/services/material.service'
import NoteForm from '@/components/NoteForm'
import NoteItem from '@/components/NoteItem'
import Link from 'next/link'

export default async function CourseNotesPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params
    const notes = await getNotesByCourseId(courseId)
    const materials = await getMaterialsByCourseId(courseId)

    const studyNotes = notes.filter((n: any) => n.note_type === 'STUDY')
    const summaryNotes = notes.filter((n: any) => n.note_type === 'SUMMARY')

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block font-medium">
                    &larr; 대시보드로 돌아가기
                </Link>
                <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">통합 노트</h2>
                    <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full font-semibold">{notes.length}개의 기록</span>
                </div>
                <p className="text-gray-500 mt-2">오늘 배운 내용을 기록하고, 시험 기간을 위한 핵심 요약본을 만들어 보세요.</p>
            </div>

            <NoteForm courseId={courseId} materials={materials} />

            <div className="space-y-12">
                {/* 오늘 배운 내용 */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold">📖</div>
                        <h3 className="text-2xl font-bold text-gray-900">오늘 배운 내용</h3>
                    </div>

                    {studyNotes.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[150px]">
                            <p className="text-gray-400 font-medium">아직 기록된 '오늘 배운 내용'이 없습니다.</p>
                            <p className="text-xs text-gray-300 mt-1">새 노트를 추가하여 학습 내용을 복습해보세요.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {studyNotes.map((note: any) => (
                                <NoteItem key={note.id} note={note} courseId={courseId} />
                            ))}
                        </div>
                    )}
                </section>

                {/* 핵심 요약 */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded bg-purple-100 flex items-center justify-center text-purple-600 font-bold">💡</div>
                        <h3 className="text-2xl font-bold text-gray-900">핵심 요약</h3>
                    </div>

                    {summaryNotes.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 border border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[150px]">
                            <p className="text-gray-400 font-medium">아직 정리된 '핵심 요약'이 없습니다.</p>
                            <p className="text-xs text-gray-300 mt-1">시험 전에 중요 개념들만 모아서 나만의 요약본을 만들어보세요.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {summaryNotes.map((note: any) => (
                                <NoteItem key={note.id} note={note} courseId={courseId} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
