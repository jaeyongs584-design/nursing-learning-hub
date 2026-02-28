-- ================================================================
-- Nursing Hub V2 Migration — 통합 학습 플랫폼 확장
-- 기존 테이블 유지, 신규 테이블 추가
-- ================================================================

-- 1) assignments: 과제 상세 (tasks 1:1 확장)
CREATE TABLE IF NOT EXISTS assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE UNIQUE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    due_date TIMESTAMPTZ,
    weight_percent NUMERIC(5,2) DEFAULT 0,
    estimated_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'submitted', 'graded')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) assignment_requirements: AI 요구사항 분석 결과
CREATE TABLE IF NOT EXISTS assignment_requirements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_text TEXT NOT NULL DEFAULT '',
    analysis_json JSONB DEFAULT '{}',
    ai_provider TEXT DEFAULT 'mock',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3) assignment_drafts: 보고서/PPT 초안 (버전 관리)
CREATE TABLE IF NOT EXISTS assignment_drafts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    draft_type TEXT NOT NULL CHECK (draft_type IN ('report_outline', 'report_draft', 'ppt_outline', 'speaker_notes')),
    version_no INTEGER NOT NULL DEFAULT 1 CHECK (version_no >= 1),
    title TEXT DEFAULT '',
    content_text TEXT DEFAULT '',
    content_json JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final_candidate')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4) assignment_files: 과제 자료함
CREATE TABLE IF NOT EXISTS assignment_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL DEFAULT '',
    storage_path TEXT NOT NULL DEFAULT '',
    file_type TEXT DEFAULT '',
    file_size INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5) ai_summaries: 자료/노트 AI 요약 결과
CREATE TABLE IF NOT EXISTS ai_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL DEFAULT 'text' CHECK (source_type IN ('material', 'text', 'note')),
    source_ref_id UUID,
    summary_type TEXT NOT NULL DEFAULT '3line' CHECK (summary_type IN ('3line', 'key_concepts', 'exam_points', 'flash_cards')),
    input_text TEXT DEFAULT '',
    result_json JSONB DEFAULT '{}',
    ai_provider TEXT DEFAULT 'mock',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6) grade_schemes: 과목별 평가 비율
CREATE TABLE IF NOT EXISTS grade_schemes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    attendance_weight NUMERIC(5,2) DEFAULT 10,
    assignment_weight NUMERIC(5,2) DEFAULT 20,
    midterm_weight NUMERIC(5,2) DEFAULT 30,
    final_weight NUMERIC(5,2) DEFAULT 40,
    other_weight NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id, user_id)
);

-- 7) grade_entries: 입력된 점수
CREATE TABLE IF NOT EXISTS grade_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('attendance', 'assignment', 'midterm', 'final', 'other')),
    score NUMERIC(6,2) DEFAULT 0,
    max_score NUMERIC(6,2) DEFAULT 100,
    label TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_assignments_user_course ON assignments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_assignment_requirements_assignment ON assignment_requirements(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_drafts_lookup ON assignment_drafts(assignment_id, draft_type, version_no DESC);
CREATE INDEX IF NOT EXISTS idx_assignment_files_assignment ON assignment_files(assignment_id);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_course ON ai_summaries(course_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_user ON ai_summaries(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_grade_entries_user_course ON grade_entries(user_id, course_id);

-- ================================================================
-- RLS (Row Level Security)
-- ================================================================
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_entries ENABLE ROW LEVEL SECURITY;

-- assignments RLS
CREATE POLICY "Users can manage their own assignments" ON assignments
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- assignment_requirements RLS
CREATE POLICY "Users can manage their own requirements" ON assignment_requirements
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- assignment_drafts RLS
CREATE POLICY "Users can manage their own drafts" ON assignment_drafts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- assignment_files RLS
CREATE POLICY "Users can manage their own files" ON assignment_files
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_summaries RLS
CREATE POLICY "Users can manage their own summaries" ON ai_summaries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- grade_schemes RLS
CREATE POLICY "Users can manage their own grade schemes" ON grade_schemes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- grade_entries RLS
CREATE POLICY "Users can manage their own grade entries" ON grade_entries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
