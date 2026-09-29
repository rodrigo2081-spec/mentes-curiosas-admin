import { Caveat, Fredoka, Nunito, Playpen_Sans } from "next/font/google";

// Fuentes de marca para la tienda online (ver brief de estilo). Se exponen
// como variables CSS con nombres propios para no pisar los tokens de
// Tailwind (--font-heading / --font-body / --font-accent, definidos en
// globals.css), y se aplican solo dentro del layout de la tienda: el admin
// sigue con la tipografía por defecto.

export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

export const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const playpenSans = Playpen_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-playpen",
  display: "swap",
});

export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const storeFontVariables = `${fredoka.variable} ${nunito.variable} ${playpenSans.variable} ${caveat.variable}`;
