'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createNoteFromScheduleAction } from '@/actions/note.actions'
import { FileText, Loader2 } from 'lucide-react'

export default function CreateNoteButton({ courseId, sessionId, small }: { courseId: string; sessionId?: string; small?: boolean }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setLoading(true)
        const result = await createNoteFromScheduleAction(courseId, sessionId)
        if (result.noteId) {
            router.push(`/courses/${result.courseId}/notes/${result.noteId}`)
        }
        setLoading(false)
    }

    if (small) {
        return (
            <button
                onClick={handleClick}
                disabled={loading}
                className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-semibold hover:bg-indigo-100 transition flex items-center gap-1 disabled:opacity-50"
            >
                {loading ? <Loader2 size={10} className="animate-spin" /> : <FileText size={10} />}
                노트
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-semibold hover:bg-indigo-100 transition disabled:opacity-50"
        >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <FileText size={12} />}
            노트 작성
        </button>
    )
}
