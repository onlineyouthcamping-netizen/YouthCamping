import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthenticatedRequest extends Request {
  user?: typeof usersTable.$inferSelect;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const userId = parseInt(token, 10);
    if (isNaN(userId)) {
      res.status(401).json({ error: "Invalid token format" });
      return;
    }

    let [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user && userId === 1 && process.env.NODE_ENV !== "production") {
      // Fallback for local testing (Bearer 1): map to the first admin user in the database
      const [fallbackAdmin] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.role, "admin"))
        .limit(1);
      if (fallbackAdmin) {
        user = fallbackAdmin;
      }
    }

    if (!user) {
      res.status(401).json({ error: "User not found for this token" });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

