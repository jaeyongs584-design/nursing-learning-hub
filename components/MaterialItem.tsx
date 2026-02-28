'use client'

import { deleteMaterialAction, getMaterialSignedUrlAction } from '@/actions/material.actions'
import type { StudyMaterial } from '@/lib/services/material.service'
import { useState, useTransition } from 'react'

export default function MaterialItem({ material }: { material: StudyMaterial }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isLoadingUrl, setIsLoadingUrl] = useState(false)

    const handleDelete = async () => {
        if (!confirm('이 자료를 삭제하시겠습니까? 연결된 파일도 함께 삭제됩니다.')) return;
        setIsDeleting(true)
        await deleteMaterialAction(material.id, material.storage_path, material.course_id)
        setIsDeleting(false)
    }

    const handleDownload = async () => {
        if (material.source_type === 'LINK' && material.external_url) {
            window.open(material.external_url, '_blank')
            return
        }

        if (material.source_type === 'FILE' && material.storage_path) {
            setIsLoadingUrl(true)
            const signedUrl = await getMaterialSignedUrlAction(material.storage_path)
            setIsLoadingUrl(false)

            if (signedUrl) {
                // Trigger download
                const link = document.createElement('a')
                link.href = signedUrl
                link.setAttribute('download', material.original_filename || 'download')
                link.setAttribute('target', '_blank')
                document.body.appendChild(link)
                link.click()
                link.parentNode?.removeChild(link)
            } else {
                alert('파일 URL을 가져오는데 실패했습니다.')
            }
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
        <div className={`p-4 border rounded-xl bg-white ${isDeleting ? 'opacity-50' : 'hover:border-blue-300'} transition flex items-center justify-between group`}>

            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${material.source_type === 'FILE' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                    {material.source_type === 'FILE' ? '📄' : '🔗'}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{material.title}</h4>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                        {material.source_type === 'FILE' ? (
                            <>
                                <span className="truncate max-w-[200px]">{material.original_filename}</span>
                                {material.file_size_bytes && <span>• {formatBytes(material.file_size_bytes)}</span>}
                            </>
                        ) : (
                            <span className="truncate max-w-[300px] text-blue-500">{material.external_url}</span>
                        )}
                        <span>• {new Date(material.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 ml-4">
                <button
                    onClick={handleDownload}
                    disabled={isLoadingUrl}
                    className="px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border rounded text-sm font-medium transition disabled:opacity-50"
                >
                    {isLoadingUrl ? '준비중...' : (material.source_type === 'FILE' ? '다운로드' : '링크 열기')}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                    title="삭제"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
            </div>

        </div>
    )
}
