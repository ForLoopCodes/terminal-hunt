# Terminal Hunt

A Product Hunt-inspired platform for discovering and sharing terminal-based applications. Built with Next.js, TypeScript, PostgreSQL, and Tailwind CSS.

## Features

- 🔐 **Authentication**: Support for Google, Twitter/X OAuth and email/password signup
- 📝 **App Submission**: Submit terminal apps with Markdown descriptions and installation instructions
- ⭐ **Voting System**: Vote for your favorite applications
- 💬 **Comments**: Engage with the community through comments
- 🏆 **Leaderboards**: Track the most popular apps across different time periods
- 🏷️ **Tags**: Filter applications by categories
- 🔍 **Search**: Find applications by name or description
- 👤 **User Profiles**: View user submissions, comments, and achievements
- 📱 **Responsive Design**: Works great on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, WebTUI CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Drizzle ORM
- **Markdown**: React Markdown
- **Package Manager**: Bun

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL 14+
- Google OAuth credentials (optional)
- Twitter/X OAuth credentials (optional)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd terminal-hunt
bun install
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE terminal_hunt;
```

Run the initialization script:

```bash
psql -d terminal_hunt -f database/init.sql
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/terminal_hunt"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Twitter OAuth (optional)
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

### 4. OAuth Setup (Optional)

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### Twitter/X OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Set up OAuth 2.0 with PKCE
4. Add callback URL: `http://localhost:3000/api/auth/callback/twitter`

### 5. Database Migration

Generate and push the database schema:

```bash
bun run db:generate
bun run db:push
```

### 6. Start Development Server

```bash
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:push` - Push database schema
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:generate` - Generate database migrations

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── app/[id]/          # App detail pages
│   ├── profile/[userTag]/ # User profile pages
│   ├── submit/            # Submit app page
│   ├── leaderboard/       # Leaderboard page
│   └── about/             # About page
├── components/            # Reusable React components
├── lib/                   # Utility libraries
│   └── db/               # Database configuration and schema
└── types/                 # TypeScript type definitions

database/
└── init.sql              # Database initialization script
```

## API Endpoints

### Apps

- `GET /api/apps` - List apps with sorting and filtering
- `POST /api/apps` - Create new app (authenticated)
- `GET /api/apps/[id]` - Get app details
- `POST /api/apps/[id]/vote` - Vote for an app (authenticated)
- `POST /api/apps/[id]/comments` - Add comment (authenticated)
- `POST /api/apps/[id]/view` - Log app view

### Users

- `GET /api/users/[userTag]` - Get user profile
- `PUT /api/users/[userTag]` - Update user profile (authenticated)

### Authentication

- `POST /api/auth/signup` - Create new account
- NextAuth.js endpoints at `/api/auth/*`

### Tags

- `GET /api/tags` - List all tags

### Leaderboards

- `GET /api/leaderboards/[period]` - Get leaderboard data (daily, weekly, monthly, yearly)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
