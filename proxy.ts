import { env } from "@/.env";
import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!request.cookies.get("featurelogs_session")) {
    response.cookies.set("featurelogs_session", randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: env.production,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}

export const config = {
  matcher: ["/:path*"],
};
