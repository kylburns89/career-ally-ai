-- Add analytics-related columns to applications table
ALTER TABLE applications
ADD COLUMN response_date timestamp with time zone,
ADD COLUMN interview_date timestamp with time zone,
ADD COLUMN offer_date timestamp with time zone,
ADD COLUMN rejection_date timestamp with time zone,
ADD COLUMN follow_up_dates timestamp with time zone[],
ADD COLUMN interview_feedback text,
ADD COLUMN salary_offered numeric,
ADD COLUMN application_method text,
ADD COLUMN application_source text,
ADD COLUMN interview_rounds integer DEFAULT 0,
ADD COLUMN interview_types text[],
ADD COLUMN skills_assessed text[];

-- Create a view for application analytics
CREATE OR REPLACE VIEW application_analytics AS
SELECT 
    user_id,
    COUNT(*) as total_applications,
    COUNT(CASE WHEN status = 'offer' THEN 1 END) as offers_received,
    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejections,
    COUNT(CASE WHEN status = 'interviewing' THEN 1 END) as in_interview_process,
    AVG(CASE 
        WHEN response_date IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (response_date - applied_date))/86400.0 
    END) as avg_response_time_days,
    AVG(CASE 
        WHEN status = 'offer' AND salary_offered IS NOT NULL 
        THEN salary_offered 
    END) as avg_salary_offered,
    AVG(interview_rounds) as avg_interview_rounds,
    COUNT(CASE 
        WHEN status = 'interviewing' OR status = 'offer' 
        THEN 1 
    END)::float / NULLIF(COUNT(*), 0) * 100 as interview_rate,
    COUNT(CASE 
        WHEN status = 'offer' 
        THEN 1 
    END)::float / NULLIF(COUNT(CASE 
        WHEN status = 'interviewing' OR status = 'offer' 
        THEN 1 
    END), 0) * 100 as offer_conversion_rate
FROM applications
GROUP BY user_id;
