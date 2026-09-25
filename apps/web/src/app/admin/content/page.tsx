import { AdminContentView } from "@/features/content";
import { ContentKind, ContentStatus } from "@/lib/graphql/generated";

export const metadata = {
  title: "Quản lý nội dung học | Englow3",
};

/** Only a value the enum knows; anything else in the URL is ignored. */
function oneOf<T extends string>(
  values: Record<string, T>,
  raw: string | undefined,
): T | undefined {
  return Object.values(values).find((value) => value === raw);
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; status?: string }>;
}) {
  const { kind, status } = await searchParams;
  return (
    <AdminContentView
      initialKind={oneOf(ContentKind, kind)}
      initialStatus={oneOf(ContentStatus, status) ?? null}
    />
  );
}
