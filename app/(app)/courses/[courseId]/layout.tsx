import Link from 'next/link'
import { getCourseById } from '@/lib/services/course.detail.service'
import { notFound } from 'next/navigation'
import CourseTabNav from '@/components/course/CourseTabNav'

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

    return (
        <div className="flex flex-col h-full">
            {/* Course Header */}
            <div className="bg-white border border-gray-100 px-6 py-4 mb-6 rounded-2xl flex justify-between items-end" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: course.color_code || '#6366f1' }}
                        />
                        <h1 className="text-xl font-bold text-gray-900">{course.name}</h1>
                    </div>
                    <div className="text-gray-400 text-xs flex gap-3">
                        {course.professor && <span>{course.professor} 교수님</span>}
                        {course.credit && <span>{course.credit}학점</span>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <CourseTabNav courseId={course.id} />

            {/* Content */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 min-h-[400px]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                {children}
            </div>
        </div>
    )
}
