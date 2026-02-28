'use client'

import { useState } from 'react'
import { Download, FileText, Copy, Check } from 'lucide-react'
import { generatePptHtml, generatePptMarkdown } from '@/lib/ai/ppt-export'
import type { PptOutlineResult } from '@/lib/ai/types'

export default function PptExportButtons({ outline }: { outline: PptOutlineResult }) {
    const [copied, setCopied] = useState(false)

    const handleDownloadHtml = () => {
        const html = generatePptHtml(outline)
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${outline.presentationTitle || 'presentation'}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleCopyMarkdown = async () => {
        const md = generatePptMarkdown(outline)
        await navigator.clipboard.writeText(md)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex gap-2 mt-4">
            <button
                onClick={handleDownloadHtml}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
            >
                <Download size={14} />
                HTML 다운로드
            </button>
            <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition"
            >
                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? '복사됨!' : 'Markdown 복사'}
            </button>
        </div>
    )
}
