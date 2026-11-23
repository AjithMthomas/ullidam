import type { Metadata } from "next";
import { TrackPage } from "@/components/sections/TrackPage";
import { getTrack } from "@/data/services";

const track = getTrack("individual");

export const metadata: Metadata = {
  title: "Individual Counselling and Therapy (18+)",
  description: track.summary,
};

export default function IndividualTrackPage() {
  return <TrackPage id="individual" />;
}
