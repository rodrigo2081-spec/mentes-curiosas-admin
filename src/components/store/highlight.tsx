// "Resaltador": una forma pastel apenas rotada detrás del texto, como si
// estuviera marcado con marcador fluorescente. Usado en títulos clave
// (Categorías, Novedades, etc.) siguiendo el brief de estilo.
export function Highlight({
  children,
  bg = "bg-yellow-pastel",
  rotate = "-rotate-1",
}: {
  children: React.ReactNode;
  bg?: string;
  rotate?: string;
}) {
  return (
    <span className="relative inline-block">
      <span
        className={`absolute inset-x-[-6px] top-[18%] bottom-[10%] ${rotate} rounded-[10px] ${bg}`}
        aria-hidden="true"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
