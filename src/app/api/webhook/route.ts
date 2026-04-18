import { NextRequest, NextResponse } from "next/server";

type TelegramChat = {
  id: number;
};

type TelegramMessage = {
  text?: string;
  chat: TelegramChat;
};

type TelegramUpdate = {
  message?: TelegramMessage;
};

function isStartCommand(text: string): boolean {
  const first = text.trim().split(/\s+/)[0];
  if (!first.startsWith("/")) return false;
  const command = first.split("@")[0];
  return command === "/start";
}

export async function POST(request: NextRequest) {
  try {
    const update = (await request.json()) as TelegramUpdate;
    const message = update.message;
    const text = message?.text;
    const chatId = message?.chat.id;

    if (text !== undefined && chatId !== undefined && isStartCommand(text)) {
      const botToken =
        process.env.BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
      const webAppUrl =
        process.env.WEBAPP_URL ?? process.env.NEXT_PUBLIC_WEBAPP_URL;

      if (!botToken || !webAppUrl) {
        console.warn(
          "[webhook] /start отримано, але в .env немає BOT_TOKEN або WEBAPP_URL — відповідь боту не відправлена.",
        );
      } else {
        const tgRes = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "Вітаємо в Tiger Tea! 🐯 Натисніть кнопку нижче, щоб переглянути наше меню.",
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "Відкрити меню",
                      web_app: { url: webAppUrl },
                    },
                  ],
                ],
              },
            }),
          },
        );
        const tgJson: unknown = await tgRes.json().catch(() => null);
        if (
          !tgRes.ok ||
          !tgJson ||
          typeof tgJson !== "object" ||
          !("ok" in tgJson) ||
          tgJson.ok !== true
        ) {
          console.error("[webhook] sendMessage помилка:", tgJson ?? tgRes.status);
        } else {
          console.log("[webhook] sendMessage ok, chat_id:", chatId);
        }
      }
    }
  } catch (e) {
    console.error("[webhook] обробка update:", e);
    // Telegram має отримати 200 + { ok: true }
  }

  return NextResponse.json({ ok: true });
}
