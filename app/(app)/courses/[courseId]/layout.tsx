import Link from 'next/link'
import { getCourseById } from '@/lib/services/course.detail.service'
import { notFound } from 'next/navigation'
import {
    BookOpen,
    CheckSquare,
    FileText,
    AlertTriangle,
    Lightbulb,
    Sparkles,
    BarChart3,
    Target,
    GraduationCap,
} from 'lucide-react'

export default async function CourseLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ courseId: string }>
}) {
    const { courseId } = await params
    const course = await getCourseById(courseId)

    if (!course) {
        notFound()
    }

    const navItems = [
        { label: '대시보드', href: `/courses/${course.id}`, icon: BookOpen },
        { label: '수업 자료', href: `/courses/${course.id}/materials`, icon: FileText },
        { label: '노트 & 요약', href: `/courses/${course.id}/notes`, icon: FileText },
        { label: '과제 관리', href: `/courses/${course.id}/tasks`, icon: CheckSquare },
        { label: '오답 노트', href: `/courses/${course.id}/wrong-answers`, icon: AlertTriangle },
        { label: '퀴즈', href: `/courses/${course.id}/quizzes`, icon: Lightbulb },
        { label: 'AI 요약', href: `/courses/${course.id}/ai-summary`, icon: Sparkles },
        { label: '약점 분석', href: `/courses/${course.id}/analytics`, icon: BarChart3 },
        { label: '성적 계산', href: `/courses/${course.id}/grade-calc`, icon: Target },
        { label: '교수 스타일', href: `/courses/${course.id}/professor-style`, icon: GraduationCap },
    ]

    return (
        <div className="flex flex-col h-full">
            {/* Course Header */}
            <div className="bg-white border-b px-6 py-4 mb-6 shadow-sm rounded-lg flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                    <div className="text-gray-500 text-sm mt-1 flex gap-3">
                        {course.professor && <span>교수: {course.professor}</span>}
                        {course.credit && <span>학점: {course.credit}학점</span>}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 flex-1">
                {/* Course Sub-navigation */}
                <nav className="w-full md:w-56 flex-shrink-0 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-white hover:text-blue-600 transition"
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* Course Content Area */}
                <div className="flex-1 bg-white rounded-lg border p-6 min-h-[500px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
