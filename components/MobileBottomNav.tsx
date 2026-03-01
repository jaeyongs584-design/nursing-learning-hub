'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, CheckSquare, RefreshCw, Calendar } from 'lucide-react'

const tabs = [
    { label: '오늘', href: '/dashboard', icon: LayoutDashboard },
    { label: '시간표', href: '/timetable', icon: Calendar },
    { label: '과목', href: '/courses', icon: BookOpen },
    { label: '할 일', href: '/tasks', icon: CheckSquare },
    { label: '복습', href: '/review', icon: RefreshCw },
]

export default function MobileBottomNav() {
    const pathname = usePathname()

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 glass border-t border-gray-200/60 z-50 safe-area-pb">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${isActive
                                ? 'text-indigo-600'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                {tab.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
