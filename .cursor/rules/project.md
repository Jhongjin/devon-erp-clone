# Project Rules

## Tech Stack
- Framework: Next.js 14+ (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS + shadcn/ui
- Backend/DB: Supabase (PostgreSQL + Auth + Storage)
- Deployment: Vercel
- Package Manager: pnpm

## Code Style
- Use camelCase for variables/functions, PascalCase for components
- Always use TypeScript strict mode
- Use server components by default, use client only when needed
- All API routes go in app/api/
- Use Supabase client from @supabase/ssr

## Workflow
- After schema changes, apply migration via Supabase MCP
- After code changes, run: pnpm build to verify
- Deploy with: vercel --prod --token env:VERCEL_TOKEN
- Always set USERNAME=Jhongjin and NODE_TLS_REJECT_UNAUTHORIZED=0 before vercel commands

## Database
- Use Supabase MCP for all database operations
- Always enable RLS on new tables
- Generate TypeScript types after schema changes

## UI/UX
- ERP dashboard design: sidebar navigation, top header, data tables
- Responsive design with Tailwind breakpoints
- Use shadcn/ui components
- Charts: recharts library
- Korean language UI
