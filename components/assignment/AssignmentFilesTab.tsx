'use client'

import { useState, useRef } from 'react'
import { uploadAssignmentFileAction, deleteAssignmentFileAction } from '@/actions/assignment.actions'
import { FileText, Trash2, UploadCloud, AlertCircle } from 'lucide-react'

export default function AssignmentFilesTab({
    assignmentId,
    courseId,
    initialFiles = []
}: {
    assignmentId: string
    courseId: string
    initialFiles: any[]
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    async function handleUpload(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedFile) return

        setIsSubmitting(true)
        const formData = new FormData()
        formData.append('assignment_id', assignmentId)
        formData.append('course_id', courseId)
        formData.append('file', selectedFile)

        try {
            const res = await uploadAssignmentFileAction(formData)
            if (res?.error) {
                alert(res.error)
            } else {
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
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

    const handleDelete = async (id: string, storagePath: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return
        await deleteAssignmentFileAction(id, storagePath, courseId, assignmentId)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <UploadCloud size={18} className="text-blue-600" />
                    새 자료 업로드
                </h3>

                <form onSubmit={handleUpload} className="space-y-4">
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
                            className="hidden"
                        />
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                <UploadCloud size={20} />
                            </div>
                            <div className="text-sm text-gray-700 font-medium">
                                {selectedFile ? (
                                    <span className="text-blue-600 truncate max-w-full inline-block px-4">{selectedFile.name}</span>
                                ) : (
                                    <span>이곳을 클릭하거나 파일을 드래그하여 놓아주세요.</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400">최대 50MB 이내의 문서, 이미지 파일</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedFile}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? '업로드 중...' : '업로드하기'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-gray-700" />
                    저장된 자료 목록
                </h3>

                {initialFiles.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm bg-gray-50 rounded-xl border border-dashed">
                        아직 업로드된 자료가 없습니다. 과제 관련 자료를 추가해 보세요.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {initialFiles.map(file => (
                            <li key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg flex-shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{file.file_name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{(file.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(file.id, file.storage_path)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
