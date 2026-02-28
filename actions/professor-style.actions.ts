'use server'

import { upsertProfessorStyle } from '@/lib/services/professor-style.service'
import { revalidatePath } from 'next/cache'

export async function saveProfessorStyleAction(
    courseId: string,
    style: {
        exam_type: string[]
        emphasis_keywords: string[]
        grading_style: string
        notes: string
        tips: string[]
    }
) {
    const result = await upsertProfessorStyle(courseId, style)
    if (result.ok) {
        revalidatePath(`/courses/${courseId}/professor-style`)
    }
    return result
}
