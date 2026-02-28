'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
    analyzeRequirements,
    generateReportOutline,
    generateReportDraft,
    generatePptOutline,
} from '@/lib/ai'

// ─── 과제 상세 조회 (task + assignment 통합) ───
export async function getAssignmentDetail(taskId: string) {
    const supabase = await createClient()

    // 기존 task 조회
    const { data: task } = await supabase
        .from('tasks')
        .select('*, course:courses(name)')
        .eq('id', taskId)
        .single()

    if (!task) return null

    // assignment 확장 데이터 조회
    const { data: assignment } = await supabase
        .from('assignments')
        .select('*')
        .eq('task_id', taskId)
        .single()

    return { task, assignment }
}

// ─── assignment 없으면 자동 생성 ───
export async function ensureAssignment(taskId: string, courseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: existing } = await supabase
        .from('assignments')
        .select('*')
        .eq('task_id', taskId)
        .single()

    if (existing) return existing

    const { data: task } = await supabase
        .from('tasks')
        .select('title, description, due_date')
        .eq('id', taskId)
        .single()

    const { data: created } = await supabase
        .from('assignments')
        .insert({
            task_id: taskId,
            course_id: courseId,
            user_id: user.id,
            title: task?.title || '',
            description: task?.description || '',
            due_date: task?.due_date || null,
        })
        .select()
        .single()

    return created
}

// ─── 요구사항 분석 ───
export async function analyzeRequirementsAction(assignmentId: string, sourceText: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증이 필요합니다.' }

    const result = await analyzeRequirements(sourceText)
    if (!result.ok) return { ok: false, error: result.error }

    const { data, error } = await supabase
        .from('assignment_requirements')
        .insert({
            assignment_id: assignmentId,
            user_id: user.id,
            source_text: sourceText,
            analysis_json: result.data,
            ai_provider: result.provider,
        })
        .select()
        .single()

    if (error) return { ok: false, error: error.message }
    return { ok: true, data }
}

export async function getLatestRequirements(assignmentId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('assignment_requirements')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    return data
}

// ─── 보고서 목차/초안 생성 ───
export async function generateOutlineAction(assignmentId: string, topic: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증이 필요합니다.' }

    const result = await generateReportOutline(topic)
    if (!result.ok) return { ok: false, error: result.error }

    // 최신 버전 번호 조회
    const { data: latest } = await supabase
        .from('assignment_drafts')
        .select('version_no')
        .eq('assignment_id', assignmentId)
        .eq('draft_type', 'report_outline')
        .order('version_no', { ascending: false })
        .limit(1)
        .single()

    const nextVersion = (latest?.version_no || 0) + 1

    const { data, error } = await supabase
        .from('assignment_drafts')
        .insert({
            assignment_id: assignmentId,
            user_id: user.id,
            draft_type: 'report_outline',
            version_no: nextVersion,
            title: result.data?.title || topic,
            content_json: result.data,
        })
        .select()
        .single()

    if (error) return { ok: false, error: error.message }
    return { ok: true, data }
}

export async function generateDraftAction(assignmentId: string, topic: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증이 필요합니다.' }

    // 기존 outline 가져오기 (있으면)
    const { data: outlineDraft } = await supabase
        .from('assignment_drafts')
        .select('content_json')
        .eq('assignment_id', assignmentId)
        .eq('draft_type', 'report_outline')
        .order('version_no', { ascending: false })
        .limit(1)
        .single()

    const result = await generateReportDraft(topic, outlineDraft?.content_json || null)
    if (!result.ok) return { ok: false, error: result.error }

    const { data: latest } = await supabase
        .from('assignment_drafts')
        .select('version_no')
        .eq('assignment_id', assignmentId)
        .eq('draft_type', 'report_draft')
        .order('version_no', { ascending: false })
        .limit(1)
        .single()

    const nextVersion = (latest?.version_no || 0) + 1
    const fullText = result.data?.sections.map(s => `${s.heading}\n\n${s.content}`).join('\n\n---\n\n') || ''

    const { data, error } = await supabase
        .from('assignment_drafts')
        .insert({
            assignment_id: assignmentId,
            user_id: user.id,
            draft_type: 'report_draft',
            version_no: nextVersion,
            title: result.data?.title || topic,
            content_text: fullText,
            content_json: result.data,
        })
        .select()
        .single()

    if (error) return { ok: false, error: error.message }
    return { ok: true, data }
}

// ─── PPT 아웃라인 생성 ───
export async function generatePptAction(assignmentId: string, topic: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: '인증이 필요합니다.' }

    const result = await generatePptOutline(topic)
    if (!result.ok) return { ok: false, error: result.error }

    const { data: latest } = await supabase
        .from('assignment_drafts')
        .select('version_no')
        .eq('assignment_id', assignmentId)
        .eq('draft_type', 'ppt_outline')
        .order('version_no', { ascending: false })
        .limit(1)
        .single()

    const nextVersion = (latest?.version_no || 0) + 1

    const { data, error } = await supabase
        .from('assignment_drafts')
        .insert({
            assignment_id: assignmentId,
            user_id: user.id,
            draft_type: 'ppt_outline',
            version_no: nextVersion,
            title: result.data?.presentationTitle || topic,
            content_json: result.data,
        })
        .select()
        .single()

    if (error) return { ok: false, error: error.message }
    return { ok: true, data }
}

// ─── draft 조회 ───
export async function getLatestDraft(assignmentId: string, draftType: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('assignment_drafts')
        .select('*')
        .eq('assignment_id', assignmentId)
        .eq('draft_type', draftType)
        .order('version_no', { ascending: false })
        .limit(1)
        .single()
    return data
}

// ─── draft 수정 (사용자 편집) ───
export async function updateDraftContent(draftId: string, contentText: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('assignment_drafts')
        .update({ content_text: contentText, updated_at: new Date().toISOString() })
        .eq('id', draftId)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
}

// ─── 과제 파일(자료함) ───
export async function getAssignmentFiles(assignmentId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('assignment_files')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false })
    return data || []
}

export async function uploadAssignmentFileAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Authentication required' }

    const assignment_id = formData.get('assignment_id') as string
    const course_id = formData.get('course_id') as string
    const file = formData.get('file') as File

    if (!assignment_id || !file || file.size === 0) {
        return { error: 'Assignment ID and File are required' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${user.id}/assignments/${assignment_id}/${fileName}`

    // Upload to study_materials bucket
    const { data: storageData, error: storageError } = await supabase
        .storage
        .from('study_materials')
        .upload(filePath, file)

    if (storageError) {
        console.error('Storage upload error:', storageError)
        return { error: 'Failed to upload file to storage' }
    }

    // Insert DB Record
    const { error: dbError } = await supabase
        .from('assignment_files')
        .insert({
            assignment_id,
            user_id: user.id,
            file_name: file.name,
            storage_path: storageData.path,
            file_type: file.type,
            file_size: file.size
        })

    if (dbError) {
        console.error('Assignment file insert error:', dbError)
        return { error: 'Failed to save file record' }
    }

    revalidatePath(`/courses/${course_id}/tasks/${assignment_id}`)
    return { success: true }
}

export async function deleteAssignmentFileAction(id: string, storagePath: string, courseId: string, assignmentId: string) {
    const supabase = await createClient()

    // Delete DB Record
    const { error: dbError } = await supabase
        .from('assignment_files')
        .delete()
        .eq('id', id)

    if (dbError) return { error: 'Failed to delete record' }

    // Delete from storage
    if (storagePath) {
        await supabase.storage.from('study_materials').remove([storagePath])
    }

    revalidatePath(`/courses/${courseId}/tasks/${assignmentId}`)
    return { success: true }
}
