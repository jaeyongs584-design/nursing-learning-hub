'use client'

import { useState, useRef } from 'react'
import { createMaterialAction } from '@/actions/material.actions'

export default function MaterialUpload({ courseId }: { courseId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [sourceType, setSourceType] = useState<'FILE' | 'LINK'>('FILE')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        formData.append('course_id', courseId)

        // Drag and dropped file needs to be appended manually if it wasn't set to the input
        if (selectedFile && !formData.get('file')) {
            formData.set('file', selectedFile)
        }

        try {
            const res = await createMaterialAction(formData)
            if (res?.error) {
                alert(res.error)
            } else {
                setIsOpen(false)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.size > 50 * 1024 * 1024) {
                alert('파일 크기는 50MB 이내여야 합니다.')
                return
            }
            setSelectedFile(file)
            if (fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files
            }
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.size > 50 * 1024 * 1024) {
                alert('파일 크기는 50MB 이내여야 합니다.')
                e.target.value = ''
                setSelectedFile(null)
                return
            }
            setSelectedFile(file)
        } else {
            setSelectedFile(null)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
                + 새 자료 추가
            </button>
        )
    }

    return (
        <form action={handleSubmit} className="bg-white border p-5 rounded-xl shadow-sm mb-6 max-w-2xl">
            <h3 className="font-semibold mb-4 text-gray-900 border-b pb-2">새 수업 자료 등록</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">자료 유형 *</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="source_type"
                                value="FILE"
                                checked={sourceType === 'FILE'}
                                onChange={() => { setSourceType('FILE'); setSelectedFile(null); }}
                                className="text-blue-600"
                            />
                            <span className="text-sm">파일 첨부</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="source_type"
                                value="LINK"
                                checked={sourceType === 'LINK'}
                                onChange={() => { setSourceType('LINK'); setSelectedFile(null); }}
                                className="text-blue-600"
                            />
                            <span className="text-sm">외부 링크</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">자료 제목 *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        className="w-full border rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder={sourceType === 'FILE' ? "예: 1주차 오리엔테이션 강의록" : "예: 심폐소생술 가이드라인 영상"}
                    />
                </div>

                {sourceType === 'FILE' ? (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">파일 첨부 * (Drag & Drop)</label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
                        >
                            <input
                                type="file"
                                name="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                required={!selectedFile}
                                className="hidden"
                            />
                            <div className="flex flex-col items-center justify-center gap-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                </div>
                                <div className="text-sm text-gray-700 font-medium">
                                    {selectedFile ? (
                                        <span className="text-blue-600 truncate max-w-full inline-block px-4">{selectedFile.name}</span>
                                    ) : (
                                        <span>이곳을 클릭하거나 파일을 드래그하여 놓아주세요.</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400">PDF, 이미지 문서 등 최대 50MB 이내</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">URL 주소 *</label>
                        <input
                            type="url"
                            name="external_url"
                            required
                            className="w-full border rounded p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://"
                        />
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <button
                        type="button"
                        onClick={() => { setIsOpen(false); setSelectedFile(null); }}
                        className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? '업로드 중...' : '등록하기'}
                    </button>
                </div>
            </div>
        </form>
    )
}
