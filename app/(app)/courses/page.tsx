import { getActiveSemester, getSemesters } from '@/lib/services/semester.service'
import { getCourses } from '@/lib/services/course.service'
import { createSemester, createCourse } from '@/actions/course.actions'
import Link from 'next/link'

export default async function CoursesPage() {
    const semesters = await getSemesters()
    const activeSemester = await getActiveSemester()

    // If no semesters exist, show empty state
    if (semesters.length === 0) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border rounded-lg shadow-sm text-center">
                <h2 className="text-2xl font-bold mb-2">시작하기</h2>
                <p className="text-gray-600 mb-8">과목을 등록하려면 먼저 학기를 설정해야 합니다.</p>

                <form action={createSemester} className="flex flex-col gap-4 text-left max-w-sm mx-auto">
                    <div>
                        <label className="block text-sm font-medium mb-1">학기 이름</label>
                        <input name="name" required placeholder="예: 2024년 2학기" className="w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">시작일 (선택)</label>
                        <input type="date" name="start_date" className="w-full border rounded p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">종료일 (선택)</label>
                        <input type="date" name="end_date" className="w-full border rounded p-2" />
                    </div>
                    <button type="submit" className="mt-4 bg-blue-600 text-white rounded py-2 hover:bg-blue-700">
                        학기 생성하기
                    </button>
                </form>
            </div>
        )
    }

    // Active semester courses
    const courses = await getCourses(activeSemester?.id)

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">내 과목</h1>
                    <p className="text-gray-500 mt-1">현재 학기: {activeSemester?.name || '설정 안됨'}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Real Courses List */}
                {courses.map(course => (
                    <Link href={`/courses/${course.id}`} key={course.id} className="block group">
                        <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition h-full flex flex-col">
                            <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">{course.name}</h3>
                            <div className="text-sm text-gray-500 mb-4 flex-1">
                                {course.professor && <span>교수: {course.professor}</span>}
                                {course.credit && <span className="ml-3">학점: {course.credit}학점</span>}
                            </div>
                            <div className="text-sm text-blue-600 font-medium">과목 대시보드 보기 &rarr;</div>
                        </div>
                    </Link>
                ))}

                {/* Add Course Card */}
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 flex flex-col justify-center items-center text-center min-h-[160px]">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">새 과목 추가</h3>
                    <form action={createCourse} className="w-full flex justify-center">
                        {activeSemester && <input type="hidden" name="semester_id" value={activeSemester.id} />}
                        <div className="flex items-center gap-2 w-full">
                            <input name="name" required placeholder="과목명 입력 (예: 성인간호학)" className="border rounded p-2 text-sm flex-1" />
                            <button type="submit" className="bg-blue-600 text-white p-2 rounded text-sm whitespace-nowrap">
                                추가
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
