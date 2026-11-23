import type { Metadata } from "next";
import { TrackPage } from "@/components/sections/TrackPage";
import { getTrack } from "@/data/services";

const track = getTrack("psychiatry");

export const metadata: Metadata = {
  title: "Psychiatric Services",
  description: track.summary,
};

export default function PsychiatryTrackPage() {
  return <TrackPage id="psychiatry" />;
}
