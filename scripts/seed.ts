import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log('--- Seeding Data Started ---')

    const email = 'student@example.com'
    const password = 'password123!'

    // 1. Create or Sign in User
    let userId = ''
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInData?.user) {
        userId = signInData.user.id
    } else {
        // If sign in fails, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) {
            console.error('Error signing up user', signUpError)
            return
        }
        userId = signUpData?.user?.id || ''
    }

    if (!userId) {
        console.log('User ID not found via sign in or sign up')
        return
    }

    console.log(`User created/found: ${userId}`)

    // 2. Create Semester
    const { data: semesterData, error: sError } = await supabase.from('semesters').upsert({
        user_id: userId,
        name: '2024년 2학기',
        is_active: true
    }).select().single()

    if (sError) console.error(sError)
    const semesterId = semesterData?.id

    // 3. Create Courses
    const { data: courses, error: cError } = await supabase.from('courses').upsert([
        { user_id: userId, semester_id: semesterId, name: '성인간호학', professor: '김교수', credit: 3 },
        { user_id: userId, semester_id: semesterId, name: '간호관리학', professor: '이교수', credit: 2 }
    ]).select()

    if (cError) console.error(cError)
    const adultCourseId = courses?.find(c => c.name === '성인간호학')?.id
    const manageCourseId = courses?.find(c => c.name === '간호관리학')?.id

    // 4. Create Tasks
    if (adultCourseId) {
        await supabase.from('tasks').upsert([
            { user_id: userId, course_id: adultCourseId, title: '심혈관계 케이스 스터디', priority: 'HIGH', status: 'TODO' },
            { user_id: userId, course_id: adultCourseId, title: '호흡기내과 실습 일지 작성', priority: 'MEDIUM', status: 'IN_PROGRESS' }
        ])
    }

    // 5. Create Notes
    if (manageCourseId) {
        await supabase.from('notes').upsert([
            { user_id: userId, course_id: manageCourseId, note_type: 'STUDY', title: '간호조직 문화의 특성', content: '간호조직은 생명과 직결된 업무여서 수직적 성향이 강함...' },
            { user_id: userId, course_id: manageCourseId, note_type: 'SUMMARY', title: '리더십 이론 요약', content: '특성추구 이론 -> 행동이론 -> 상황조건 이론' }
        ])
    }

    // 6. Create Quizzes
    if (adultCourseId) {
        const { data: quizData } = await supabase.from('quizzes').upsert({
            user_id: userId, course_id: adultCourseId, title: '성인간호학 기말 대비 퀴즈 1차'
        }).select().single()

        if (quizData) {
            await supabase.from('quiz_questions').upsert([
                { quiz_id: quizData.id, question: '협심증 환자의 흉통 완화를 위해 투여하는 약물은?', question_type: 'SHORT_ANSWER', correct_answer: '니트로글리세린' },
                { quiz_id: quizData.id, question: '우심부전의 주요 증상이 아닌 것은?', question_type: 'MULTIPLE_CHOICE', options: ['경정맥 울혈', '말초부종', '기좌호흡', '간비대'], correct_answer: '기좌호흡' }
            ])
        }
    }

    console.log('--- Seeding Data Completed ---')
}

seed().catch(console.error)
