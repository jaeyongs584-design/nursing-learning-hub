import { getQuizWithQuestions } from '@/lib/services/quiz.service'
import { getQuizAttempts } from '@/lib/services/quiz_attempt.service'
import QuestionForm from '@/components/QuestionForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function QuizDetailPage({ params }: { params: Promise<{ courseId: string, quizId: string }> }) {
    const { courseId, quizId } = await params
    const data = await getQuizWithQuestions(quizId)

    if (!data) {
        notFound()
    }

    const { quiz, questions } = data
    const attempts = await getQuizAttempts(quizId)

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="bg-white border rounded-2xl p-8 shadow-sm relative">
                <Link href={`/courses/${courseId}/quizzes`} className="text-sm text-blue-600 hover:underline mb-4 inline-block font-medium">
                    &larr; 퀴즈 목록으로
                </Link>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded uppercase">{quiz.source_type}</span>
                            <span className="text-gray-400 text-sm">{new Date(quiz.created_at).toLocaleDateString()} 생성됨</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900">{quiz.title}</h1>
                        {quiz.description && (
                            <p className="text-gray-600 mt-3 text-lg">{quiz.description}</p>
                        )}
                    </div>
                </div>
                {questions.length > 0 && (
                    <div className="absolute top-8 right-8">
                        <Link href={`/courses/${courseId}/quizzes/${quizId}/take`}>
                            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md flex items-center gap-2">
                                <span className="text-xl">🎯</span> 퀴즈 풀기
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-end border-b pb-2">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="text-blue-500">📝</span>
                        등록된 문항 리스트
                    </h2>
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">
                        총 {questions.length}문제
                    </span>
                </div>

                {questions.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 border border-dashed rounded-xl">
                        <p className="text-gray-500 font-medium">이 퀴즈 세트에는 아직 문제가 없습니다.</p>
                        <p className="text-sm text-gray-400 mt-1">아래 버튼을 눌러 새 문항을 추가해보세요.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((q, idx) => (
                            <div key={q.id} className="bg-white border rounded-xl p-6 shadow-sm relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>

                                <div className="flex justify-between mb-4">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{idx + 1}번 문제 | {q.question_type === 'MULTIPLE_CHOICE' ? '객관식' : '단답형'}</span>
                                    {/* Edit/Delete buttons could go here */}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-4 whitespace-pre-wrap leading-relaxed">{q.question_text}</h3>

                                {q.question_type === 'MULTIPLE_CHOICE' && q.options && (
                                    <div className="space-y-2 mb-6 ml-2">
                                        {(Array.isArray(q.options) ? q.options : JSON.parse(q.options as unknown as string)).map((opt: string, oIdx: number) => (
                                            <div key={oIdx} className="flex gap-3 bg-gray-50 p-3 rounded-lg border">
                                                <span className="font-bold text-gray-400">{oIdx + 1}.</span>
                                                <span className="text-gray-700 font-medium">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
                                    <div className="font-bold text-green-800 mb-1 flex items-center gap-2">
                                        <span className="text-lg">🎯</span> 정답
                                    </div>
                                    <div className="text-green-900 font-medium ml-7">{q.answer}</div>
                                </div>

                                {q.explanation && (
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                                        <div className="font-bold text-gray-700 mb-1 flex items-center gap-2">
                                            <span className="text-lg">💡</span> 해설
                                        </div>
                                        <div className="text-gray-600 text-sm ml-7 whitespace-pre-wrap">{q.explanation}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <QuestionForm quizId={quiz.id} />

                {questions.length > 0 && (
                    <div className="mt-12 text-center p-8 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                        <h3 className="text-xl font-bold text-blue-900 mb-2">모든 문제를 다 내셨나요?</h3>
                        <p className="text-blue-700 mb-6">이제 스스로 퀴즈를 풀며 실력을 테스트해 보세요!</p>
                        <Link href={`/courses/${courseId}/quizzes/${quizId}/take`}>
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg transform hover:-translate-y-1">
                                🎯 이 퀴즈 시작하기
                            </button>
                        </Link>
                    </div>
                )}

                {/* 지난 기록 섹션 */}
                {attempts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 border-b pb-2">
                            <span className="text-green-500">📊</span>
                            지난 풀이 기록
                        </h2>
                        <div className="grid gap-3">
                            {attempts.map((attempt) => (
                                <Link key={attempt.id} href={`/courses/${courseId}/quizzes/${quizId}/attempts/${attempt.id}`} className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-green-400 hover:shadow-md transition">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm text-gray-500 mb-1">{new Date(attempt.started_at).toLocaleString()}</div>
                                            <div className="font-bold text-gray-900">
                                                점수: <span className={attempt.score && attempt.score >= 80 ? 'text-green-600' : 'text-orange-600'}>{attempt.score}점</span>
                                            </div>
                                        </div>
                                        <div className="text-green-600 font-medium text-sm">결과 상세보기 &rarr;</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
