import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  const botToken =
    body.botToken ||
    req.headers.get("x-telegram-token") ||
    process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json(
      { error: "No Telegram bot token" },
      { status: 401 },
    );
  }

  const chatId = body.chatId || process.env.TELEGRAM_CHAT_ID;

  const TELEGRAM_API = `https://api.telegram.org/bot${botToken}`;

  try {
    if (action === "send") {
      const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: body.text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });
      const data = await res.json();
      if (!data.ok)
        return NextResponse.json({ error: data.description }, { status: 400 });
      return NextResponse.json({
        success: true,
        messageId: data.result?.message_id,
      });
    }

    if (action === "ping") {
      // Validate bot token by calling getMe
      const res = await fetch(`${TELEGRAM_API}/getMe`);
      const data = await res.json();
      if (!data.ok)
        return NextResponse.json(
          { error: "Invalid bot token" },
          { status: 400 },
        );
      return NextResponse.json({
        username: data.result?.username,
        name: data.result?.first_name,
      });
    }

    if (action === "getUpdates") {
      // Get recent updates to find chat_id
      const res = await fetch(`${TELEGRAM_API}/getUpdates?limit=10&offset=-10`);
      const data = await res.json();
      if (!data.ok)
        return NextResponse.json({ error: data.description }, { status: 400 });
      const chats = data.result
        ?.map((u: any) => u.message?.chat)
        .filter(Boolean)
        .filter(
          (c: any, i: number, arr: any[]) =>
            arr.findIndex((x) => x.id === c.id) === i,
        );
      return NextResponse.json({ chats: chats || [] });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
