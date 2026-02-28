'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ScheduleForm } from './ScheduleForm'

type Course = { id: string; name: string; color_code: string | null }

export default function TimetableClient({ courses }: { courses: Course[] }) {
    const [showForm, setShowForm] = useState(false)

    return (
        <>
            <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"
            >
                <Plus size={16} />
                수업 추가
            </button>
            {showForm && <ScheduleForm courses={courses} onClose={() => setShowForm(false)} />}
        </>
    )
}
