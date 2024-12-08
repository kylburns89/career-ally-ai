-- Create learning_paths table
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    skill_gaps JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own learning paths"
    ON learning_paths FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning paths"
    ON learning_paths FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths"
    ON learning_paths FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning paths"
    ON learning_paths FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_learning_paths_updated_at
    BEFORE UPDATE ON learning_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX learning_paths_user_id_idx ON learning_paths(user_id);
CREATE INDEX learning_paths_created_at_idx ON learning_paths(created_at);

-- Add helpful comments
COMMENT ON TABLE learning_paths IS 'Stores user learning paths with skill gaps and progress';
COMMENT ON COLUMN learning_paths.skill_gaps IS 'JSON array of skill gaps with associated learning resources and certifications';
