'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateAISummary } from '@/lib/ai'

export async function createAISummaryAction(
    courseId: string,
    inputText: string,
    summaryType: string = '3line'
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증이 필요합니다.' }

    const result = await generateAISummary(inputText)
    if (!result.ok) return { ok: false, error: result.error }

    const { data, error } = await supabase
        .from('ai_summaries')
        .insert({
            course_id: courseId,
            user_id: user.id,
            source_type: 'text',
            summary_type: summaryType,
            input_text: inputText,
            result_json: result.data,
            ai_provider: result.provider,
        })
        .select()
        .single()

    if (error) return { ok: false, error: error.message }

    revalidatePath(`/courses/${courseId}/ai-summary`)
    return { ok: true, data }
}

export async function getAISummaries(courseId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('ai_summaries')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
    return data || []
}

export async function deleteAISummaryAction(id: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'Authentication required' }

    const { error } = await supabase
        .from('ai_summaries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Delete summary error:', error)
        return { ok: false, error: '삭제에 실패했습니다.' }
    }

    revalidatePath(`/courses/${courseId}/ai-summary`)
    return { ok: true }
}
