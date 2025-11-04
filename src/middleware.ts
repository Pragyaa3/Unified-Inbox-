import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Define which routes to protect
const PROTECTED_PATHS = ["/api/contacts", "/api/messages", "/api/analytics"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the route is protected
  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // You can attach user info to headers for downstream usage
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user", JSON.stringify(decoded));

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"], // Apply to all API routes
};
