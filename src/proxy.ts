import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isValidSessionToken } from "@/lib/auth";
import { CONTRACTOR_SESSION_COOKIE, getSessionContractorId } from "@/lib/contractor-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/contractor")) {
    if (pathname === "/contractor/login") {
      return NextResponse.next();
    }
    const token = request.cookies.get(CONTRACTOR_SESSION_COOKIE)?.value;
    const contractorId = await getSessionContractorId(token);
    if (!contractorId) {
      return NextResponse.redirect(new URL("/contractor/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await isValidSessionToken(token);

  if (!valid) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/contractor/:path*"],
};
