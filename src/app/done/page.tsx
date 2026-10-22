import type { Metadata } from "next";
import Confirmation from "@/mods/booking/components/Confirmation";

export const metadata: Metadata = { title: "You're booked · Kisetsu Spa" };

export default function DonePage() {
    return <Confirmation />;
}
