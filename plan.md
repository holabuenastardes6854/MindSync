# MindSync - Functional Music SaaS Plan

## 1. **Authentication with Clerk**
- Install Clerk packages: `npm install @clerk/nextjs` or `npx clerk add`
- Set up environment variables in `.env.local`:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
  CLERK_SECRET_KEY=your_secret_key
  CLERK_WEBHOOK_SECRET=your_webhook_secret
  ```
- Configure `<ClerkProvider>` in `app/layout.tsx` to wrap the entire application
- Create authentication pages:
  - `app/sign-in/[[...sign-in]]/page.tsx` - Implement Clerk's SignIn component
  - `app/sign-up/[[...sign-up]]/page.tsx` - Implement Clerk's SignUp component
  - `app/dashboard/page.tsx` - Protected main dashboard page
- Implement middleware in `middleware.ts` to protect routes:
  ```typescript
  export default authMiddleware({
    publicRoutes: ['/', '/sign-in', '/sign-up', '/api/webhooks(.*)'],
  });
  ```
- Set up User Profile component that displays user information from Clerk
- Implement sign-out functionality in the navbar or user menu

## 2. **Frontend Base Design**
- Set up Tailwind CSS:
  - Configure color scheme and theme variables in `tailwind.config.js`
  - Create base component styles and utility classes
- Create core layout components:
  - `components/layout/Navbar.tsx` - Main navigation with logo, auth state, and profile dropdown
  - `components/layout/Sidebar.tsx` - Navigation for dashboard (collapsible on mobile)
  - `components/layout/Footer.tsx` - Site footer with links and information
- Design main application screens:
  - Landing page with value proposition and pricing
  - Dashboard layout with session controls
  - Account/profile management page
- Create music session UI components:
  - `components/music/CategorySelector.tsx` - Tabbed interface for Focus, Relax, Sleep categories
  - `components/music/DurationSelector.tsx` - Duration options (15min, 30min, 1hr, 2hr)
  - `components/music/Player.tsx` - Music player with visualizer, play/pause, progress bar, volume
  - `components/music/TrackInfo.tsx` - Display current track information
- Implement responsive design for all screen sizes:
  - Mobile-first approach with breakpoints for tablet and desktop
  - Collapsible sidebar for mobile view
  - Optimized player controls for touch interfaces

## 3. **Database Configuration (MongoDB)**
- Set up MongoDB Atlas account and create a new cluster
- Install MongoDB dependencies:

- Configure MongoDB connection in `lib/mongodb/connection.ts`:
  ```typescript
  import mongoose from 'mongoose';

  const MONGODB_URI = process.env.MONGODB_URI;

  export async function connectToDatabase() {
    // Connection logic with error handling
  }
  ```
- Define database schemas and models:
  - **User Model** (`models/User.ts`):
    ```typescript
    import mongoose from 'mongoose';
    
    const UserSchema = new mongoose.Schema({
      clerkId: { type: String, required: true, unique: true },
      email: { type: String, required: true },
      name: { type: String },
      preferences: {
        favoriteCategory: { type: String, enum: ['focus', 'relax', 'sleep'] },
        preferredDuration: { type: Number }, // in minutes
        volume: { type: Number, default: 80 },
      },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });
    ```
  - **Session Model** (`models/Session.ts`):
    ```typescript
    const SessionSchema = new mongoose.Schema({
      userId: { type: String, required: true },
      category: { type: String, enum: ['focus', 'relax', 'sleep'], required: true },
      duration: { type: Number, required: true }, // in minutes
      completedDuration: { type: Number, default: 0 }, // actual played time
      startedAt: { type: Date, default: Date.now },
      endedAt: { type: Date },
      tracks: [{ trackId: String, playedDuration: Number }],
    });
    ```
  - **Subscription Model** (`models/Subscription.ts`):
    ```typescript
    const SubscriptionSchema = new mongoose.Schema({
      userId: { type: String, required: true, unique: true },
      stripeCustomerId: { type: String },
      stripePriceId: { type: String },
      stripeSubscriptionId: { type: String },
      status: { type: String, enum: ['active', 'canceled', 'past_due'], default: 'active' },
      plan: { type: String, enum: ['free', 'premium', 'pro'], default: 'free' },
      currentPeriodStart: { type: Date },
      currentPeriodEnd: { type: Date },
      cancelAtPeriodEnd: { type: Boolean, default: false },
    });
    ```
- Create database API routes for CRUD operations:
  - `app/api/users/route.ts` - User management endpoints
  - `app/api/sessions/route.ts` - Session recording and retrieval
  - `app/api/preferences/route.ts` - User preferences management

## 4. **Stripe Integration for Payments**
- Create Stripe account and set up billing products/prices in Stripe Dashboard:
  - Monthly subscription plan
  - Annual subscription plan
  - Configure payment methods including credit cards and cryptocurrencies
- Install Stripe packages:
  ```
  npm install stripe @stripe/stripe-js
  ```
- Set up Stripe environment variables:
  ```
  STRIPE_SECRET_KEY=your_stripe_secret_key
  STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
  ```
- Create Stripe utility functions in `lib/stripe/stripe.ts`:
  ```typescript
  import Stripe from 'stripe';
  
  export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16', // Use latest API version
  });

  export async function createCustomer(email: string, name: string) {
    // Create a customer in Stripe
  }

  export async function createCheckoutSession(customerId: string, priceId: string) {
    // Create checkout session logic
  }
  ```
- Implement API routes for Stripe:
  - `app/api/stripe/checkout/route.ts` - Create checkout session for subscription
  - `app/api/stripe/portal/route.ts` - Create customer portal session for managing subscription
  - `app/api/stripe/webhook/route.ts` - Handle Stripe webhook events
- Create subscription UI components:
  - `components/billing/PricingPlans.tsx` - Display subscription tiers
  - `components/billing/SubscriptionStatus.tsx` - Show current subscription status
  - `components/billing/PaymentForm.tsx` - Form for payment details
- Implement subscription management in dashboard:
  - Subscription status display
  - Upgrade/downgrade options
  - Cancellation flow
  - Payment history
- Add subscription check middleware to protect premium features

## 5. **Music Player Implementation**
- Create audio assets directory structure:
  - `public/audio/focus/` - Focus tracks
  - `public/audio/relax/` - Relaxation tracks
  - `public/audio/sleep/` - Sleep tracks
- Implement audio service with Web Audio API in `lib/audio/audioService.ts`:
  ```typescript
  class AudioService {
    private audioContext: AudioContext;
    private gainNode: GainNode;
    private currentSource: AudioBufferSourceNode | null;
    private trackBuffer: AudioBuffer | null;
    // Additional properties for audio processing
    
    constructor() {
      // Initialize audio context and nodes
    }
    
    async loadTrack(url: string) {
      // Fetch and decode audio data
    }
    
    play() {
      // Play audio logic
    }
    
    pause() {
      // Pause audio logic
    }
    
    setVolume(value: number) {
      // Adjust gain node
    }
    
    seekTo(percentage: number) {
      // Seek to position in track
    }
    
    // Additional methods for audio manipulation
  }
  ```
- Create React hooks for audio management in `hooks/useAudioPlayer.ts`:
  ```typescript
  export function useAudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(80);
    // Additional state and refs
    
    // Player control methods
    
    return {
      isPlaying,
      duration,
      currentTime,
      volume,
      play,
      pause,
      togglePlay,
      seek,
      setVolume,
      // Additional functionality
    };
  }
  ```
- Implement player UI components:
  - `components/player/PlayPauseButton.tsx` - Main control button
  - `components/player/ProgressBar.tsx` - Interactive progress display
  - `components/player/VolumeControl.tsx` - Volume slider
  - `components/player/Timer.tsx` - Session countdown timer
  - `components/player/Visualizer.tsx` - Audio visualization component
- Create session management logic:
  - Track selection based on category
  - Session duration management
  - Session recording to database
  - Autoplay and track transition

## 6. **User Preferences & Personalization**
- Implement preferences API endpoints:
  - `app/api/preferences/route.ts` - Get/update user preferences
- Create preferences components:
  - `components/settings/PreferencesForm.tsx` - Form for editing preferences
  - `components/settings/CategoryPreference.tsx` - Default category selection
  - `components/settings/DurationPreference.tsx` - Default duration selection
- Create data hooks for preferences:
  ```typescript
  export function useUserPreferences() {
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Fetch and update methods
    
    return {
      preferences,
      isLoading,
      updatePreferences,
    };
  }
  ```
- Implement personalized dashboard:
  - Welcome back message with user name
  - Quick start button for favorite category
  - Recently used sessions
  - Usage statistics
- Add recommendation system for tracks based on user history:
  - Track usage patterns
  - Suggest similar or complementary tracks
  - Personalized category recommendations

## 7. **Content Restriction System**
- Implement subscription tier restrictions:
  - Free tier: Limited session duration (15 min), basic tracks only
  - Premium tier: Extended sessions (up to 2 hours), all tracks, no ads
  - Pro tier: All premium features plus offline access, priority support
- Create middleware for checking subscription status:
  ```typescript
  export async function checkSubscription(req: NextRequest) {
    // Extract user ID from auth
    // Check subscription status in database
    // Return subscription tier information
  }
  ```
- Implement feature-gating based on subscription:
  - `components/subscription/PremiumFeatureGate.tsx` - Wrapper component that checks subscription
  - Visual indicators for premium features
  - Upgrade prompts when attempting to use restricted features
- Add API route protection for premium content:
  - `app/api/tracks/premium/route.ts` - Endpoint that checks subscription before serving
- Implement trial system:
  - First-time premium feature usage with limited trial
  - Trial expiration tracking
  - Conversion prompts after trial

## 8. **Webhook Integrations**
- Set up Clerk webhook handling:
  - `app/api/webhooks/clerk/route.ts` - Process Clerk events
  - Handle user creation, deletion, and profile updates
  - Synchronize user data with MongoDB
  ```typescript
  export async function POST(req: Request) {
    const payload = await req.json();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature
    // Process event based on type (user.created, user.deleted, etc.)
    // Update database accordingly
  }
  ```
- Implement Stripe webhook handling:
  - `app/api/webhooks/stripe/route.ts` - Process Stripe events
  - Handle subscription creation, updates, cancellation
  - Process payment successes and failures
  ```typescript
  export async function POST(req: Request) {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') as string;
    
    // Verify webhook signature
    // Process event based on type (subscription events, payment events)
    // Update subscription status in database
  }
  ```
- Create webhook monitoring and error handling:
  - Log webhook events for debugging
  - Implement retry mechanism for failed processes
  - Notify admin on critical webhook failures

## 9. **Testing and Optimization**
- Implement testing suite:
  - Unit tests for key components and functions
  - Integration tests for user flows
  - End-to-end tests for critical paths
- Set up performance monitoring:
  - Web Vitals tracking
  - User interaction metrics
  - API response times
- Optimize performance:
  - Implement code splitting with dynamic imports
  - Optimize image loading with Next.js Image component
  - Use React Suspense for loading states
  - Implement incremental static regeneration for static parts
- Add error tracking and monitoring:
  - Set up error boundaries for UI components
  - Implement global error handling
  - Add monitoring service (e.g., Sentry)
- Conduct cross-browser and cross-device testing:
  - Test on major browsers (Chrome, Firefox, Safari, Edge)
  - Verify functionality on mobile devices
  - Check responsive design breakpoints

## 10. **Deployment and Production**
- Prepare for Vercel deployment:
  - Set up Vercel account and connect to GitHub repository
  - Configure build settings and environment variables
  - Set up custom domain (if applicable)
- Implement CI/CD pipeline:
  - Configure GitHub Actions for testing
  - Set up deployment previews for PRs
  - Implement staging environment
- Set production environment variables:
  - Update Clerk redirect URLs for production
  - Configure Stripe webhook URLs
  - Set up MongoDB production connection string
- Final audit and checks:
  - Security audit of API endpoints
  - Performance testing under load
  - Verify SEO optimization
  - Check accessibility compliance
- Post-launch monitoring and maintenance:
  - Set up uptime monitoring
  - Configure alert systems for critical issues
  - Prepare update and maintenance schedule
