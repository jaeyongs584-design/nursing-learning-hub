'use client'

import { useState, useEffect } from 'react'
import { saveProfessorStyleAction } from '@/actions/professor-style.actions'
import { generateStyleRecommendations } from '@/lib/ai/professor-recommendations'
import type { ProfessorStyleInput } from '@/lib/ai/professor-recommendations'

const examTypes = ['객관식', '서술형', '사례분석', 'OX문제', '실기시험', '구술시험', '포트폴리오']
const gradingOptions = [
    { value: 'strict', label: '엄격 (형식 중시)', emoji: '🎯' },
    { value: 'moderate', label: '보통', emoji: '⚖️' },
    { value: 'lenient', label: '관대 (내용 중시)', emoji: '💡' },
]

export default function ProfessorStyleEditor({ courseId, initialStyle }: {
    courseId: string,
    initialStyle: ProfessorStyleInput | null
}) {
    const [examType, setExamType] = useState<string[]>(initialStyle?.exam_type || [])
    const [keywords, setKeywords] = useState(initialStyle?.emphasis_keywords?.join(', ') || '')
    const [gradingStyle, setGradingStyle] = useState(initialStyle?.grading_style || 'moderate')
    const [notes, setNotes] = useState(initialStyle?.notes || '')
    const [tips, setTips] = useState(initialStyle?.tips?.join('\n') || '')
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [recommendations, setRecommendations] = useState<string[]>([])

    useEffect(() => {
        const style: ProfessorStyleInput = {
            exam_type: examType,
            emphasis_keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
            grading_style: gradingStyle,
            notes,
            tips: tips.split('\n').filter(Boolean),
        }
        setRecommendations(generateStyleRecommendations(style))
    }, [examType, keywords, gradingStyle, tips])

    const handleSave = async () => {
        setIsSaving(true)
        setSaved(false)
        const res = await saveProfessorStyleAction(courseId, {
            exam_type: examType,
            emphasis_keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
            grading_style: gradingStyle,
            notes,
            tips: tips.split('\n').filter(Boolean),
        })
        setIsSaving(false)
        if (res.ok) setSaved(true)
        else alert(res.error || '저장 실패')
    }

    const toggleExamType = (type: string) => {
        setExamType(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
    }

    return (
        <div className="space-y-6">
            {/* 출제 유형 */}
            <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">📝 출제 유형 (복수 선택)</label>
                <div className="flex flex-wrap gap-2">
                    {examTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => toggleExamType(type)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${examType.includes(type)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* 강조 키워드 */}
            <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">⚡ 교수님 강조 키워드 (쉼표 구분)</label>
                <input
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    className="w-full p-3 border rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="중요, 꼭 나옵니다, 핵심, 반드시 암기..."
                />
            </div>

            {/* 채점 스타일 */}
            <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">⚖️ 채점 스타일</label>
                <div className="grid grid-cols-3 gap-2">
                    {gradingOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setGradingStyle(opt.value)}
                            className={`p-3 rounded-xl text-sm font-medium transition text-center ${gradingStyle === opt.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <div className="text-lg mb-1">{opt.emoji}</div>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 메모 */}
            <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">📋 메모</label>
                <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full h-20 p-3 border rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                    placeholder="교수님 수업 스타일, 시험 관련 특이사항 등..."
                />
            </div>

            {/* 유용한 팁 */}
            <div>
                <label className="text-sm font-bold text-gray-800 mb-2 block">💡 유용한 팁 (줄바꿈으로 구분)</label>
                <textarea
                    value={tips}
                    onChange={e => setTips(e.target.value)}
                    className="w-full h-20 p-3 border rounded-xl text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                    placeholder="출석 점수 반영률 높음&#10;기말 범위는 중간 이후만&#10;레포트 분량 8페이지 이상..."
                />
            </div>

            {/* 저장 */}
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition disabled:opacity-50"
            >
                {isSaving ? '저장 중...' : saved ? '✅ 저장 완료!' : '교수 스타일 저장하기'}
            </button>

            {/* AI 추천 */}
            {recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl p-5">
                    <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                        ✨ AI 학습 추천
                    </h4>
                    <ul className="space-y-2">
                        {recommendations.map((rec, i) => (
                            <li key={i} className="text-sm text-indigo-800 leading-relaxed">{rec}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
