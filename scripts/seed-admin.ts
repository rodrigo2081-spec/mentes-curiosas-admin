import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { admins } from "../src/db/schema";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error(
      "Definí ADMIN_EMAIL y ADMIN_PASSWORD (en .env o como variables de entorno) antes de correr este script."
    );
    process.exit(1);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await db.query.admins.findFirst({
    where: eq(admins.email, normalizedEmail),
  });

  if (existing) {
    await db.update(admins).set({ passwordHash, name }).where(eq(admins.id, existing.id));
    console.log(`Contraseña actualizada para ${normalizedEmail}`);
  } else {
    await db.insert(admins).values({ email: normalizedEmail, passwordHash, name });
    console.log(`Usuario admin creado: ${normalizedEmail}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
