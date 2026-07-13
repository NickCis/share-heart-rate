import { next } from "@vercel/edge";

export const config = {
  matcher: ["/((?!api|assets|favicon.ico|.*\\..*).*)"],
};

type Locale = "en" | "es";

function resolveLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return "en";
  }

  const preferences = acceptLanguage.split(",").map((part) => {
    const [langRaw, qRaw] = part.trim().split(";");
    const lang = langRaw.trim().toLowerCase();
    const q =
      qRaw && qRaw.trim().startsWith("q=")
        ? Number.parseFloat(qRaw.trim().slice(2))
        : 1;
    return { lang, q: Number.isFinite(q) ? q : 0 };
  });

  preferences.sort((a, b) => b.q - a.q);

  for (const { lang } of preferences) {
    if (lang.startsWith("es")) {
      return "es";
    }
    if (lang.startsWith("en")) {
      return "en";
    }
  }

  return "en";
}

function getCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match?.[1];
}

export default function middleware(request: Request) {
  const response = next();
  const existing = getCookie(request, "locale");

  if (existing === "en" || existing === "es") {
    response.headers.set("Content-Language", existing);
    return response;
  }

  const locale = resolveLocale(request.headers.get("accept-language"));
  response.headers.set(
    "Set-Cookie",
    `locale=${locale}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
  );
  response.headers.set("Content-Language", locale);
  return response;
}
