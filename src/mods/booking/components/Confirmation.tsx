"use client";

import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useGetBookingWindowQuery } from "@/mods/booking/bookingApi";
import { formatDay, formatDuration, formatPeso, formatTime } from "@/lib/format";

/** "You're booked": the booking just made (kept in the store until the tab closes). */
export default function Confirmation() {
    const c = useAppSelector((s) => s.booking.confirmation);
    const { data: win } = useGetBookingWindowQuery();
    const tz = win?.timeZone;

    if (!c) {
        return (
            <div className="card stack center">
                <p className="muted">No booking to show.</p>
                <Link className="btn" href="/new/">
                    Book a treatment
                </Link>
            </div>
        );
    }

    return (
        <div className="card stack">
            <div className="center">
                <div className="done-mark" aria-hidden>
                    ✓
                </div>
                <h1>You&apos;re booked</h1>
                <p className="lead">See you soon. We&apos;ve saved it under your mobile number.</p>
            </div>
            <dl className="summary">
                <div>
                    <dt>When</dt>
                    <dd>
                        {formatDay(c.start, tz)}, {formatTime(c.start, tz)}
                    </dd>
                </div>
                <div>
                    <dt>Treatment</dt>
                    <dd>
                        {c.serviceName} · {formatDuration(c.durationMin)}
                    </dd>
                </div>
                <div>
                    <dt>Therapist</dt>
                    <dd>{c.therapistName}</dd>
                </div>
                <div>
                    <dt>Price</dt>
                    <dd>{formatPeso(c.price)}</dd>
                </div>
            </dl>
            <p className="note">
                Need to change or cancel?{" "}
                {win?.phone ? (
                    <>
                        Call us at <a href={`tel:${win.phone.replace(/\s/g, "")}`}>{win.phone}</a>.
                    </>
                ) : (
                    "Please call the spa."
                )}{" "}
                If your therapist becomes unavailable, we&apos;ll text you.
            </p>
            <Link className="btn btn--ghost" href="/new/">
                Book another
            </Link>
        </div>
    );
}
