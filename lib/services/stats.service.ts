import { createClient } from '../supabase/server'

export interface StudyStats {
    totalQuizAttempts: number
    averageQuizScore: number
    totalWrongAnswerNotes: number
    completedTasksRatio: string
    totalNotes: number
    recentNotes: { id: string; title: string; course_id: string; course_name: string; created_at: string }[]
}

export async function getStudyStats(): Promise<StudyStats> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            totalQuizAttempts: 0,
            averageQuizScore: 0,
            totalWrongAnswerNotes: 0,
            completedTasksRatio: '0/0',
            totalNotes: 0,
            recentNotes: [],
        }
    }

    // Quiz attempts & average score
    const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('user_id', user.id)

    const totalQuizAttempts = attempts?.length ?? 0
    const averageQuizScore = totalQuizAttempts > 0
        ? Math.round((attempts?.reduce((sum, a) => sum + (a.score ?? 0), 0) ?? 0) / totalQuizAttempts)
        : 0

    // Wrong answer notes count
    const { count: wrongAnswerCount } = await supabase
        .from('wrong_answer_notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Tasks ratio (completed / total)
    const { data: allTasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('user_id', user.id)

    const totalTasks = allTasks?.length ?? 0
    const completedTasks = allTasks?.filter(t => t.status === 'DONE').length ?? 0

    // Total notes count
    const { count: notesCount } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

    // Recent notes with course name
    const { data: recentNotesData } = await supabase
        .from('notes')
        .select('id, title, course_id, created_at, course:courses(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    const recentNotes = (recentNotesData ?? []).map((n: Record<string, unknown>) => ({
        id: n.id as string,
        title: (n.title as string) || '제목 없음',
        course_id: n.course_id as string,
        course_name: (n.course as Record<string, unknown>)?.name as string || '',
        created_at: n.created_at as string,
    }))

    return {
        totalQuizAttempts,
        averageQuizScore,
        totalWrongAnswerNotes: wrongAnswerCount ?? 0,
        completedTasksRatio: `${completedTasks}/${totalTasks}`,
        totalNotes: notesCount ?? 0,
        recentNotes,
    }
}
