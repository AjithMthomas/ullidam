import type { Metadata } from "next";
import { TrackPage } from "@/components/sections/TrackPage";
import { getTrack } from "@/data/services";

const track = getTrack("couples");

export const metadata: Metadata = {
  title: "Premarital, Marital & Relationship Counselling",
  description: track.summary,
};

export default function CouplesTrackPage() {
  return <TrackPage id="couples" />;
}
