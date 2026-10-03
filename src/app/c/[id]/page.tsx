import { notFound } from "next/navigation";
import { Thread } from "@/components/Thread";
import { getEntry } from "@/lib/store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChirpPage({ params }: PageProps) {
  const { id } = await params;
  const entry = await getEntry(id);
  if (!entry) notFound();
  return <Thread key={entry.id} initial={entry} />;
}
