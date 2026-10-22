import type { GraphqlError } from "./graphqlBaseQuery";
import { normalizeMobile } from "./mobile";

/**
 * In-browser stand-in for the booking API (NEXT_PUBLIC_MOCK_API=true), so the site can be
 * clicked through without a server. 0917 123 4567 (Juan) already has the app; any other
 * number goes through setup. The texted code is 123456; any 6-digit app code works.
 */

const TZ_OFFSET = 8 * 60; // Asia/Manila
const pad = (n: number) => String(n).padStart(2, "0");
const manilaNow = () => new Date(Date.now() + TZ_OFFSET * 60_000);
const todayKey = () => manilaNow().toISOString().slice(0, 10);
const addDays = (key: string, n: number) => {
    const d = new Date(`${key}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
};
const at = (key: string, minutes: number) =>
    new Date(`${key}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00+08:00`).toISOString();

const services = [
    {
        id: "fuyu",
        name: "Fuyu",
        options: [
            { durationMin: 60, price: 1099 },
            { durationMin: 80, price: 1199 },
        ],
    },
    {
        id: "natsu",
        name: "Natsu",
        options: [
            { durationMin: 60, price: 1299 },
            { durationMin: 80, price: 1399 },
        ],
    },
    { id: "haru", name: "Haru", options: [{ durationMin: 80, price: 1599 }] },
    { id: "shiki", name: "Shiki", options: [{ durationMin: 120, price: 2499 }] },
    {
        id: "aki",
        name: "Aki",
        options: [60, 90, 120].map((durationMin) => ({ durationMin, price: 699 })),
    },
];
const therapists = [
    { id: "ana", name: "Ana", offDays: [0] },
    { id: "ben", name: "Ben", offDays: [2, 3] },
    { id: "carla", name: "Carla", offDays: [1] },
    { id: "dana", name: "Dana", offDays: [0, 6] },
];
const clients = new Map<string, { firstName: string; hasApp: boolean }>([
    ["+639171234567", { firstName: "Juan", hasApp: true }],
]);
const taken: { start: number; end: number; therapistId: string }[] = [];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const fail = (message: string, code: string) => ({ error: { message, code } as GraphqlError });
const isCode = (c: unknown) => /^\d{6}$/.test(String(c ?? "").replace(/\s/g, ""));
const session = (mobile: string) => ({
    token: `mock-session-${mobile}`,
    expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
    clientId: mobile,
    firstName: clients.get(mobile)?.firstName ?? "there",
});

function slots(date: string, durationMin: number) {
    const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
    const earliest = Date.now() + 120 * 60_000;
    const out = [];
    for (let m = 10 * 60; m + durationMin <= 22 * 60; m += 30) {
        const start = Date.parse(at(date, m));
        const end = start + durationMin * 60_000;
        if (start < earliest) continue;
        const free = therapists.filter(
            (t) =>
                !t.offDays.includes(weekday) &&
                // A few busy hours so the page looks real
                !(t.id === "ana" && m >= 14 * 60 && m < 16 * 60) &&
                !taken.some((b) => b.therapistId === t.id && b.start < end && start < b.end),
        );
        if (free.length)
            out.push({
                start: new Date(start).toISOString(),
                end: new Date(end).toISOString(),
                therapistIds: free.map((t) => t.id),
            });
    }
    return out;
}

export async function mockBookingApi(
    document: string,
    variables: Record<string, unknown> | undefined,
    token: string | null,
): Promise<{ data: unknown } | { error: GraphqlError }> {
    await delay(250);
    const op = /(?:mutation|query)\s+(\w+)/.exec(document)?.[1] ?? "";
    const v = variables ?? {};
    const mobile = normalizeMobile(String(v.mobile ?? "")) ?? "";

    switch (op) {
        case "BookingWindow": {
            const today = todayKey();
            return {
                data: {
                    bookingWindow: {
                        today,
                        lastDay: addDays(today, 7),
                        earliestStart: new Date(Date.now() + 120 * 60_000).toISOString(),
                        timeZone: "Asia/Manila",
                        phone: "0917 000 1234",
                    },
                },
            };
        }
        case "BookingOptions":
            return {
                data: {
                    bookingServices: services,
                    bookingTherapists: therapists.map(({ id, name }) => ({ id, name })),
                },
            };
        case "AvailableSlots":
            if (!token) return fail("Please sign in with your app code", "SESSION_EXPIRED");
            return { data: { availableSlots: slots(String(v.date), Number(v.durationMin)) } };
        case "BookAppointment": {
            if (!token) return fail("Please sign in with your app code", "SESSION_EXPIRED");
            const input = v.input as {
                serviceId: string;
                durationMin: number;
                start: string;
                therapistId?: string;
            };
            const date = new Date(Date.parse(input.start) + TZ_OFFSET * 60_000)
                .toISOString()
                .slice(0, 10);
            const slot = slots(date, input.durationMin).find((s) => s.start === input.start);
            const therapistId = input.therapistId ?? slot?.therapistIds[0];
            if (!slot || !therapistId || !slot.therapistIds.includes(therapistId))
                return fail("Sorry, that time was just taken. Please pick another.", "SLOT_TAKEN");
            const start = Date.parse(input.start);
            taken.push({ start, end: start + input.durationMin * 60_000, therapistId });
            const service = services.find((s) => s.id === input.serviceId)!;
            return {
                data: {
                    bookAppointment: {
                        bookingId: `mock-${taken.length}`,
                        start: input.start,
                        end: new Date(start + input.durationMin * 60_000).toISOString(),
                        serviceName: service.name,
                        durationMin: input.durationMin,
                        therapistName: therapists.find((t) => t.id === therapistId)!.name,
                        price:
                            service.options.find((o) => o.durationMin === input.durationMin)
                                ?.price ?? 0,
                    },
                },
            };
        }
        case "ClientLogin":
            if (!clients.get(mobile)?.hasApp || !isCode(v.code))
                return fail(
                    "That number and code didn’t match. After several wrong codes, sign-in pauses for 15 minutes.",
                    "INVALID_CLIENT_CODE",
                );
            return { data: { clientLogin: session(mobile) } };
        case "RequestSetupCode":
            if (!mobile)
                return fail("Enter a mobile number like 0917 123 4567", "VALIDATION_ERROR");
            console.info("[mock] the texted code is 123456");
            return {
                data: {
                    requestSetupCode: {
                        sentTo: mobile.replace(/^\+63(9\d{2})\d{3}(\d{4})$/, "0$1 *** $2"),
                        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
                        resendAfter: new Date(Date.now() + 60_000).toISOString(),
                    },
                },
            };
        case "VerifySetupCode": {
            if (String(v.code).replace(/\s/g, "") !== "123456")
                return fail(
                    "That code is not right, or it expired. Ask for a new one.",
                    "INVALID_SETUP_CODE",
                );
            const c = clients.get(mobile);
            return {
                data: {
                    verifySetupCode: {
                        setupToken: `mock-setup-${mobile}`,
                        needsName: !c,
                        firstName: c?.firstName ?? null,
                        hasApp: Boolean(c?.hasApp),
                    },
                },
            };
        }
        case "StartAppSetup": {
            const m = String(v.setupToken).replace("mock-setup-", "");
            if (!clients.has(m)) {
                if (!v.firstName) return fail("Enter your first name", "VALIDATION_ERROR");
                clients.set(m, { firstName: String(v.firstName), hasApp: false });
            }
            return {
                data: {
                    startAppSetup: {
                        setupToken: `mock-setup-${m}`,
                        secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP",
                        otpauthUrl: "otpauth://totp/Kisetsu%20Spa:0917?secret=JBSWY3DPEHPK3PXP",
                        qrDataUrl:
                            "data:image/svg+xml," +
                            encodeURIComponent(
                                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#fff"/><rect x="20" y="20" width="50" height="50" fill="#222"/><rect x="130" y="20" width="50" height="50" fill="#222"/><rect x="20" y="130" width="50" height="50" fill="#222"/><text x="100" y="110" text-anchor="middle" font-family="sans-serif" font-size="14">mock QR</text></svg>',
                            ),
                    },
                },
            };
        }
        case "ConfirmAppSetup": {
            const m = String(v.setupToken).replace("mock-setup-", "");
            if (!isCode(v.code))
                return fail(
                    "That code is not right. Try the newest code in the app.",
                    "INVALID_CLIENT_CODE",
                );
            const c = clients.get(m)!;
            clients.set(m, { ...c, hasApp: true });
            return { data: { confirmAppSetup: session(m) } };
        }
        default:
            return fail(`Mock has no handler for ${op}`, "MOCK");
    }
}
