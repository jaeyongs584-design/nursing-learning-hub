'use client'

import { useState } from 'react'
import { FileText, ClipboardList, FolderOpen, BookOpen, Presentation, CheckSquare } from 'lucide-react'

const TABS = [
    { id: 'overview', label: '개요', icon: FileText },
    { id: 'requirements', label: '요구사항', icon: ClipboardList },
    { id: 'files', label: '자료함', icon: FolderOpen },
    { id: 'report', label: '보고서 작성', icon: BookOpen },
    { id: 'ppt', label: 'PPT 생성', icon: Presentation },
    { id: 'checklist', label: '제출 전 점검', icon: CheckSquare },
] as const

export type TabId = typeof TABS[number]['id']

export default function AssignmentTabs({
    activeTab,
    onTabChange,
}: {
    activeTab: TabId
    onTabChange: (tab: TabId) => void
}) {
    return (
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-1 overflow-x-auto pb-px">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition ${isActive
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}
