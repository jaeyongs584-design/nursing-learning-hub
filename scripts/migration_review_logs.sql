-- ================================================================
-- 복습 로그 테이블 마이그레이션
-- Supabase SQL Editor에서 실행
-- ================================================================

CREATE TABLE IF NOT EXISTS review_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('wrong_answer', 'quiz', 'summary')),
    rating TEXT NOT NULL CHECK (rating IN ('know', 'confused', 'forgot', 'again')),
    reviewed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own review_logs"
    ON review_logs FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_review_logs_user_item
    ON review_logs(user_id, item_id);

CREATE INDEX IF NOT EXISTS idx_review_logs_reviewed_at
    ON review_logs(user_id, reviewed_at DESC);
