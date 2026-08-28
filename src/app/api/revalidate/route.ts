import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation endpoint for the "no redeploy" content flow.
 *
 * Point a GitHub webhook (on `push` to the docs repo) at this route, or call it
 * manually. When `REVALIDATE_SECRET` is set, requests must authenticate with
 * `Authorization: Bearer <secret>` or a JSON body `{ "token": "<secret>" }`.
 *
 * Example:
 *   curl -X POST https://docs.openremap.com/api/revalidate \
 *     -H "Authorization: Bearer $REVALIDATE_SECRET"
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    let token = "";
    try {
      const body = (await req.json()) as { token?: string };
      token = body.token ?? "";
    } catch {
      token = "";
    }
    if (auth !== `Bearer ${secret}` && token !== secret) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Revalidate the whole route tree (layout + all pages). Content is fetched
  // per-page with its own revalidate, so this simply marks cached pages stale.
  revalidatePath("/", "layout");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
