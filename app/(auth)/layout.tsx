import { BookOpen, GraduationCap, Brain, ClipboardList } from 'lucide-react'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex">
            {/* Left Branding Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex-col justify-between p-12 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full"></div>
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-white/5 rounded-full"></div>
                <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2.5 rounded-xl">
                            <GraduationCap size={28} />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Nursing Hub</h1>
                    </div>
                    <p className="text-blue-200 text-sm ml-1">간호대학생 학습 관리 플랫폼</p>
                </div>

                <div className="relative z-10 space-y-8">
                    <h2 className="text-3xl font-bold leading-tight">
                        학습 관리의<br />
                        <span className="text-blue-200">새로운 기준</span>을<br />
                        만나보세요
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-white/10 p-2 rounded-lg mt-0.5">
                                <BookOpen size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">과목별 체계적 관리</h3>
                                <p className="text-blue-200 text-xs mt-0.5">수업 자료, 노트, 과제를 한 곳에서</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-white/10 p-2 rounded-lg mt-0.5">
                                <Brain size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">퀴즈로 실력 점검</h3>
                                <p className="text-blue-200 text-xs mt-0.5">직접 만든 퀴즈로 복습하고 오답까지</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-white/10 p-2 rounded-lg mt-0.5">
                                <ClipboardList size={18} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">과제 마감일 놓치지 않기</h3>
                                <p className="text-blue-200 text-xs mt-0.5">우선순위별 과제 추적과 알림</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-blue-300">
                    &copy; 2024 Nursing Hub. 간호 학습의 동반자.
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
                <div className="w-full max-w-md">
                    {/* Mobile branding (visible only on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="bg-blue-600 text-white p-2 rounded-xl">
                                <GraduationCap size={24} />
                            </div>
                            <h1 className="text-xl font-extrabold text-gray-900">Nursing Hub</h1>
                        </div>
                        <p className="text-gray-500 text-sm">간호대학생 학습 관리 플랫폼</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
