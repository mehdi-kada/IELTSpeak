import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/login", 
  "/api/webhooks",
  "/results",
  "/privacy",
  "/terms",
] as const;

/**
 * Middleware to handle session management and authentication
 * Provides proper error handling and logging
 */
export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip auth check for public routes
  if (isPublicRoute(pathname)) {
    logger.debug("Skipping auth check for public route", { pathname });
    return NextResponse.next();
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      logger.error("Authentication error in middleware", authError, { pathname });
      // Continue without redirecting on auth errors to avoid loops
      return supabaseResponse;
    }

    // Redirect unauthenticated users to login
    if (!user && requiresAuth(pathname)) {
      logger.info("Redirecting unauthenticated user to login", { 
        pathname, 
        userAgent: request.headers.get("user-agent") 
      });
      
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    logger.debug("Session check completed", { 
      pathname, 
      authenticated: !!user,
      userId: user?.id 
    });

    return supabaseResponse;
  } catch (error) {
    logger.error("Unexpected error in middleware", error, { pathname });
    // Don't block the request on unexpected errors
    return NextResponse.next({ request });
  }
}

/**
 * Check if a route is public and doesn't require authentication
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Check if a route requires authentication
 */
function requiresAuth(pathname: string): boolean {
  // Add specific routes that require auth
  const protectedRoutes = ["/dashboard", "/levels", "/profile", "/subscribe"];
  return protectedRoutes.some(route => pathname.startsWith(route));
}
