import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect('/login?message=' + encodeURIComponent('이메일 또는 비밀번호가 올바르지 않습니다.'))
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const supabase = await createClient()

    const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
            }
        }
    })

    if (error) {
        return redirect('/register?message=' + encodeURIComponent('회원가입에 실패했습니다: ' + error.message))
    }

    // Handle profile creation if needed or let trigger do it.
    revalidatePath('/', 'layout')
    redirect('/login?message=' + encodeURIComponent('회원가입이 완료되었습니다! 이메일 확인 후 로그인해 주세요.'))
}

export async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
}
