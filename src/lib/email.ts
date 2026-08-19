import { Resend } from "resend";
import { formatPrice } from "@/lib/utils";
import { paymentMethodLabel } from "@/lib/pricing";

// Módulo compartido para el envío de notificaciones por email al confirmarse
// una venta. Pensado para ser llamado tanto desde el panel de administración
// (carga manual de una venta) como, en el futuro, desde el checkout de la
// tienda online: ambos flujos arman el mismo tipo de "sale" + "items" y
// llaman a `sendSaleNotifications`.
//
// Notas importantes:
// - El envío de emails NUNCA debe hacer fallar la venta. Todas las llamadas
//   están envueltas en try/catch y solo loguean el error en consola.
// - Mientras no se verifique un dominio propio en Resend, el remitente usa
//   el dominio de pruebas `onboarding@resend.dev`, que SOLO puede enviar al
//   email con el que se creó la cuenta de Resend. Los emails a clientes
//   reales no se van a entregar hasta verificar un dominio propio (ver
//   README / .env.example).

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_ADDRESS = process.env.SALE_NOTIFICATION_FROM || "Mentes Curiosas <onboarding@resend.dev>";

// Direcciones que reciben notificación de cada venta nueva (admins/vendedores).
// Configurable por env var, separadas por coma. Si no se configura, cae a un
// valor por defecto razonable.
const ADMIN_RECIPIENTS = (process.env.SALE_NOTIFICATION_EMAILS || "rodrigo2081@gmail.com")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

export type SaleNotificationItem = {
  productName: string;
  quantity: number;
  unitPrice: string | number;
};

export type SaleNotificationData = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  paymentMethod: string;
  totalAmount: string | number;
  note?: string | null;
  date?: Date | string;
  items: SaleNotificationItem[];
};

function itemsHtml(items: SaleNotificationItem[]): string {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;">${escapeHtml(item.productName)}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatPrice(item.unitPrice)}</td>
        </tr>`
    )
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function customerEmailHtml(sale: SaleNotificationData): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#171717;max-width:520px;margin:0 auto;">
      <h2 style="margin-bottom:4px;">¡Gracias por tu compra, ${escapeHtml(sale.customerName)}!</h2>
      <p style="color:#525252;margin-top:0;">Te confirmamos los detalles de tu pedido en Mentes Curiosas.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #171717;">Producto</th>
            <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #171717;">Cant.</th>
            <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #171717;">Precio</th>
          </tr>
        </thead>
        <tbody>${itemsHtml(sale.items)}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;font-weight:bold;">Total: ${formatPrice(sale.totalAmount)}</p>
      <p style="color:#525252;">Método de pago: ${escapeHtml(paymentMethodLabel(sale.paymentMethod))}</p>
      ${sale.customerAddress ? `<p style="color:#525252;">Dirección de entrega: ${escapeHtml(sale.customerAddress)}</p>` : ""}
      <p style="color:#a3a3a3;font-size:12px;margin-top:24px;">Cualquier consulta, respondé este email.</p>
    </div>
  `;
}

export function adminEmailHtml(sale: SaleNotificationData): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#171717;max-width:520px;margin:0 auto;">
      <h2 style="margin-bottom:4px;">Nueva venta registrada</h2>
      <p style="color:#525252;margin-top:0;">
        Cliente: <strong>${escapeHtml(sale.customerName)}</strong> · Tel: ${escapeHtml(sale.customerPhone)}
        ${sale.customerEmail ? ` · ${escapeHtml(sale.customerEmail)}` : ""}
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #171717;">Producto</th>
            <th style="text-align:center;padding:6px 8px;border-bottom:2px solid #171717;">Cant.</th>
            <th style="text-align:right;padding:6px 8px;border-bottom:2px solid #171717;">Precio</th>
          </tr>
        </thead>
        <tbody>${itemsHtml(sale.items)}</tbody>
      </table>
      <p style="text-align:right;font-size:18px;font-weight:bold;">Total: ${formatPrice(sale.totalAmount)}</p>
      <p style="color:#525252;">Método de pago: ${escapeHtml(paymentMethodLabel(sale.paymentMethod))}</p>
      ${sale.customerAddress ? `<p style="color:#525252;">Dirección de entrega: ${escapeHtml(sale.customerAddress)}</p>` : ""}
      ${sale.note ? `<p style="color:#525252;">Nota: ${escapeHtml(sale.note)}</p>` : ""}
      <p style="color:#a3a3a3;font-size:12px;margin-top:24px;">Venta #${sale.id}</p>
    </div>
  `;
}

// Envía la confirmación al cliente (si dejó email) y la notificación a
// los administradores/vendedores. Nunca lanza: cualquier error de envío
// queda solo logueado, para no bloquear ni afectar la venta ya confirmada.
export async function sendSaleNotifications(sale: SaleNotificationData): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY no configurada: se omite el envío de notificaciones.");
    return;
  }

  const tasks: Promise<unknown>[] = [];

  if (sale.customerEmail) {
    tasks.push(
      resend.emails
        .send({
          from: FROM_ADDRESS,
          to: sale.customerEmail,
          subject: "Confirmación de tu compra - Mentes Curiosas",
          html: customerEmailHtml(sale),
        })
        .catch((error) => {
          console.error("[email] Error enviando confirmación al cliente:", error);
        })
    );
  }

  if (ADMIN_RECIPIENTS.length > 0) {
    tasks.push(
      resend.emails
        .send({
          from: FROM_ADDRESS,
          to: ADMIN_RECIPIENTS,
          subject: `Nueva venta: ${sale.customerName} - ${formatPrice(sale.totalAmount)}`,
          html: adminEmailHtml(sale),
        })
        .catch((error) => {
          console.error("[email] Error enviando notificación a administradores:", error);
        })
    );
  }

  await Promise.allSettled(tasks);
}
