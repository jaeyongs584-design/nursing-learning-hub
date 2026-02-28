'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteNoteAction } from '@/actions/note.actions'
import type { Note } from '@/lib/services/note.service'

export default function NoteItem({ note, courseId }: { note: Note, courseId: string }) {
    const [isDeleting, startDeleting] = useTransition()
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm('이 노트를 삭제하시겠습니까?')) return;
        startDeleting(async () => {
            const res = await deleteNoteAction(note.id, courseId)
            if (res?.error) {
                alert(res.error)
            } else {
                router.refresh()
            }
        })
    }

    return (
        <div className={`p-5 border rounded-xl bg-white ${isDeleting ? 'opacity-50' : 'hover:shadow-sm'} transition flex flex-col gap-3 group`}>
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${note.note_type === 'SUMMARY' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {note.note_type === 'SUMMARY' ? '핵심 요약' : '오늘 배운 내용'}
                    </span>
                    <h4 className="font-bold text-gray-900 text-lg">{note.title}</h4>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                    {/* Add Edit button here later if needed */}
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                        title="삭제"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>

            {/* Note Content (Simple whitespace wrapping for now, could be markdown) */}
            <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto pr-2 custom-scrollbar border-l-2 border-gray-100 pl-3">
                {note.content}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-3 border-t">
                <div className="flex items-center gap-4">
                    <span>작성: {new Date(note.created_at).toLocaleString()}</span>
                    {note.material && (
                        <span className="flex items-center gap-1 text-blue-500 bg-blue-50 px-2 py-0.5 rounded">
                            {note.material.source_type === 'FILE' ? '📄' : '🔗'} 연결된 자료: {note.material.title}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
