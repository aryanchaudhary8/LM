import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isStudentRoute = createRouteMatcher(["/user/(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);
const isSelectRoleRoute = createRouteMatcher(["/select-role"]);
const isPublicRoute = createRouteMatcher([
  "/signin(.*)",
  "/signup(.*)",
  "/api/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req) || isSelectRoleRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  if (!userId && req.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  if (!userId) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Fetch user directly from Clerk to get fresh metadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userRole = (user.publicMetadata as { userType?: "student" | "teacher" })?.userType;

  // No role assigned yet
  if (!userRole) {
    return NextResponse.redirect(new URL("/select-role", req.url));
  }

  // Root route redirect
  if (req.nextUrl.pathname === "/") {
    if (userRole === "teacher") {
      return NextResponse.redirect(new URL("/teacher/courses", req.url));
    }
    return NextResponse.redirect(new URL("/user/courses", req.url));
  }

  // Teacher on student route
  if (isStudentRoute(req) && userRole !== "student") {
    return NextResponse.redirect(new URL("/teacher/courses", req.url));
  }

  // Student on teacher route
  if (isTeacherRoute(req) && userRole !== "teacher") {
    return NextResponse.redirect(new URL("/user/courses", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};