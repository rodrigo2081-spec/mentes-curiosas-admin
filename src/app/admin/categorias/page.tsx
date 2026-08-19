import { db } from "@/db";
import { deleteCategory } from "./actions";
import { NewCategoryForm } from "./new-category-form";
import { DeleteButton } from "../productos/delete-button";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const allCategories = await db.query.categories.findMany({
    orderBy: (categories, { asc }) => [asc(categories.name)],
  });

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Categorías</h1>
        <p className="text-sm text-neutral-500">Organizá tus productos por categoría</p>
      </div>

      <NewCategoryForm />

      {allCategories.length === 0 ? (
        <p className="text-sm text-neutral-500">Todavía no creaste categorías.</p>
      ) : (
        <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {allCategories.map((cat) => (
            <li key={cat.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-neutral-900">{cat.name}</span>
              <DeleteButton id={cat.id} name={cat.name} action={deleteCategory} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
