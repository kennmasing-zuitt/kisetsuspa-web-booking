"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

/** Pages for signed-in clients: sends everyone else to the sign-in page. */
export default function RequireSession({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { hydrated, token } = useAppSelector((s) => s.session);
    useEffect(() => {
        if (hydrated && !token) router.replace("/");
    }, [hydrated, token, router]);
    if (!hydrated || !token) return <div className="card muted center">Loading…</div>;
    return <>{children}</>;
}

/** The sign-in and setup pages: a signed-in client goes straight to booking. */
export function GuestOnly({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { hydrated, token } = useAppSelector((s) => s.session);
    useEffect(() => {
        if (hydrated && token) router.replace("/new/");
    }, [hydrated, token, router]);
    if (!hydrated || token) return <div className="card muted center">Loading…</div>;
    return <>{children}</>;
}
