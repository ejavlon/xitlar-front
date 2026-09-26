// Server Component — collections only (admin-created, tagged music sets)
import type { Metadata } from "next";
import { musicService } from "../../services/music.service";
import { CollectionsClient } from "./_components/collections-client";

export const metadata: Metadata = {
  title: "Music Collections | Xitlar.net",
  description: "Admin tomonidan tuzilgan temalashtirilgan musiqa to'plamlari"
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CollectionsPage() {
  const collections = await musicService.getCollections();

  return (
    <div className="space-y-6 select-none">
      <CollectionsClient initialCollections={collections} />
    </div>
  );
}
