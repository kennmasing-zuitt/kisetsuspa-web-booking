"use client";

import { useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import {
    useBookAppointmentMutation,
    useGetAvailableSlotsQuery,
    useGetBookingOptionsQuery,
    useGetBookingWindowQuery,
} from "@/mods/booking/bookingApi";
import { seasonColour, seasonName } from "@/mods/booking/lib/seasons";
import { booked } from "@/store/bookingSlice";
import { signedOut } from "@/store/sessionSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { dateKeyParts, daysBetween, formatDuration, formatPeso, formatTime } from "@/lib/format";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

const ANY = "any";

/**
 * Pick a day (today … +7), a treatment and length, a therapist (or anyone) and a time, then
 * confirm. Slots come from the server, so days off, leave and other bookings are already out.
 */
export default function BookingWizard() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const firstName = useAppSelector((s) => s.session.firstName);
    const windowQuery = useGetBookingWindowQuery();
    const win = windowQuery.data;
    const tz = win?.timeZone;

    const [date, setDate] = useState<string | null>(null);
    const [choice, setChoice] = useState<{ serviceId: string; durationMin: number } | null>(null);
    const [therapist, setTherapist] = useState<string>(ANY);
    const [start, setStart] = useState<string | null>(null);
    const day = date ?? win?.today ?? null;

    const options = useGetBookingOptionsQuery(day ?? skipToken);
    const services = options.data?.bookingServices ?? [];
    const therapists = options.data?.bookingTherapists ?? [];
    const service = services.find((s) => s.id === choice?.serviceId);
    const price = service?.options.find((o) => o.durationMin === choice?.durationMin)?.price;

    const slotsQuery = useGetAvailableSlotsQuery(
        day && choice
            ? { date: day, serviceId: choice.serviceId, durationMin: choice.durationMin }
            : skipToken,
    );
    const slots = useMemo(() => slotsQuery.data ?? [], [slotsQuery.data]);
    const freeTherapists = useMemo(() => new Set(slots.flatMap((s) => s.therapistIds)), [slots]);
    const shown =
        therapist === ANY ? slots : slots.filter((s) => s.therapistIds.includes(therapist));
    const therapistName = therapists.find((t) => t.id === therapist)?.name;

    const [book, bookState] = useBookAppointmentMutation();
    const [error, setError] = useState<string | null>(null);

    function pickDay(key: string) {
        setDate(key);
        setStart(null);
        setError(null);
    }
    function pickService(serviceId: string, durationMin: number) {
        setChoice({ serviceId, durationMin });
        setStart(null);
        setError(null);
    }
    function pickTherapist(id: string) {
        setTherapist(id);
        setStart(null);
    }

    async function confirm() {
        if (!choice || !start) return;
        setError(null);
        try {
            const confirmation = await book({
                serviceId: choice.serviceId,
                durationMin: choice.durationMin,
                start,
                therapistId: therapist === ANY ? null : therapist,
            }).unwrap();
            dispatch(booked(confirmation));
            router.push("/done/");
        } catch (err) {
            const e = err as GraphqlError;
            setError(e.message);
            if (e.code === "SLOT_TAKEN") setStart(null);
        }
    }

    if (windowQuery.isLoading) return <div className="card muted center">Loading…</div>;
    if (windowQuery.error || !win)
        return (
            <p className="alert">
                {(windowQuery.error as GraphqlError)?.message ?? "Couldn't load."}
            </p>
        );

    const days = daysBetween(win.today, win.lastDay);

    return (
        <>
            <div className="topline">
                <span>{firstName ? `Hi ${firstName}` : "Signed in"}</span>
                <button
                    type="button"
                    className="btn btn--link"
                    onClick={() => dispatch(signedOut())}
                >
                    Sign out
                </button>
            </div>

            <section className="card">
                <h1>Book a treatment</h1>
                <p className="lead">
                    Up to {days.length - 1} days ahead, at least 2 hours from now.
                </p>

                <h2>Day</h2>
                <div className="choices choices--days" role="group" aria-label="Day">
                    {days.map((key) => {
                        const p = dateKeyParts(key);
                        return (
                            <button
                                key={key}
                                type="button"
                                className="choice choice--day"
                                aria-pressed={key === day}
                                aria-label={p.long}
                                onClick={() => pickDay(key)}
                            >
                                {key === win.today ? "Today" : p.weekday}
                                <strong>{p.day}</strong>
                                {p.month}
                            </button>
                        );
                    })}
                </div>

                <h2>Treatment</h2>
                {options.isFetching && !services.length && <p className="muted">Loading…</p>}
                <div className="choices">
                    {services.map((s) => (
                        <div key={s.id} className="service">
                            <div className="service__name">
                                <i style={{ background: seasonColour(s.name) }} aria-hidden />
                                {s.name}
                                {seasonName(s.name) && (
                                    <span className="hint">· {seasonName(s.name)}</span>
                                )}
                            </div>
                            <div
                                className="choices choices--chips"
                                role="group"
                                aria-label={`${s.name} length`}
                            >
                                {s.options.map((o) => (
                                    <button
                                        key={o.durationMin}
                                        type="button"
                                        className="choice choice--chip"
                                        aria-pressed={
                                            choice?.serviceId === s.id &&
                                            choice.durationMin === o.durationMin
                                        }
                                        onClick={() => pickService(s.id, o.durationMin)}
                                    >
                                        {formatDuration(o.durationMin)} · {formatPeso(o.price)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {choice && (
                    <>
                        <h2>Therapist</h2>
                        <div className="choices choices--chips" role="group" aria-label="Therapist">
                            <button
                                type="button"
                                className="choice choice--chip"
                                aria-pressed={therapist === ANY}
                                onClick={() => pickTherapist(ANY)}
                            >
                                Anyone available
                            </button>
                            {therapists
                                .filter((t) => freeTherapists.has(t.id))
                                .map((t) => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        className="choice choice--chip"
                                        aria-pressed={therapist === t.id}
                                        onClick={() => pickTherapist(t.id)}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                        </div>

                        <h2>Time</h2>
                        {slotsQuery.isFetching && !slots.length ? (
                            <p className="muted">Finding free times…</p>
                        ) : shown.length === 0 ? (
                            <p className="empty">
                                No free times that day
                                {therapistName ? ` with ${therapistName}` : ""}. Try another day
                                {therapistName ? " or anyone available" : ""}.
                            </p>
                        ) : (
                            <div
                                className="choices choices--times"
                                role="group"
                                aria-label="Start time"
                            >
                                {shown.map((s) => (
                                    <button
                                        key={s.start}
                                        type="button"
                                        className="choice choice--time"
                                        aria-pressed={s.start === start}
                                        onClick={() => {
                                            setStart(s.start);
                                            setError(null);
                                        }}
                                    >
                                        {formatTime(s.start, tz)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>

            {service && choice && start && day && (
                <section className="card stack" aria-live="polite">
                    <h2 style={{ marginTop: 0 }}>Your booking</h2>
                    <dl className="summary">
                        <div>
                            <dt>When</dt>
                            <dd>
                                {dateKeyParts(day).long}, {formatTime(start, tz)}
                            </dd>
                        </div>
                        <div>
                            <dt>Treatment</dt>
                            <dd>
                                {service.name} · {formatDuration(choice.durationMin)}
                            </dd>
                        </div>
                        <div>
                            <dt>Therapist</dt>
                            <dd>{therapistName ?? "Anyone available"}</dd>
                        </div>
                        {price != null && (
                            <div>
                                <dt>Price</dt>
                                <dd>{formatPeso(price)}</dd>
                            </div>
                        )}
                    </dl>
                    <p className="hint">
                        Pay at the spa. Have a promo code? Show it at the front desk.
                    </p>
                    {error && <p className="alert">{error}</p>}
                    <button
                        type="button"
                        className="btn"
                        onClick={confirm}
                        disabled={bookState.isLoading}
                    >
                        {bookState.isLoading ? "Booking…" : "Confirm booking"}
                    </button>
                </section>
            )}
            {error && !start && (
                <p className="alert" style={{ marginTop: 14 }}>
                    {error}
                </p>
            )}
        </>
    );
}
