'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, CheckSquare, RefreshCw, Calendar } from 'lucide-react'

const tabs = [
    { label: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { label: '캘린더', href: '/calendar', icon: Calendar },
    { label: '내 과목', href: '/courses', icon: BookOpen },
    { label: '과제', href: '/tasks', icon: CheckSquare },
    { label: '복습', href: '/review', icon: RefreshCw },
]

export default function MobileBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition ${isActive
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                                {tab.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
