'use client'

import { useState } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'

const DEFAULT_ITEMS = [
    { id: 'format', label: '제출 형식 (파일 형태/페이지 수) 확인', category: '형식' },
    { id: 'cover', label: '표지 작성 완료 (과목명/학번/이름/제출일)', category: '형식' },
    { id: 'toc', label: '목차 포함 여부 확인', category: '형식' },
    { id: 'intro', label: '서론 — 주제 배경 및 목적 기술', category: '내용' },
    { id: 'body', label: '본론 — 핵심 개념 분석 및 논리적 전개', category: '내용' },
    { id: 'nursing', label: '간호 실무 적용/중재 방안 포함', category: '내용' },
    { id: 'conclusion', label: '결론 — 요약 및 개인 견해', category: '내용' },
    { id: 'ref', label: '참고문헌 작성 (APA 등 형식 확인)', category: '참고문헌' },
    { id: 'cite', label: '본문 내 인용 표기 확인', category: '참고문헌' },
    { id: 'plagiarism', label: '표절률 자체 점검 (30% 이하 권장)', category: '품질' },
    { id: 'proofread', label: '맞춤법 및 문장 교정', category: '품질' },
    { id: 'deadline', label: '제출 기한 확인', category: '제출' },
    { id: 'filename', label: '파일명 규칙 확인 (학번_이름_과제명 등)', category: '제출' },
]

export default function SubmissionChecklist() {
    const [checked, setChecked] = useState<Set<string>>(new Set())

    const toggle = (id: string) => {
        setChecked(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const progress = Math.round((checked.size / DEFAULT_ITEMS.length) * 100)
    const categories = [...new Set(DEFAULT_ITEMS.map(item => item.category))]

    return (
        <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        ✅ 제출 전 점검 체크리스트
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-600">
                            {checked.size} / {DEFAULT_ITEMS.length}
                        </div>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {categories.map(category => (
                        <div key={category}>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                {category}
                            </h4>
                            <div className="space-y-1">
                                {DEFAULT_ITEMS.filter(item => item.category === category).map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggle(item.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${checked.has(item.id)
                                                ? 'bg-green-50 text-green-800'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {checked.has(item.id) ? (
                                            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                                        ) : (
                                            <Circle size={18} className="text-gray-300 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm ${checked.has(item.id) ? 'line-through' : ''}`}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {progress === 100 && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                        <p className="font-bold text-green-800">🎉 모든 항목을 점검했습니다!</p>
                        <p className="text-sm text-green-600 mt-1">자신감을 가지고 제출하세요!</p>
                    </div>
                )}

                <p className="text-xs text-gray-400 mt-4 text-center">
                    💡 후속 업데이트: 루브릭 기반 자동 점검 기능이 추가될 예정입니다. (TODO)
                </p>
            </div>
        </div>
    )
}
