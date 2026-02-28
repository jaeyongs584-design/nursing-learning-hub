'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMaterialAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Authentication required' }
    }

    const title = formData.get('title') as string
    const course_id = formData.get('course_id') as string
    const source_type = formData.get('source_type') as 'FILE' | 'LINK' // FILE or LINK

    if (!title || !course_id) {
        return { error: 'Title and Course ID are required' }
    }

    let insertData: any = {
        user_id: user.id,
        course_id,
        title,
        source_type
    }

    if (source_type === 'LINK') {
        const external_url = formData.get('external_url') as string
        if (!external_url) return { error: 'External URL is required' }
        insertData.external_url = external_url
    } else {
        // FILE UI
        const file = formData.get('file') as File
        if (!file || file.size === 0) return { error: 'File is required' }

        // Sanitize filename or generate unique name
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${user.id}/${course_id}/${fileName}`

        // Upload to storage
        const { data: storageData, error: storageError } = await supabase
            .storage
            .from('study_materials')
            .upload(filePath, file)

        if (storageError) {
            console.error('Storage upload error:', storageError)
            return { error: 'Failed to upload file to storage' }
        }

        insertData.storage_path = storageData.path
        insertData.original_filename = file.name
        insertData.mime_type = file.type
        insertData.file_size_bytes = file.size
    }

    // Insert DB Record
    const { error: dbError } = await supabase
        .from('study_materials')
        .insert(insertData)

    if (dbError) {
        console.error('Material insert error:', dbError)
        return { error: 'Failed to save material record' }
    }

    revalidatePath(`/courses/${course_id}/materials`)

    return { success: true }
}

export async function deleteMaterialAction(id: string, storagePath: string | null, courseId: string) {
    const supabase = await createClient()

    // Delete DB Record
    const { error: dbError } = await supabase
        .from('study_materials')
        .delete()
        .eq('id', id)

    if (dbError) {
        return { error: 'Failed to delete record' }
    }

    // If there is an associated file, delete from storage
    if (storagePath) {
        const { error: storageError } = await supabase
            .storage
            .from('study_materials')
            .remove([storagePath])

        if (storageError) {
            console.error('Failed to delete file from storage, but text record deleted', storageError)
            // Handle graceful failure for storage 
        }
    }

    revalidatePath(`/courses/${courseId}/materials`)
    return { success: true }
}

export async function getMaterialSignedUrlAction(path: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .storage
        .from('study_materials')
        .createSignedUrl(path, 60 * 60) // 1 hour

    if (error) {
        console.error('Error generating signed url:', error)
        return null
    }
    return data?.signedUrl
}
