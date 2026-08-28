import type { Metadata } from "next";
import DocShell from "@/components/DocShell";
import { getDoc } from "@/lib/content";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const doc = await getDoc([]);
  return {
    title: doc?.entry.title ?? "Documentation",
    description: doc?.entry.description ?? undefined,
  };
}

export default function HomePage() {
  return <DocShell slug={[]} />;
}
