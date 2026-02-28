'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm hover:shadow-md disabled:opacity-75 disabled:cursor-wait flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    가입 처리 중...
                </>
            ) : '가입하기'}
        </button>
    )
}
