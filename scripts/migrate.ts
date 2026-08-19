import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
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
  const db = drizzle(client);

  console.log("Aplicando migraciones...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migraciones aplicadas correctamente.");

  // Si están definidas ADMIN_EMAIL y ADMIN_PASSWORD, aseguramos que exista
  // (o actualizamos) ese usuario admin. Es idempotente: corre en cada build
  // sin romper nada si el usuario ya existe.
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);
    const name = process.env.ADMIN_NAME || "Admin";

    const existing = await db.query.admins.findFirst({
      where: eq(admins.email, normalizedEmail),
    });

    if (existing) {
      console.log(`Usuario admin ya existe: ${normalizedEmail} (sin cambios de contraseña automáticos)`);
    } else {
      await db.insert(admins).values({ email: normalizedEmail, passwordHash, name });
      console.log(`Usuario admin creado: ${normalizedEmail}`);
    }
  } else {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD no definidas: se omite la creación del admin.");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
