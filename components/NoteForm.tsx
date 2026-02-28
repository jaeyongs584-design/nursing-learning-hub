'use client'

import { useState } from 'react'
import { saveNoteAction } from '@/actions/note.actions'
import type { StudyMaterial } from '@/lib/services/material.service'

export default function NoteForm({ courseId, materials }: { courseId: string, materials: StudyMaterial[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [noteType, setNoteType] = useState<'STUDY' | 'SUMMARY'>('STUDY')

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        formData.append('course_id', courseId)

        try {
            const res = await saveNoteAction(formData)
            if (res?.error) {
                alert(res.error)
            } else {
                setIsOpen(false)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
                + 새 노트 작성
            </button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-white border p-6 rounded-xl shadow-lg mb-8 max-w-3xl">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="font-bold text-gray-900 text-lg">새 노트 작성</h3>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <label className={`px-3 py-1.5 rounded-md text-sm cursor-pointer font-medium transition ${noteType === 'STUDY' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <input
                            type="radio"
                            name="note_type"
                            value="STUDY"
                            className="hidden"
                            checked={noteType === 'STUDY'}
                            onChange={() => setNoteType('STUDY')}
                        />
                        오늘 배운 내용
                    </label>
                    <label className={`px-3 py-1.5 rounded-md text-sm cursor-pointer font-medium transition ${noteType === 'SUMMARY' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
                        <input
                            type="radio"
                            name="note_type"
                            value="SUMMARY"
                            className="hidden"
                            checked={noteType === 'SUMMARY'}
                            onChange={() => setNoteType('SUMMARY')}
                        />
                        핵심 요약
                    </label>
                </div>
            </div>

            <div className="space-y-5">
                <div>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full border-0 border-b-2 border-gray-200 p-2 text-xl font-bold focus:ring-0 focus:border-blue-500 placeholder-gray-300 transition"
                        placeholder="노트 제목을 입력하세요..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">연결할 자료 (선택)</label>
                        <select
                            name="material_id"
                            className="w-full border rounded-lg p-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="">-- 연결 안 함 --</option>
                            {materials.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.source_type === 'FILE' ? '📄' : '🔗'} {m.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Add Tags here later */}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 flex justify-between">
                        <span>내용 (Markdown 작성 가능)</span>
                        <span className="text-gray-400 font-normal">자유롭게 기록하세요</span>
                    </label>
                    <textarea
                        name="content"
                        required
                        rows={10}
                        className="w-full border rounded-xl p-4 text-sm font-mono text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition custom-scrollbar"
                        placeholder={noteType === 'STUDY' ? "오늘 배운 내용을 상세히 기록해보세요." : "시험 전 빠르게 훑어볼 핵심만 요약해보세요."}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-5 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-600 transition"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 shadow-sm transition"
                    >
                        {isSubmitting ? '저장 중...' : '노트 저장하기'}
                    </button>
                </div>
            </div>
        </form>
    )
}
