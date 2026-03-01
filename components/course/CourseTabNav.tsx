'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, BookOpen, FlaskConical, ClipboardList } from 'lucide-react'

const getTabs = (courseId: string) => [
    { label: '대시보드', href: `/courses/${courseId}`, icon: LayoutDashboard, exact: true },
    { label: '자료', href: `/courses/${courseId}/materials`, icon: FileText },
    { label: '노트', href: `/courses/${courseId}/notes`, icon: BookOpen },
    { label: '퀴즈·오답', href: `/courses/${courseId}/quizzes`, icon: FlaskConical },
    { label: '과제·진도', href: `/courses/${courseId}/tasks`, icon: ClipboardList },
]

export default function CourseTabNav({ courseId }: { courseId: string }) {
    const pathname = usePathname()

    const tabs = getTabs(courseId)

    return (
        <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = tab.exact
                    ? pathname === tab.href
                    : pathname.startsWith(tab.href)

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${isActive
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Icon size={15} strokeWidth={isActive ? 2.2 : 1.6} />
                        {tab.label}
                    </Link>
                )
            })}
        </div>
    )
}
