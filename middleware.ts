import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  // if (!token) {
  //   if (request.nextUrl.pathname === "/login") {
  //     return NextResponse.next()
  //   }

  //   return NextResponse.redirect(new URL("/login", request.url))
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api/auth|api/editor|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
