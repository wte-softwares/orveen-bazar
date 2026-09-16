import { redirect } from "next/navigation";

export default async function AdminOrgIndexPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;
  redirect(`/admin/${org}/items`);
}
