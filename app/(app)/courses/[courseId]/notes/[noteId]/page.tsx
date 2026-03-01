import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NoteDetailClient from '@/components/note/NoteDetailClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NoteDetailPage({
    params,
}: {
    params: Promise<{ courseId: string; noteId: string }>
}) {
    const { courseId, noteId } = await params
    const supabase = await createClient()

    const { data: note } = await supabase
        .from('notes')
        .select('*, courses(name)')
        .eq('id', noteId)
        .single()

    if (!note) notFound()

    return (
        <div>
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={`/courses/${courseId}/notes`}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition"
                >
                    <ArrowLeft size={14} />
                    노트 목록
                </Link>
                <span className="text-gray-300">·</span>
                {/* @ts-ignore */}
                <span className="text-sm text-gray-500">{note.courses?.name}</span>
            </div>

            <NoteDetailClient
                note={{
                    id: note.id,
                    course_id: note.course_id,
                    title: note.title,
                    content: note.content,
                    ai_summary: note.ai_summary,
                    ai_keypoints: note.ai_keypoints,
                    ai_exam_points: note.ai_exam_points,
                    ai_flashcards: note.ai_flashcards,
                    ai_generated_at: note.ai_generated_at,
                }}
            />
        </div>
    )
}
