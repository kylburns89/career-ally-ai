# Career Ally AI

An AI-powered career companion that helps with resumes, cover letters, interview preparation, and more.

## Features

- Resume Builder with customizable templates
- Cover Letter Generator
- Interview Simulator
- Salary Coach
- Technical Challenge Practice
- Application Tracker

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- Supabase (Auth & Database)
- OpenAI API
- Uploadthing for file uploads
- Shadcn/ui components

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. A Supabase account
3. An OpenAI API key
4. An Uploadthing account
5. A RapidAPI key (for job search features)

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/career-ally-ai.git
   cd career-ally-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Get your project URL and anon key from Project Settings -> API

4. Create a `.env.local` file with your environment variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # OpenAI
   OPENAI_API_KEY=your_openai_api_key

   # UploadThing
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id

   # RapidAPI
   RAPID_API_KEY=your_rapidapi_key
   ```

### Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query
4. Copy the contents of `supabase/migrations/20240101000000_initial_schema.sql`
5. Run the query to create all tables and set up Row Level Security (RLS) policies

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main tables:

- `profiles`: User profile information
- `resumes`: User's saved resumes
- `cover_letters`: Generated cover letters
- `applications`: Job application tracking
- `chat_histories`: Chat history for interview simulator, salary coach, etc.

Each table has Row Level Security (RLS) policies to ensure users can only access their own data.

## Authentication

Authentication is handled by Supabase Auth with the following features:
- Email/Password authentication
- GitHub OAuth
- Protected routes and API endpoints
- Automatic session management

## API Routes

The application includes several API routes:

- `/api/resumes`: CRUD operations for resumes
- `/api/cover-letter`: Generate and manage cover letters
- `/api/analyze-resume`: AI-powered resume analysis
- `/api/interview`: Interview simulation endpoints
- `/api/salary-coach`: Salary negotiation assistance
- `/api/challenges`: Technical challenge endpoints
- `/api/applications`: Job application tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [OpenAI](https://openai.com/) for the AI capabilities
- [Supabase](https://supabase.com/) for authentication and database
- [Next.js](https://nextjs.org/) for the framework
