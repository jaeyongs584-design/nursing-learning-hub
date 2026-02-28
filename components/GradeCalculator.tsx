'use client'

import { useState, useMemo } from 'react'
import { Calculator, Target, TrendingUp, Award } from 'lucide-react'

type EvalItem = {
    label: string
    weight: number  // percentage
    score: number | null  // current score (0-100) or null if not yet taken
    maxScore: number
}

const GRADE_TABLE = [
    { grade: 'A+', min: 95, color: 'text-blue-600', bg: 'bg-blue-50' },
    { grade: 'A0', min: 90, color: 'text-blue-500', bg: 'bg-blue-50' },
    { grade: 'B+', min: 85, color: 'text-green-600', bg: 'bg-green-50' },
    { grade: 'B0', min: 80, color: 'text-green-500', bg: 'bg-green-50' },
    { grade: 'C+', min: 75, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { grade: 'C0', min: 70, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { grade: 'D+', min: 65, color: 'text-orange-600', bg: 'bg-orange-50' },
    { grade: 'D0', min: 60, color: 'text-orange-500', bg: 'bg-orange-50' },
    { grade: 'F', min: 0, color: 'text-red-600', bg: 'bg-red-50' },
]

const DEFAULT_ITEMS: EvalItem[] = [
    { label: '출석', weight: 10, score: null, maxScore: 100 },
    { label: '과제', weight: 20, score: null, maxScore: 100 },
    { label: '중간고사', weight: 30, score: null, maxScore: 100 },
    { label: '기말고사', weight: 40, score: null, maxScore: 100 },
]

function getGrade(score: number) {
    return GRADE_TABLE.find(g => score >= g.min) || GRADE_TABLE[GRADE_TABLE.length - 1]
}

export default function GradeCalculator() {
    const [items, setItems] = useState<EvalItem[]>(DEFAULT_ITEMS)
    const [targetGrade, setTargetGrade] = useState('A0')

    const updateItem = (index: number, field: keyof EvalItem, value: number | null) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { label: '항목', weight: 0, score: null, maxScore: 100 }])
    }

    const removeItem = (index: number) => {
        if (items.length <= 1) return
        setItems(items.filter((_, i) => i !== index))
    }

    const totalWeight = useMemo(() => items.reduce((sum, item) => sum + item.weight, 0), [items])

    // Calculate current weighted score (only from items that have scores)
    const analysis = useMemo(() => {
        const scoredItems = items.filter(item => item.score !== null)
        const unscoredItems = items.filter(item => item.score === null)

        const earnedWeight = scoredItems.reduce((sum, item) => sum + item.weight, 0)
        const earnedScore = scoredItems.reduce((sum, item) => sum + (item.score! / item.maxScore * item.weight), 0)

        const remainingWeight = unscoredItems.reduce((sum, item) => sum + item.weight, 0)

        // Current estimated total (assuming remaining gets average of earned)
        const currentAvg = earnedWeight > 0 ? earnedScore / earnedWeight * 100 : 0
        const estimatedTotal = earnedWeight > 0 ? earnedScore + (currentAvg / 100 * remainingWeight) : 0

        // Target calculation
        const targetMin = GRADE_TABLE.find(g => g.grade === targetGrade)?.min || 90
        const neededFromRemaining = remainingWeight > 0 ? ((targetMin - earnedScore) / remainingWeight) * 100 : 0

        return {
            earnedScore,
            earnedWeight,
            remainingWeight,
            estimatedTotal,
            currentGrade: getGrade(estimatedTotal),
            targetMin,
            neededFromRemaining: Math.max(0, Math.min(100, neededFromRemaining)),
            isTargetPossible: neededFromRemaining <= 100,
            unscoredItems,
        }
    }, [items, targetGrade])

    return (
        <div className="space-y-8">
            {/* Eval Items Editor */}
            <section className="bg-white border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Calculator size={20} className="text-blue-600" />
                        <h3 className="font-bold text-lg text-gray-900">평가 항목 설정</h3>
                    </div>
                    <div className={`text-sm font-medium px-3 py-1 rounded-full ${totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        비율 합계: {totalWeight}%
                    </div>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                value={item.label}
                                onChange={e => {
                                    const newItems = [...items]
                                    newItems[index] = { ...newItems[index], label: e.target.value }
                                    setItems(newItems)
                                }}
                                className="w-28 px-3 py-2 border rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={item.weight}
                                    onChange={e => updateItem(index, 'weight', Number(e.target.value))}
                                    className="w-16 px-2 py-2 border rounded-lg text-sm text-center bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500">%</span>
                            </div>
                            <div className="flex items-center gap-1 flex-1">
                                <input
                                    type="number"
                                    min={0}
                                    max={item.maxScore}
                                    value={item.score ?? ''}
                                    placeholder="미응시"
                                    onChange={e => updateItem(index, 'score', e.target.value === '' ? null : Number(e.target.value))}
                                    className="w-20 px-2 py-2 border rounded-lg text-sm text-center bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <span className="text-xs text-gray-500">/ {item.maxScore}점</span>
                            </div>
                            <button
                                onClick={() => removeItem(index)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                                title="삭제"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addItem}
                    className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition font-medium"
                >
                    + 평가 항목 추가
                </button>
            </section>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Status */}
                <section className="bg-white border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={20} className="text-green-600" />
                        <h3 className="font-bold text-gray-900">현재 예상 성적</h3>
                    </div>

                    <div className="text-center py-6">
                        <div className={`text-6xl font-black ${analysis.currentGrade.color}`}>
                            {analysis.currentGrade.grade}
                        </div>
                        <div className="text-2xl font-bold text-gray-700 mt-2">
                            {analysis.estimatedTotal.toFixed(1)}점
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                            현재까지 확정: {analysis.earnedScore.toFixed(1)}점 / {analysis.earnedWeight}%
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                                style={{ width: `${Math.min(100, analysis.estimatedTotal)}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                            <span>F (0)</span>
                            <span>C (70)</span>
                            <span>B (80)</span>
                            <span>A (90)</span>
                            <span>A+ (95)</span>
                        </div>
                    </div>
                </section>

                {/* Target Calculator */}
                <section className="bg-white border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Target size={20} className="text-orange-600" />
                        <h3 className="font-bold text-gray-900">목표 학점 달성 전략</h3>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm font-medium text-gray-600 mb-2 block">목표 학점 선택</label>
                        <div className="flex flex-wrap gap-2">
                            {GRADE_TABLE.slice(0, 4).map(g => (
                                <button
                                    key={g.grade}
                                    onClick={() => setTargetGrade(g.grade)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition ${targetGrade === g.grade ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    {g.grade}
                                </button>
                            ))}
                        </div>
                    </div>

                    {analysis.remainingWeight > 0 ? (
                        <div className={`p-4 rounded-xl ${analysis.isTargetPossible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            {analysis.isTargetPossible ? (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award size={18} className="text-green-600" />
                                        <span className="font-bold text-green-800">달성 가능!</span>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        남은 평가({analysis.unscoredItems.map(i => i.label).join(', ')})에서
                                        <span className="font-black text-lg mx-1">{analysis.neededFromRemaining.toFixed(0)}점</span>
                                        이상이 필요합니다.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-red-600 font-bold">⚠️ 달성 어려움</span>
                                    </div>
                                    <p className="text-sm text-red-700">
                                        남은 평가에서 만점(100점)을 받아도 {targetGrade} 달성이 어렵습니다.
                                        목표를 조정해 보세요.
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-xl border text-center">
                            <p className="text-sm text-gray-600">
                                모든 평가가 완료되었습니다. 최종 성적은 <span className="font-bold">{analysis.estimatedTotal.toFixed(1)}점</span>입니다.
                            </p>
                        </div>
                    )}

                    {/* Per-item breakdown for remaining */}
                    {analysis.unscoredItems.length > 0 && analysis.isTargetPossible && (
                        <div className="mt-4 space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">항목별 필요 점수 (균등 배분 시)</h4>
                            {analysis.unscoredItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                                    <span className="font-medium text-gray-700">{item.label} ({item.weight}%)</span>
                                    <span className="font-bold text-blue-600">{analysis.neededFromRemaining.toFixed(0)}점 이상</span>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
