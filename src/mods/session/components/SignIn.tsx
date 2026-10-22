"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClientLoginMutation } from "@/mods/session/sessionApi";
import { signedIn } from "@/store/sessionSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { MOBILE_HINT, normalizeMobile } from "@/lib/mobile";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";

/** Mobile number + the 6-digit code from the client's authenticator app. No password. */
export default function SignIn() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const notice = useAppSelector((s) => s.session.notice);
    const [login, { isLoading, error }] = useClientLoginMutation();
    const [mobile, setMobile] = useState("");
    const [code, setCode] = useState("");
    const normalized = normalizeMobile(mobile);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (!normalized) return;
        try {
            dispatch(signedIn(await login({ mobile: normalized, code }).unwrap()));
            router.push("/new/");
        } catch {
            setCode("");
        }
    }

    return (
        <>
            <form className="card stack" onSubmit={onSubmit}>
                <div>
                    <h1>Welcome back</h1>
                    <p className="lead">
                        Sign in with your mobile number and the 6-digit code from your authenticator
                        app.
                    </p>
                </div>
                {notice && <p className="note">{notice}</p>}
                <label className="field">
                    <span>Mobile number</span>
                    <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="0917 123 4567"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                    />
                    {mobile && !normalized && <span className="hint">{MOBILE_HINT}</span>}
                </label>
                <label className="field">
                    <span>Code from the app</span>
                    <input
                        className="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="••••••"
                        maxLength={7}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ""))}
                        required
                    />
                    <span className="hint">
                        Google Authenticator shows a new code every 30 seconds.
                    </span>
                </label>
                {error && <p className="alert">{(error as GraphqlError).message}</p>}
                <button
                    className="btn"
                    disabled={isLoading || !normalized || code.replace(/\s/g, "").length !== 6}
                >
                    {isLoading ? "Signing in…" : "Sign in"}
                </button>
            </form>

            <div className="card stack center">
                <p className="muted" style={{ margin: 0 }}>
                    First time booking online, or got a new phone?
                </p>
                <Link className="btn btn--ghost" href="/setup/">
                    Set up online booking
                </Link>
            </div>
        </>
    );
}
