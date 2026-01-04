# SubtitleFlow MVP

SubtitleFlow is a high-performance web application that extracts YouTube transcripts and transforms them into LinkedIn posts and SEO-optimized blogs using AI.

## Features

- **Project Management**: Organize your videos into logical collections.
- **Bulk Extraction**: Add playlists or single videos to fetch transcripts automatically.
- **AI Transformations**: Generate LinkedIn posts and SEO blogs with one click.
- **Project Analysis**: Analyze common themes across all videos in a project.
- **Premium UI**: Sleek dark mode with glassmorphism and smooth animations.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Next.js API Routes + BullMQ (Redis)
- **Database**: PostgreSQL (Prisma)
- **AI**: OpenAI GPT-4o
- **UI**: Vanilla CSS + Framer Motion + Lucide Icons

## Getting Started

1. **Clone the repo**
2. **Install dependencies**: `npm install`
3. **Setup environment variables**: Copy `.env.example` to `.env` and fill in the keys.
4. **Setup Database**: `npx prisma db push`
5. **Run the App**:
   - Web Server: `npm run dev`
   - Background Worker: `npm run worker`

## Deployment

This project is ready for deployment on **Railway**.

- Connect your GitHub repo.
- Add PostgreSQL and Redis services.
- Set the environment variables in Railway dashboard.
- The `postinstall` script will handle Prisma generation.
