import { ScreenPlaceholder } from "@/components/layout/ScreenPlaceholder";

// Title, slug, description, category, image, descriptive variants, publish
// status — the same editor is reused for create by routing here with
// id === "new" (Phase 2 decides the exact convention). Preview before
// publish; archive with confirmation instead of hard delete.
export default async function AdminItemEditorPage({
  params,
}: {
  params: Promise<{ org: string; id: string }>;
}) {
  const { org, id } = await params;
  return (
    <ScreenPlaceholder
      title={`Item editor — ${org}/${id}`}
      route="/admin/[org]/items/[id]"
      description="Same editor for create and edit; preview before publish; archive with confirmation."
    />
  );
}
