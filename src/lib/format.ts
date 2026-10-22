/** Times are shown in the spa's time zone (from bookingWindow), whatever the phone's zone. */
export const SPA_TIME_ZONE = "Asia/Manila";

export const formatPeso = (n: number) =>
    `₱${n.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

export const formatTime = (iso: string, timeZone = SPA_TIME_ZONE) =>
    new Date(iso).toLocaleTimeString("en-US", { timeZone, hour: "numeric", minute: "2-digit" });

export const formatDay = (iso: string, timeZone = SPA_TIME_ZONE) =>
    new Date(iso).toLocaleDateString("en-US", {
        timeZone,
        weekday: "long",
        month: "long",
        day: "numeric",
    });

/** "YYYY-MM-DD" -> { weekday: "Thu", day: "23", month: "Oct" } (a calendar date, no zone) */
export function dateKeyParts(key: string) {
    const d = new Date(`${key}T12:00:00Z`);
    const opts = { timeZone: "UTC" } as const;
    return {
        weekday: d.toLocaleDateString("en-US", { ...opts, weekday: "short" }),
        day: d.toLocaleDateString("en-US", { ...opts, day: "numeric" }),
        month: d.toLocaleDateString("en-US", { ...opts, month: "short" }),
        long: d.toLocaleDateString("en-US", {
            ...opts,
            weekday: "long",
            month: "long",
            day: "numeric",
        }),
    };
}

/** Calendar days from `from` to `to` inclusive, as "YYYY-MM-DD" */
export function daysBetween(from: string, to: string): string[] {
    const out: string[] = [];
    const d = new Date(`${from}T00:00:00Z`);
    const end = new Date(`${to}T00:00:00Z`);
    while (d <= end) {
        out.push(d.toISOString().slice(0, 10));
        d.setUTCDate(d.getUTCDate() + 1);
    }
    return out;
}

export const formatDuration = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h && m ? `${h} hr ${m} min` : h ? `${h} hr` : `${m} min`;
};
