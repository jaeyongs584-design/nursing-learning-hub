import Link from 'next/link'
import { signOut } from '@/actions/auth.actions'
import MobileBottomNav from '@/components/MobileBottomNav'
import SidebarNav from '@/components/SidebarNav'
import {
    LogOut,
    User,
} from 'lucide-react'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen" style={{ background: 'var(--bg-primary)' }}>
            {/* Sidebar — Dark Notion-style */}
            <aside className="w-60 hidden md:flex flex-col" style={{ background: 'var(--bg-sidebar)' }}>
                <div className="h-16 flex items-center px-5">
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        <span className="text-indigo-400">N</span>ursing Hub
                    </h1>
                </div>

                <SidebarNav />

                <div className="p-3 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <form action={signOut}>
                        <button className="sidebar-logout-btn flex w-full items-center gap-3 px-3 py-2 rounded-lg transition text-sm"
                            style={{ color: 'var(--text-sidebar)' }}
                        >
                            <LogOut size={18} />
                            <span>로그아웃</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="h-14 border-b flex items-center justify-between px-4 md:hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <h1 className="text-lg font-bold text-indigo-600 tracking-tight">Nursing Hub</h1>
                    <form action={signOut}>
                        <button className="p-2 text-gray-400 rounded-lg hover:bg-gray-100 transition">
                            <LogOut size={18} />
                        </button>
                    </form>
                </header>

                {/* Desktop top bar — minimal */}
                <header className="h-12 border-b hidden md:flex items-center justify-end px-6" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <User size={14} />
                        <span>마이 페이지</span>
                    </div>
                </header>

                {/* Scrollable Main Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    )
}
