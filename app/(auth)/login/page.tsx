import { login } from '@/actions/auth.actions'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>
}) {
    const params = await searchParams

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
                <p className="text-gray-500 text-sm mt-1">학습 관리를 시작하세요</p>
            </div>

            {params?.message && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-center">
                    {params.message === 'Could not authenticate user'
                        ? '이메일 또는 비밀번호가 일치하지 않습니다.'
                        : params.message}
                </div>
            )}

            <form action={login} className="space-y-5">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block" htmlFor="email">
                        이메일
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400" />
                        </div>
                        <input
                            id="email"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block" htmlFor="password">
                        비밀번호
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400" />
                        </div>
                        <input
                            id="password"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <button className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm hover:shadow-md">
                    로그인
                </button>
            </form>

            <div className="text-center text-sm mt-6 text-gray-500">
                계정이 없으신가요?{' '}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                    회원가입
                </Link>
            </div>
        </div>
    )
}
