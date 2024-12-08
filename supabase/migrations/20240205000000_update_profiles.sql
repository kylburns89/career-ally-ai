-- Add career preference fields to profiles table
ALTER TABLE profiles
ADD COLUMN desired_salary numeric,
ADD COLUMN desired_location text,
ADD COLUMN remote_only boolean DEFAULT false,
ADD COLUMN linkedin text,
ADD COLUMN github text,
ADD COLUMN portfolio text;
