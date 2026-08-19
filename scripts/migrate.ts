import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { admins } from "../src/db/schema";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL no está configurada.");
    process.exit(1);
  }

  const client = postgres(connectionString, {
    ssl: connectionString.includes("localhost") ? false : "require",
    max: 1,
  });
  const db = drizzle(client, { schema });

  console.log("Aplicando migraciones...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migraciones aplicadas correctamente.");

  // Por cada admin definido por variables de entorno (ADMIN_EMAIL/ADMIN_PASSWORD,
  // ADMIN2_EMAIL/ADMIN2_PASSWORD, ADMIN3_..., etc.) nos aseguramos de que exista
  // ese usuario. Es idempotente: corre en cada build sin romper nada si el
  // usuario ya existe (no pisa la contraseña de un admin ya creado).
  const suffixes = ["", "2", "3", "4", "5"];
  for (const suffix of suffixes) {
    const email = process.env[`ADMIN${suffix}_EMAIL`];
    const password = process.env[`ADMIN${suffix}_PASSWORD`];
    if (!email || !password) continue;

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);
    const name = process.env[`ADMIN${suffix}_NAME`] || "Admin";

    const existing = await db.query.admins.findFirst({
      where: eq(admins.email, normalizedEmail),
    });

    if (existing) {
      console.log(`Usuario admin ya existe: ${normalizedEmail} (sin cambios de contraseña automáticos)`);
    } else {
      await db.insert(admins).values({ email: normalizedEmail, passwordHash, name });
      console.log(`Usuario admin creado: ${normalizedEmail}`);
    }
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
