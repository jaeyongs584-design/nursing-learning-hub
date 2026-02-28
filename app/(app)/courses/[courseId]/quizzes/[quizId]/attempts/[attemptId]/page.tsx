import { getQuizAttemptDetail } from '@/lib/services/quiz_attempt.service'
import { getQuizWithQuestions } from '@/lib/services/quiz.service'
import CopyToWrongAnswerButton from '@/components/CopyToWrongAnswerButton'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function QuizAttemptResultPage({
    params
}: {
    params: Promise<{ courseId: string, quizId: string, attemptId: string }>
}) {
    const { courseId, quizId, attemptId } = await params

    const attempt = await getQuizAttemptDetail(attemptId)
    const quizData = await getQuizWithQuestions(quizId)

    if (!attempt || !quizData) {
        notFound()
    }

    const { quiz } = quizData
    const score = attempt.score ?? 0

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className={`p-8 rounded-2xl border text-center relative overflow-hidden ${score >= 80 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className="absolute top-4 left-6">
                    <Link href={`/courses/${courseId}/quizzes/${quizId}`} className="text-sm font-medium hover:underline text-gray-600">
                        &larr; 퀴즈 홈으로 돌아가기
                    </Link>
                </div>

                <h2 className="text-xl font-bold text-gray-500 mt-6">{quiz.title}</h2>
                <h1 className="text-4xl font-extrabold mt-2 text-gray-900 mb-6">풀이 결과</h1>

                <div className="flex flex-col items-center justify-center">
                    <div className="text-sm text-gray-500 mb-2">총점</div>
                    <div className={`text-6xl font-black ${score >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
                        {score}<span className="text-2xl text-gray-400">/100</span>
                    </div>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    풀이 일시: {new Date(attempt.started_at).toLocaleString()}
                </div>
            </div>

            {/* Answers Review Section */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold border-b pb-3 flex items-center gap-2">
                    <span>📝</span> 문항별 상세 리뷰
                </h3>

                {attempt.answers.map((ans, idx) => {
                    const isCorrect = ans.is_correct
                    const q = ans.question

                    return (
                        <div key={ans.id} className={`bg-white border-2 rounded-xl p-6 shadow-sm relative overflow-hidden ${isCorrect ? 'border-green-300' : 'border-red-300'}`}>
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}></div>

                            <div className="flex justify-between mb-4">
                                <span className={`text-sm font-bold tracking-widest px-2 py-0.5 rounded ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {idx + 1}번 | {isCorrect ? '정답' : '오답'}
                                </span>
                                <span className="text-xs text-gray-400">{q.question_type === 'MULTIPLE_CHOICE' ? '객관식' : '단답형'}</span>
                            </div>

                            <h4 className="text-lg font-bold text-gray-900 mb-6 whitespace-pre-wrap">{q.question_text}</h4>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* 제출한 답 */}
                                <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                                    <div className="text-xs font-bold mb-1 opacity-70">내가 제출한 답</div>
                                    <div className="font-medium text-lg break-words">
                                        {ans.submitted_answer || <span className="text-gray-400 italic">미입력</span>}
                                    </div>
                                </div>

                                {/* 정답 */}
                                <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-900">
                                    <div className="text-xs font-bold mb-1 opacity-70">정답</div>
                                    <div className="font-medium text-lg break-words">{q.answer}</div>
                                </div>
                            </div>

                            {/* 해설 */}
                            {q.explanation && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                    <div className="font-bold text-gray-600 mb-1 text-sm flex items-center gap-1">
                                        <span>💡</span> 해설
                                    </div>
                                    <div className="text-gray-700 whitespace-pre-wrap">{q.explanation}</div>
                                </div>
                            )}

                            {/* 오답 노트로 복사 버튼 */}
                            {!isCorrect && (
                                <CopyToWrongAnswerButton
                                    courseId={courseId}
                                    question={q.question_text}
                                    myAnswer={ans.submitted_answer || ''}
                                    correctAnswer={q.answer}
                                    explanation={q.explanation || ''}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="text-center mt-12">
                <Link href={`/courses/${courseId}/quizzes/${quizId}`}>
                    <button className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-900 transition shadow-md">
                        확인 완료 및 돌아가기
                    </button>
                </Link>
            </div>
        </div>
    )
}
