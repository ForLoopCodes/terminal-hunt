import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // Add security headers
    const response = NextResponse.next();

    // Security headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("X-XSS-Protection", "1; mode=block");

    // Content Security Policy (basic)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js needs unsafe-eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
    ].join("; ");

    response.headers.set("Content-Security-Policy", csp);

    return response;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public pages
        const publicPaths = [
          "/",
          "/about",
          "/auth/signin",
          "/auth/signup",
          "/app",
          "/debug",
        ];
        const isPublicPath = publicPaths.some((path) =>
          req.nextUrl.pathname.startsWith(path)
        );

        if (isPublicPath) return true;

        // Require authentication for other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
