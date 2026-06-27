import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const { phone, role } = req.body;
    if (!phone || !role) {
      res.status(400).json({ error: "Phone and role are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, phone))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.role !== role) {
      res.status(401).json({ error: "Unauthorized role mismatch" });
      return;
    }

    res.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      dailyRate: user.dailyRate,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
