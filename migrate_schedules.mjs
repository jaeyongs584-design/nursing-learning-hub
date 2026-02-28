import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function migrate() {
    // Test if table already exists by trying to select
    const { error: testError } = await supabase
        .from('course_schedules')
        .select('id')
        .limit(1)

    if (!testError) {
        console.log('✅ course_schedules table already exists')
        return
    }

    console.log('Table does not exist yet. Please run the following SQL in Supabase Dashboard > SQL Editor:')
    console.log(`
CREATE TABLE course_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage own schedules" ON course_schedules FOR ALL USING (auth.uid() = user_id);
    `)
}

migrate()
