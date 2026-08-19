import { customerEmailHtml, adminEmailHtml, type SaleNotificationData } from "../src/lib/email";
import { writeFileSync } from "node:fs";

const sampleSale: SaleNotificationData = {
  id: "b3a1c2d4-preview",
  customerName: "Marisol Gómez",
  customerPhone: "+54 9 11 5555-1234",
  customerEmail: "marisol.gomez@example.com",
  customerAddress: "Av. Siempre Viva 742, Buenos Aires",
  paymentMethod: "transferencia_flor",
  totalAmount: 24700,
  note: "Envolver para regalo",
  items: [
    { productName: "Rompecabezas de madera 100 piezas", quantity: 1, unitPrice: 14250 },
    { productName: "Set de bloques encastrables x50", quantity: 1, unitPrice: 10450 },
  ],
};

const combined = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Vista previa de emails - Mentes Curiosas</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background:#f5f5f4; margin:0; padding:32px 16px; }
  .wrap { max-width: 700px; margin: 0 auto; }
  h1 { font-size: 20px; color:#171717; }
  .note { color:#737373; font-size:13px; margin-bottom:32px; }
  .card { background:#fff; border:1px solid #e5e5e5; border-radius:10px; padding:28px; margin-bottom:32px; }
  .card-label { display:inline-block; font-size:11px; font-weight:bold; text-transform:uppercase; letter-spacing:.05em; color:#fff; background:#171717; padding:4px 10px; border-radius:999px; margin-bottom:16px; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Vista previa · emails de venta (Mentes Curiosas)</h1>
    <p class="note">Renderizado a partir del template real (src/lib/email.ts) con datos de ejemplo. No se envió ningún correo real.</p>

    <div class="card">
      <span class="card-label">Al cliente</span>
      ${customerEmailHtml(sampleSale)}
    </div>

    <div class="card">
      <span class="card-label">A administradores / vendedores</span>
      ${adminEmailHtml(sampleSale)}
    </div>
  </div>
</body>
</html>`;

writeFileSync("email-preview.html", combined);
console.log("OK: email-preview.html generado");
