"use client";

import { useEffect, useRef } from "react";

interface TurnstileApi {
    render(
        el: HTMLElement,
        opts: {
            sitekey: string;
            callback: (token: string) => void;
            "expired-callback"?: () => void;
            "error-callback"?: () => void;
            action?: string;
            theme?: "auto" | "light" | "dark";
        },
    ): string;
    reset(id?: string): void;
    remove(id: string): void;
}
declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

export const TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA"; // always-pass test key
const MOCK = process.env.NEXT_PUBLIC_MOCK_API === "true";
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<TurnstileApi> | null = null;
function loadTurnstile(): Promise<TurnstileApi> {
    loading ??= new Promise((resolve, reject) => {
        if (window.turnstile) return resolve(window.turnstile);
        const s = document.createElement("script");
        s.src = SCRIPT;
        s.async = true;
        s.onload = () =>
            window.turnstile ? resolve(window.turnstile) : reject(new Error("no turnstile"));
        s.onerror = () => {
            loading = null;
            reject(new Error("Turnstile failed to load"));
        };
        document.head.appendChild(s);
    });
    return loading;
}

/**
 * Cloudflare Turnstile: a (mostly invisible) check that a person is asking for the text code.
 * Calls `onToken` with a single-use token (valid 5 minutes), or null when it expires. Change
 * `resetKey` to get a fresh token after one was used.
 */
export default function Turnstile({
    onToken,
    resetKey = 0,
}: {
    onToken: (token: string | null) => void;
    resetKey?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const onTokenRef = useRef(onToken);
    useEffect(() => {
        onTokenRef.current = onToken;
    });

    useEffect(() => {
        if (MOCK) {
            onTokenRef.current("mock-turnstile-token");
            return;
        }
        let id: string | undefined;
        let cancelled = false;
        loadTurnstile()
            .then((ts) => {
                if (cancelled || !ref.current) return;
                id = ts.render(ref.current, {
                    sitekey: TURNSTILE_SITE_KEY,
                    action: "setup-code",
                    theme: "auto",
                    callback: (token) => onTokenRef.current(token),
                    "expired-callback": () => onTokenRef.current(null),
                    "error-callback": () => onTokenRef.current(null),
                });
            })
            .catch(() => onTokenRef.current(null));
        return () => {
            cancelled = true;
            if (id) window.turnstile?.remove(id);
        };
    }, [resetKey]);

    if (MOCK) return null;
    return <div ref={ref} className="turnstile" />;
}
