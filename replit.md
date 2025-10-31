# Jade Royale Casino

## Overview

Jade Royale Casino is a 3D online casino platform featuring an immersive 3D casino floor with interactive slot machines and gaming experiences. The application combines a modern React frontend with Three.js 3D rendering and an Express backend with PostgreSQL database storage.

The platform provides user authentication, virtual currency management, slot machine games, and comprehensive player statistics tracking. Users navigate a visually rich 3D casino environment where they can interact with different game stations.

## Recent Changes

**October 31, 2025 - Cashier Redesign & Visual Enhancements:**
- Redesigned cashier station with interactive video display using user-uploaded content
- Added dual interactive text bubbles: "💵 Add Credits?" (left, green hover) and "🏦 Withdraw?" (right, gold hover)
- Implemented video playback using useVideoTexture for smooth looping animation
- Enhanced cashier booth dimensions (8x5 units) with cyan ambient lighting
- Raised "JADE ROYALE" sign to y=16 for better visibility from elevated camera
- Raised camera height from 2.4 to 3.5 units for improved perspective (less floor visible)
- Removed black frame/bezel from slot machine video displays for clean edge-to-edge video

**October 31, 2025 - Backend APIs & Fish Table Redesign:**
- Implemented complete backend for daily check-in feature (7-day calendar with $300-$900 rewards)
- Implemented complete backend for spin wheel feature (12-hour cooldown, 250-700 credit prizes)
- Redesigned fish table layout: 6 tables arranged in single horizontal line (instead of 2x3 grid)
- Added holographic video display system: videos float 3.5 units above selected table with glowing frame
- Fish tables now toggle selection with green glow when selected, cyan when unselected
- Expanded camera bounds to -25/+25 on X-axis for full slot machine access (13 machines, 3.8 unit spacing)
- Added selectedFishTable state to useRoom store for tracking active fish table

**October 31, 2025 - Frontend Optimization & Cleanup:**
- Removed 38 unused UI components (kept only 6 essential: button, checkbox, dialog, input, label, sonner)
- Removed 3 unused files: pages/not-found.tsx, components/MobileControls.tsx, hooks/use-is-mobile.tsx
- Removed ~163 unused npm packages (from 613 → 454 total packages)
- Fixed sonner.tsx to remove next-themes dependency, hardcoded dark theme
- Fixed TypeScript errors in CashierModal.tsx and server/routes.ts
- Total optimization: ~159 package reduction for improved load times and bundle size

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for UI components
- Three.js via @react-three/fiber for 3D rendering
- @react-three/drei for 3D utilities and controls
- Vite as build tool and development server
- TailwindCSS for styling
- Minimal Radix UI components (5 primitives: checkbox, dialog, label, slot, visually-hidden)

**State Management:**
- Zustand for client-side state management
- Multiple stores for different concerns:
  - `useUser`: Authentication and user profile state
  - `useAudio`: Audio settings (music/SFX toggles, volume)
  - `useGame`: Game phase management (ready/playing/ended)
- TanStack Query (React Query) for server state synchronization

**3D Scene Architecture:**
- Canvas-based 3D rendering using react-three-fiber
- First-person navigation with pointer lock controls
- Room-based scene organization (slots, cashier, fish tables)
- Interactive 3D objects triggering modal dialogs
- GLSL shader support for advanced visual effects

**Component Structure:**
- Modal-based interactions for games and transactions:
  - `AuthModal`: User login/registration with demo mode option
  - `CashierModal`: Deposits, withdrawals, transaction history
  - `SlotMachineModal`: Slot machine gameplay interface
  - `StatsModal`: Player statistics and analytics
  - `UpgradeAccountModal`: Convert demo accounts to permanent accounts
- `CasinoScene`: Main 3D environment renderer
- `Navigation`: Transparent top navigation bar (authenticated users only)
  - Left side: Daily Check-in and Free Credits clickable icons
  - Right side: Credit balance display and user avatar dropdown menu
  - Dropdown menu: Upgrade Account (demo users only), View Stats, Change Password, Logout
- `AudioManager`: Background music and SFX playback
- Custom event system for cross-component communication

### Backend Architecture

**Technology Stack:**
- Node.js with Express for HTTP server
- TypeScript with ESM modules
- Express-session for session-based authentication
- bcryptjs for password hashing

**API Design:**
- RESTful endpoints under `/api` prefix
- Session-based authentication (cookies)
- JSON request/response format
- Error handling middleware with status codes

**Key Routes:**
- `POST /api/auth/register`: Create new user account
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/logout`: End user session
- `GET /api/auth/me`: Get current user profile
- `POST /api/auth/demo`: Create instant demo account with 2000 free credits
- `POST /api/auth/upgrade-demo`: Convert demo account to permanent account
- `POST /api/transactions`: Create transaction
- `GET /api/transactions`: Retrieve user transaction history
- `GET /api/stats`: Get player game statistics
- `POST /api/slot-machine/spin`: Execute slot machine game logic

**Data Access Layer:**
- `DatabaseStorage` class implementing `IStorage` interface
- Abstraction layer for database operations
- Transaction management for balance updates
- Game statistics aggregation

### Data Storage

**Database:**
- PostgreSQL via Neon serverless driver
- Drizzle ORM for type-safe database access
- WebSocket connection for serverless compatibility

**Schema Design:**
- `users` table: User credentials and balance
  - id (serial primary key)
  - username (unique text)
  - password (hashed text)
  - balance (integer, default 1000)
  - isDemo (boolean, default false)
  - createdAt (timestamp, default now())

- `transactions` table: Financial and game activity log
  - id (serial primary key)
  - userId (foreign key to users)
  - type (text: 'deposit', 'withdraw', 'bet', 'win')
  - amount (integer)
  - balanceBefore (integer)
  - balanceAfter (integer)
  - description (optional text)
  - createdAt (timestamp)

**Data Validation:**
- Zod schemas for runtime validation
- Type inference from Drizzle schemas
- Client and server-side validation

### Authentication & Authorization

**Authentication Flow:**
- Session-based authentication using express-session
- Session stored in memory (configurable for production)
- HTTP-only cookies for session tokens
- Password hashing with bcrypt (10-12 rounds)
- All auth responses include `isDemo` flag for client state management

**Demo Mode:**
- Instant access with "Try Demo Mode" button (no registration required)
- Demo accounts receive 2000 free credits
- Unique usernames generated with timestamp + random suffix
- Retry logic (10 attempts) prevents username collisions
- Demo users can upgrade to permanent accounts anytime
- Upgrade validation: username trimming, character set enforcement (alphanumeric + underscore), length checks (3-20 chars), minimum 6-character passwords
- Bcrypt cost 12 for upgraded accounts

**Session Configuration:**
- 7-day session expiration
- Secure cookies in production
- Custom session secret via environment variable

**Authorization:**
- Middleware checks session for protected routes
- User ID stored in session upon login
- Balance and transaction queries scoped to authenticated user

### External Dependencies

**Database Service:**
- Neon PostgreSQL serverless database
- Connection via DATABASE_URL environment variable
- WebSocket-based connection pooling

**Third-Party Libraries:**
- Radix UI: Accessible component primitives
- Three.js ecosystem: 3D rendering and controls
- Fontsource: Self-hosted Inter font
- Lucide React: Icon library
- Sonner: Toast notifications
- class-variance-authority: Component variant utilities

**Development Tools:**
- Drizzle Kit: Database migrations and schema management
- tsx: TypeScript execution for development
- esbuild: Production server bundling
- PostCSS with Autoprefixer: CSS processing

**Audio Assets:**
- Background music (MP3 format)
- Sound effects for game interactions
- Browser Audio API for playback control