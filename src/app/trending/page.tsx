// Server Component — static page header + hero card
// TrendingClient (tab, player, filteredTracks) → client island
import type { Metadata } from "next";
import { musicService } from "../../services/music.service";
import { TrendingClient } from "./_components/trending-client";

export const metadata: Metadata = {
  title: "Trending Hits — Xitlar",
  description: "The top most popular and trending songs on Xitlar, updated in real-time.",
};

export default async function TrendingPage() {
  // Server-side data fetch — initial render bilan birgalikda HTML ga kiradi
  const tracks = await musicService.getPopularTracks().catch(() => []);

  return (
    // TrendingClient ga tracks ni prop sifatida uzatamiz
    // Tab switching, playAll, filteredTracks → client
    <TrendingClient initialTracks={tracks} />
  );
}
