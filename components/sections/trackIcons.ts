import { Compass, HeartHandshake, Stethoscope, UserRound, type LucideIcon } from "lucide-react";
import type { TrackId } from "@/data/services";

export const TRACK_ICONS: Record<TrackId, LucideIcon> = {
  individual: UserRound,
  psychiatry: Stethoscope,
  couples: HeartHandshake,
  divorce: Compass,
};
