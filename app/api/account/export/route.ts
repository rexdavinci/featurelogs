import { getSessionUser } from "@/utils/session";
import { getAccountService } from "@/lib/account/server";

export const runtime = "nodejs";
export async function GET() {
  const headers = {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    Vary: "Cookie",
  };
  const user = await getSessionUser();
  if (!user)
    return Response.json(
      { error: "Authentication required." },
      { status: 401, headers },
    );
  try {
    const data = await (await getAccountService()).exportAccount(user.uid);
    return new Response(JSON.stringify(data, null, 2), {
      headers: {
        ...headers,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="featurelogs-data-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    console.error("Account export failed.");
    return Response.json(
      { error: "Unable to export your data. Please try again." },
      { status: 503, headers },
    );
  }
}
