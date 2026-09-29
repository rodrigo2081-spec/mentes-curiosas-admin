// Doodles sueltos (corazones, estrellas, spirales, flechas punteadas) que
// acompañan el diseño de marca: se usan sueltos sobre el fondo crema, nunca
// encerrados en una caja, tal como en el Instagram real de la marca.

type DoodleProps = {
  className?: string;
  color?: string;
};

export function DoodleHeart({ className, color = "#FF6B6B" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 40 36"
      fill={color}
      className={className}
      aria-hidden="true"
    >
      <path d="M20 33C20 33 3 22.5 3 11.5C3 5.5 7.8 2 12.5 2C16 2 18.7 4 20 6.5C21.3 4 24 2 27.5 2C32.2 2 37 5.5 37 11.5C37 22.5 20 33 20 33Z" />
    </svg>
  );
}

export function DoodleHeartOutline({ className, color = "#5B5FC1" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 40 36"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20 33C20 33 3 22.5 3 11.5C3 5.5 7.8 2 12.5 2C16 2 18.7 4 20 6.5C21.3 4 24 2 27.5 2C32.2 2 37 5.5 37 11.5C37 22.5 20 33 20 33Z" />
    </svg>
  );
}

export function DoodleStar({ className, color = "#FDBF55" }: DoodleProps) {
  return (
    <svg viewBox="0 0 28 28" fill={color} className={className} aria-hidden="true">
      <path d="M14 2L16.5 10.5L25 13L16.5 15.5L14 24L11.5 15.5L3 13L11.5 10.5L14 2Z" />
    </svg>
  );
}

export function DoodleStarOutline({ className, color = "#1DE285" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M14 2L16.5 10.5L25 13L16.5 15.5L14 24L11.5 15.5L3 13L11.5 10.5L14 2Z" />
    </svg>
  );
}

export function DoodleSparkle({ className, color = "#FDBF55" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
    </svg>
  );
}

export function DoodleSpiral({ className, color = "#5B5FC1" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M30 4C24 12 24 20 30 28C20 24 12 28 8 36C16 42 22 40 30 44" />
    </svg>
  );
}

export function DoodleDashedArrow({ className, color = "#009C91" }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 70 34"
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4C20 4 16 26 32 26C48 26 44 4 60 4" strokeDasharray="1 10" />
      <path d="M52 0L61 4L54 12" strokeLinejoin="round" />
    </svg>
  );
}
