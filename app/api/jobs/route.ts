import { NextResponse } from 'next/server';

interface Job {
  job_id: string;
  employer_name: string;
  job_title: string;
  job_description: string;
  job_location: string;
  job_posted_at: string;
  job_apply_link: string;
  source: string;
  logo?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const location = searchParams.get('location') || '';
  const experienceLevel = searchParams.get('experienceLevel');

  // Generate search URLs for various job boards
  const linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;
  const indeedUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;
  const glassdoorUrl = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(query)}&locT=C&locId=0`;
  
  // Return curated job board links and some example positions
  const jobs: Job[] = [
    {
      job_id: 'linkedin',
      employer_name: 'LinkedIn Jobs',
      job_title: `Search "${query}" jobs on LinkedIn`,
      job_description: 'Access millions of job postings, leverage your professional network, and get discovered by recruiters.',
      job_location: 'Worldwide',
      job_posted_at: 'Real-time',
      job_apply_link: linkedInUrl,
      source: 'LinkedIn',
      logo: '/linkedin-logo.png'
    },
    {
      job_id: 'indeed',
      employer_name: 'Indeed',
      job_title: `Find "${query}" positions on Indeed`,
      job_description: 'Search millions of jobs from thousands of job boards, newspapers, classifieds and company websites.',
      job_location: 'Worldwide',
      job_posted_at: 'Real-time',
      job_apply_link: indeedUrl,
      source: 'Indeed',
      logo: '/indeed-logo.png'
    },
    {
      job_id: 'glassdoor',
      employer_name: 'Glassdoor',
      job_title: `Explore "${query}" opportunities on Glassdoor`,
      job_description: 'Find jobs and research companies with millions of reviews and salary information.',
      job_location: 'Worldwide',
      job_posted_at: 'Real-time',
      job_apply_link: glassdoorUrl,
      source: 'Glassdoor',
      logo: '/glassdoor-logo.png'
    }
  ];

  // Add some example positions based on the search query
  const exampleJobs: Job[] = [
    {
      job_id: '1',
      employer_name: 'Tech Solutions Inc',
      job_title: `Senior ${query}`,
      job_description: `We are looking for a talented ${query} to join our growing team. You will be responsible for developing high-quality solutions, collaborating with cross-functional teams, and participating in code reviews.`,
      job_location: 'San Francisco, CA',
      job_posted_at: 'Example Position',
      job_apply_link: linkedInUrl,
      source: 'Example'
    },
    {
      job_id: '2',
      employer_name: 'Digital Innovations',
      job_title: `Lead ${query}`,
      job_description: `Join our team as a Lead ${query} and help build innovative solutions. You will work with modern technologies and collaborate with talented professionals.`,
      job_location: 'New York, NY',
      job_posted_at: 'Example Position',
      job_apply_link: indeedUrl,
      source: 'Example'
    }
  ];

  return NextResponse.json({ 
    data: [...jobs, ...exampleJobs],
    message: 'Showing job board links and example positions'
  });
}
