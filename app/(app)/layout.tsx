import Link from 'next/link'
import { signOut } from '@/actions/auth.actions'
import MobileBottomNav from '@/components/MobileBottomNav'
import {
    BookOpen,
    CheckSquare,
    LayoutDashboard,
    LogOut,
    User,
    RefreshCw,
    Calendar,
} from 'lucide-react'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-blue-600">Nursing Hub</h1>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition">
                        <LayoutDashboard size={20} />
                        <span className="font-medium">대시보드</span>
                    </Link>
                    <Link href="/calendar" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition">
                        <Calendar size={20} />
                        <span className="font-medium">캘린더</span>
                    </Link>
                    <Link href="/courses" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition">
                        <BookOpen size={20} />
                        <span className="font-medium">내 과목</span>
                    </Link>
                    <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition">
                        <CheckSquare size={20} />
                        <span className="font-medium">과제 관리</span>
                    </Link>
                    <Link href="/review" className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition">
                        <RefreshCw size={20} />
                        <span className="font-medium">복습 스케줄</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <form action={signOut}>
                        <button className="flex w-full items-center gap-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition">
                            <LogOut size={20} />
                            <span className="font-medium">로그아웃</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header (visible only on small screens) */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden">
                    <h1 className="text-xl font-bold text-blue-600">Nursing Hub</h1>
                    <form action={signOut}>
                        <button className="p-2 text-gray-500 rounded-md hover:bg-gray-100">
                            <LogOut size={20} />
                        </button>
                    </form>
                </header>

                {/* Desktop Header */}
                <header className="h-16 bg-white border-b border-gray-200 hidden md:flex items-center justify-end px-8">
                    <div className="flex items-center gap-2 text-gray-600">
                        <User size={20} />
                        <span className="text-sm font-medium">사용자 페이지</span>
                    </div>
                </header>

                {/* Scrollable Main Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    )
}
