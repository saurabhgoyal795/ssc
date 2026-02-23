# SSC Exam Frontend

Frontend for SSC and Government Exam Preparation Platform built with Next.js 14.

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Zustand** (state management)
- **SWR** (data fetching)
- **React Hook Form** + **Zod** (form validation)
- **Axios** (API client)

## Prerequisites

- Node.js 18+
- npm 9+

## Setup Instructions

### 1. Navigate to the frontend directory

```bash
cd ssc-exam-platform/ssc-exam-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the values:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENABLE_PAYMENTS=false
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── auth/        # Login, Register pages
│   ├── dashboard/   # User dashboard
│   ├── tests/       # Test pages (to be implemented)
│   └── layout.tsx   # Root layout
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Header, Footer, Sidebar (to be implemented)
│   └── test/        # Test components (to be implemented)
├── lib/
│   ├── api/         # API client and endpoints
│   ├── hooks/       # Custom React hooks (to be implemented)
│   └── utils.ts     # Utility functions
├── store/           # Zustand state management
└── types/           # TypeScript type definitions
```

## Features Implemented (Phase 1)

✅ Authentication (Login/Register)
✅ JWT token management with auto-refresh
✅ Protected routes
✅ Basic dashboard
✅ Zustand state management
✅ API client with interceptors
✅ shadcn/ui components
✅ TypeScript types

## Features To Be Implemented (Phase 2+)

- Test listing and details pages
- Test taking interface
- Timer and auto-submit
- Question navigator
- Results and analytics
- Study materials
- Video courses
- User profile
- Admin panel

## Important Notes

- **All content is FREE** during the initial phase
- Premium features are disabled (`NEXT_PUBLIC_ENABLE_PAYMENTS=false`)
- Authentication persists in localStorage
- Tokens auto-refresh on 401 errors

## API Integration

The frontend connects to the Spring Boot backend running on `http://localhost:8080`.

Ensure the backend is running before starting the frontend.

## Styling

Using Tailwind CSS with shadcn/ui component library for consistent, accessible UI components.

Color scheme is defined in `src/app/globals.css` and supports both light and dark modes.

## Development Tips

1. **Hot Reload**: Changes auto-reload in development
2. **Type Safety**: TypeScript ensures type safety across the app
3. **State Management**: Use Zustand hooks for global state
4. **API Calls**: Use the `apiClient` in `src/lib/api/client.ts`

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

### Manual Build

```bash
npm run build
npm start
```

## Troubleshooting

### API Connection Issues
- Verify backend is running on port 8080
- Check CORS settings in backend
- Ensure `NEXT_PUBLIC_API_URL` is correct

### Authentication Issues
- Clear localStorage and try again
- Check JWT token expiry settings in backend
- Verify token format in API requests

### Build Errors
- Delete `.next` folder and rebuild
- Clear npm cache: `npm cache clean --force`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## License

Proprietary - All rights reserved
# Deployment Tue Feb 24 01:43:00 IST 2026
