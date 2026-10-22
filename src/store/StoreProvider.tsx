"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";
import { hydrate, type SessionState } from "./sessionSlice";

// sessionStorage: the session ends when the tab closes (shared phones, front-desk tablets)
const KEY = "kisetsu-booking-session";

/** One store per tab; the client session is kept in sessionStorage. */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const [store] = useState<AppStore>(makeStore);

    useEffect(() => {
        let saved: Pick<SessionState, "token" | "expiresAt" | "firstName"> | null = null;
        try {
            saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
        } catch {
            /* storage unavailable: sign in each time */
        }
        store.dispatch(hydrate(saved));

        let last = store.getState().session;
        return store.subscribe(() => {
            const { session } = store.getState();
            if (session === last) return;
            last = session;
            try {
                if (session.token) {
                    const { token, expiresAt, firstName } = session;
                    sessionStorage.setItem(KEY, JSON.stringify({ token, expiresAt, firstName }));
                } else sessionStorage.removeItem(KEY);
            } catch {
                /* ignore */
            }
        });
    }, [store]);

    return <Provider store={store}>{children}</Provider>;
}
