'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, CheckSquare, RefreshCw, Calendar } from 'lucide-react'

const navItems = [
    { label: '오늘', href: '/dashboard', icon: LayoutDashboard },
    { label: '시간표', href: '/timetable', icon: Calendar },
    { label: '내 과목', href: '/courses', icon: BookOpen },
    { label: '할 일 / 과제', href: '/tasks', icon: CheckSquare },
    { label: '복습', href: '/review', icon: RefreshCw },
]

export default function SidebarNav() {
    const pathname = usePathname()

    return (
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? 'nav-active' : ''
                            }`}
                        style={{
                            color: isActive ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                            background: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'var(--bg-sidebar-hover)'
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.background = 'transparent'
                        }}
                    >
                        <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                        <span className={isActive ? 'font-semibold' : 'font-medium'}>{item.label}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
