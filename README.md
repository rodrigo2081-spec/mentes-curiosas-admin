# Mentes Curiosas · Administración

Panel de administración de stock y productos para Mentes Curiosas. Cada producto cargado acá (con fotos, videos, precio, descripción y stock) queda disponible para la futura tienda online.

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Drizzle ORM](https://orm.drizzle.team) + PostgreSQL (hosteado en [Railway](https://railway.com))
- [Auth.js / NextAuth](https://authjs.dev) (login simple de administrador)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) para las fotos y videos de los productos
- Deploy en [Vercel](https://vercel.com)

## Desarrollo local

1. Copiá `.env.example` a `.env` y completá las variables (`DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`).
2. Instalá dependencias: `npm install`
3. Aplicá el schema a la base de datos: `npm run db:push`
4. Creá el usuario administrador: `ADMIN_EMAIL=vos@ejemplo.com ADMIN_PASSWORD=algo-seguro npm run seed:admin`
5. Corré el servidor: `npm run dev`

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` / `npm run start` — build y arranque de producción
- `npm run db:push` — sincroniza el schema de Drizzle con la base de datos
- `npm run db:studio` — explorador visual de la base de datos
- `npm run seed:admin` — crea o actualiza un usuario administrador
