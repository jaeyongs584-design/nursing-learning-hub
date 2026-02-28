'use client'

import { useState } from 'react'
import { deleteWrongAnswerAction } from '@/actions/wrong_answer.actions'
import type { WrongAnswerNote } from '@/lib/services/wrong_answer.service'

export default function WrongAnswerItem({ note, courseId }: { note: WrongAnswerNote, courseId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [retryMode, setRetryMode] = useState(false)
    const [showAnswer, setShowAnswer] = useState(false)
    const [userRetryAnswer, setUserRetryAnswer] = useState('')

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('이 오답 기록을 삭제하시겠습니까?')) return;
        setIsDeleting(true)
        await deleteWrongAnswerAction(note.id, courseId)
        setIsDeleting(false)
    }

    const handleStartRetry = (e: React.MouseEvent) => {
        e.stopPropagation()
        setRetryMode(true)
        setShowAnswer(false)
        setUserRetryAnswer('')
        setIsOpen(true)
    }

    const handleCheckAnswer = () => {
        setShowAnswer(true)
    }

    return (
        <div className={`border rounded-xl bg-white ${isDeleting ? 'opacity-50' : 'hover:border-red-300'} transition overflow-hidden group mb-4`}>
            {/* Header */}
            <div
                className="p-5 cursor-pointer flex justify-between items-start gap-4"
                onClick={() => { setIsOpen(!isOpen); if (retryMode && !isOpen) { /* keep retry */ } }}
            >
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded">Q</span>
                        {retryMode && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">다시 풀기 모드</span>}
                        {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1">
                                {note.tags.map((tag, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">#{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <h4 className="font-semibold text-gray-900 leading-relaxed line-clamp-2">{note.question}</h4>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleStartRetry}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition text-xs font-bold px-2"
                        title="다시 풀기"
                    >
                        🔄 다시 풀기
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition opacity-0 group-hover:opacity-100"
                        title="삭제"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                    <div className={`p-1 text-gray-400 transition transform ${isOpen ? 'rotate-180' : ''}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </div>

            {/* Expanded Content */}
            {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t bg-gray-50/50">
                    {retryMode ? (
                        /* 다시 풀기 모드 */
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-gray-700 mb-2 block">✏️ 내 답변을 입력하세요</label>
                                <textarea
                                    value={userRetryAnswer}
                                    onChange={e => setUserRetryAnswer(e.target.value)}
                                    className="w-full h-24 p-3 border rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
                                    placeholder="다시 생각해서 답을 적어보세요..."
                                />
                            </div>

                            {!showAnswer ? (
                                <button
                                    onClick={handleCheckAnswer}
                                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition"
                                >
                                    정답 확인하기
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="bg-white p-3 rounded border border-blue-200 shadow-sm">
                                            <h5 className="text-xs font-bold text-blue-600 mb-1">내가 쓴 답</h5>
                                            <p className="text-sm text-gray-700">{userRetryAnswer || '(미작성)'}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-green-200 shadow-sm">
                                            <h5 className="text-xs font-bold text-green-600 mb-1">정답</h5>
                                            <p className="text-sm text-gray-700">{note.correct_answer}</p>
                                        </div>
                                    </div>
                                    {note.explanation && (
                                        <div className="bg-white p-3 rounded border shadow-sm">
                                            <h5 className="text-xs font-bold text-blue-600 mb-1">📚 해설</h5>
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.explanation}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => { setRetryMode(false); setShowAnswer(false); setUserRetryAnswer(''); }}
                                        className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition"
                                    >
                                        다시 풀기 모드 종료
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* 일반 보기 모드 */
                        <>
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                {note.my_answer && (
                                    <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                                        <h5 className="text-xs font-bold text-red-600 mb-1">내 오답</h5>
                                        <p className="text-sm text-gray-700">{note.my_answer}</p>
                                    </div>
                                )}
                                {note.correct_answer && (
                                    <div className="bg-white p-3 rounded border border-green-100 shadow-sm">
                                        <h5 className="text-xs font-bold text-green-600 mb-1">정답</h5>
                                        <p className="text-sm text-gray-700">{note.correct_answer}</p>
                                    </div>
                                )}
                            </div>

                            {note.reason && (
                                <div className="mb-4">
                                    <h5 className="text-xs font-bold text-orange-600 mb-1">🤔 왜 틀렸을까? (원인 분석)</h5>
                                    <p className="text-sm text-gray-700 bg-white p-3 border rounded shadow-sm">{note.reason}</p>
                                </div>
                            )}

                            {note.explanation && (
                                <div>
                                    <h5 className="text-xs font-bold text-blue-600 mb-1">📚 핵심 개념 / 해설</h5>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.explanation}</p>
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t text-xs text-gray-400 text-right">
                                기록일: {new Date(note.created_at).toLocaleDateString()}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

