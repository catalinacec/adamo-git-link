import { Request, Response, NextFunction } from "express";
import { getI18n } from "../../i18n/i18n";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY as string).replace(
  /\\n/g,
  "\n"
);

interface UserWithLanguage {
  id: string;
  language?: string;
}

export function i18nMiddleware(
  req: Request & { user?: UserWithLanguage },
  res: Response,
  next: NextFunction
) {
  let language: string | undefined;

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_PUBLIC_KEY, {
        algorithms: ["RS256"],
      }) as any;
      if (decoded?.language) language = decoded.language;
    } catch {}
  }

  const headerLang = req.headers["accept-language"]
    ?.split(",")[0]
    ?.toLowerCase();
  const resolvedLang = headerLang ? headerLang : language || "en";
  req.t = getI18n(resolvedLang);
  next();
}
