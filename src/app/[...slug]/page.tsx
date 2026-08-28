import type { Metadata } from "next";
import DocShell from "@/components/DocShell";
import { getDoc, getEntries } from "@/lib/content";
import { siteConfig } from "@/lib/config";

export const revalidate = 300;

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const entries = await getEntries();
  return entries.filter((e) => e.slug.length > 0).map((e) => ({ slug: e.slug }));
}

interface DocPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc(slug);
  return {
    title: doc?.entry.title ?? "Documentation",
    description: doc?.entry.description ?? undefined,
    alternates: {
      canonical: doc ? `${siteConfig.domain}${doc.entry.route}` : undefined,
    },
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  return <DocShell slug={slug} />;
}
