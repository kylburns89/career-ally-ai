-- Drop the existing view first
drop view if exists application_analytics;

-- Create the application_analytics view
create view application_analytics as
with user_applications as (
  select 
    user_id,
    count(*) as total_applications,
    count(case when status = 'offer' then 1 end) as offers_received,
    count(case when status = 'rejected' then 1 end) as rejections,
    count(case when status = 'interviewing' then 1 end) as in_interview_process,
    avg(case 
      when response_date is not null 
      then extract(epoch from (response_date::timestamp - applied_date::timestamp))/86400.0 
    end) as avg_response_time_days,
    avg(case when salary_offered is not null then salary_offered end) as avg_salary_offered,
    avg(case when interview_rounds > 0 then interview_rounds end) as avg_interview_rounds,
    count(case when status in ('interviewing', 'offer', 'rejected') then 1 end)::float / 
      nullif(count(*), 0) * 100 as interview_rate,
    count(case when status = 'offer' then 1 end)::float / 
      nullif(count(*), 0) * 100 as offer_conversion_rate
  from applications
  group by user_id
)
select 
  user_id,
  total_applications,
  offers_received,
  rejections,
  in_interview_process,
  round(avg_response_time_days::numeric, 1) as avg_response_time_days,
  round(avg_salary_offered::numeric, 2) as avg_salary_offered,
  round(avg_interview_rounds::numeric, 1) as avg_interview_rounds,
  round(interview_rate::numeric, 1) as interview_rate,
  round(offer_conversion_rate::numeric, 1) as offer_conversion_rate
from user_applications;

-- Grant access to the view
grant select on application_analytics to authenticated;
