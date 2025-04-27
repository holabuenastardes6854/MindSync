import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: ['/', '/sign-in', '/sign-up', '/api/webhooks(.*)'],
});

export const config = {
  matcher: [
    // Routes that will be handled by middleware
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/',
  ],
}; 