-- ================================================================
-- Phase 5 마이그레이션 — 교수 스타일 태깅 테이블
-- Supabase SQL Editor에서 실행
-- ================================================================

-- 교수 스타일 태깅 테이블
CREATE TABLE IF NOT EXISTS professor_styles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_type TEXT[] DEFAULT '{}',
    emphasis_keywords TEXT[] DEFAULT '{}',
    grading_style TEXT DEFAULT 'moderate',
    notes TEXT DEFAULT '',
    tips TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, user_id)
);

-- RLS
ALTER TABLE professor_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own professor_styles"
    ON professor_styles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_professor_styles_course_user
    ON professor_styles(course_id, user_id);
