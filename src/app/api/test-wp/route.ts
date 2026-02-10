import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { endpoint, auth } = await req.json();

        const url = `${endpoint.replace(/\/$/, "")}/wp-json/wp/v2/posts?per_page=1`;

        const res = await fetch(url, {
            headers: auth ? { Authorization: auth } : {},
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: `WP returned ${res.status}` },
                { status: res.status }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json(
            { error: "Failed to connect to WordPress" },
            { status: 500 }
        );
    }
}
