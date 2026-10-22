import type { Metadata } from "next";
import BookingWizard from "@/mods/booking/components/BookingWizard";
import RequireSession from "@/mods/session/components/RequireSession";

export const metadata: Metadata = { title: "Book a treatment · Kisetsu Spa" };

export default function NewBookingPage() {
    return (
        <RequireSession>
            <BookingWizard />
        </RequireSession>
    );
}
