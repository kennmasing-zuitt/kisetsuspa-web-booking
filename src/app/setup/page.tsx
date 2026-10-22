import type { Metadata } from "next";
import SetupFlow from "@/mods/session/components/SetupFlow";
import { GuestOnly } from "@/mods/session/components/RequireSession";

export const metadata: Metadata = { title: "Set up online booking · Kisetsu Spa" };

export default function SetupPage() {
    return (
        <GuestOnly>
            <SetupFlow />
        </GuestOnly>
    );
}
