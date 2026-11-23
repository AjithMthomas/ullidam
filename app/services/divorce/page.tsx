import type { Metadata } from "next";
import { TrackPage } from "@/components/sections/TrackPage";
import { getTrack } from "@/data/services";

const track = getTrack("divorce");

export const metadata: Metadata = {
  title: "Pre-Divorce, Divorce & Post-Divorce Counselling",
  description: track.summary,
};

export default function DivorceTrackPage() {
  return <TrackPage id="divorce" />;
}
