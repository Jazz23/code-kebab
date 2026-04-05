import { redirect } from "next/navigation";

export default async function NotificationRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/messages/system/${id}`);
}
