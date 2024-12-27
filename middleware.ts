import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const pathname = req.nextUrl.pathname;
      
      // Public routes that don't require authentication
      if (
        pathname === "/" ||
        pathname === "/auth/signin" ||
        pathname === "/auth/signup" ||
        pathname === "/auth/error" ||
        pathname.startsWith("/api/auth")
      ) {
        return true;
      }

      // Protected routes require authentication
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
