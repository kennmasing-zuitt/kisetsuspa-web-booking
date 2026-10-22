"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    useConfirmAppSetupMutation,
    useRequestSetupCodeMutation,
    useStartAppSetupMutation,
    useVerifySetupCodeMutation,
    type AppEnrollment,
    type SetupCodeSent,
} from "@/mods/session/sessionApi";
import { signedIn } from "@/store/sessionSlice";
import { useAppDispatch } from "@/store/hooks";
import { MOBILE_HINT, normalizeMobile } from "@/lib/mobile";
import type { GraphqlError } from "@/lib/graphqlBaseQuery";
import Turnstile from "./Turnstile";

type Step =
    | { kind: "mobile" }
    | { kind: "sms"; sent: SetupCodeSent }
    | { kind: "name"; setupToken: string }
    | { kind: "qr"; enrollment: AppEnrollment; firstName: string | null; hadApp: boolean };

const STEP_INDEX: Record<Step["kind"], number> = { mobile: 0, sms: 1, name: 2, qr: 3 };

const groupSecret = (s: string) => s.replace(/(.{4})/g, "$1 ").trim();
const message = (e: unknown) => (e as GraphqlError | undefined)?.message;

/**
 * Setting up sign-in for the booking site:
 *   mobile (+ bot check) -> code by SMS -> name if new -> scan QR -> first app code
 * The SMS proves the number; afterwards the client signs in with the app only.
 */
export default function SetupFlow() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [step, setStep] = useState<Step>({ kind: "mobile" });
    const [mobile, setMobile] = useState("");
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [turnstileKey, setTurnstileKey] = useState(0);
    const [smsCode, setSmsCode] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [appCode, setAppCode] = useState("");
    const [now, setNow] = useState(() => Date.now());

    const [requestCode, requestState] = useRequestSetupCodeMutation();
    const [verifyCode, verifyState] = useVerifySetupCodeMutation();
    const [startSetup, startState] = useStartAppSetupMutation();
    const [confirm, confirmState] = useConfirmAppSetupMutation();
    const normalized = normalizeMobile(mobile);

    // Ticks while waiting to allow "send again"
    useEffect(() => {
        if (step.kind !== "sms") return;
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, [step.kind]);

    async function sendCode(e?: FormEvent) {
        e?.preventDefault();
        if (!normalized || !turnstileToken) return;
        try {
            const sent = await requestCode({ mobile: normalized, turnstileToken }).unwrap();
            setStep({ kind: "sms", sent });
            setSmsCode("");
        } catch {
            /* shown below */
        } finally {
            // Each Turnstile token works once
            setTurnstileToken(null);
            setTurnstileKey((k) => k + 1);
        }
    }

    async function onSmsCode(e: FormEvent) {
        e.preventDefault();
        if (!normalized) return;
        try {
            const verified = await verifyCode({ mobile: normalized, code: smsCode }).unwrap();
            if (verified.needsName) setStep({ kind: "name", setupToken: verified.setupToken });
            else await showQr(verified.setupToken, verified.firstName, verified.hasApp);
        } catch {
            /* shown below */
        }
    }

    async function showQr(setupToken: string, knownName: string | null, hadApp = false) {
        const enrollment = await startSetup({
            setupToken,
            firstName: firstName.trim() || null,
            lastName: lastName.trim() || null,
        }).unwrap();
        setStep({ kind: "qr", enrollment, firstName: knownName ?? firstName.trim(), hadApp });
    }

    async function onName(e: FormEvent) {
        e.preventDefault();
        if (step.kind !== "name" || !firstName.trim()) return;
        try {
            await showQr(step.setupToken, null);
        } catch {
            /* shown below */
        }
    }

    async function onAppCode(e: FormEvent) {
        e.preventDefault();
        if (step.kind !== "qr") return;
        try {
            const session = await confirm({
                setupToken: step.enrollment.setupToken,
                code: appCode,
            }).unwrap();
            dispatch(signedIn(session));
            router.push("/new/");
        } catch (err) {
            if ((err as GraphqlError).code === "APP_SETUP_EXPIRED") setStep({ kind: "mobile" });
        }
    }

    const index = STEP_INDEX[step.kind];
    const progress = (
        <ol className="steps" aria-label={`Step ${index + 1} of 4`}>
            {[0, 1, 2, 3].map((i) => (
                <li key={i} className={i <= index ? "is-done" : ""} />
            ))}
        </ol>
    );

    if (step.kind === "mobile") {
        return (
            <form className="card stack" onSubmit={sendCode}>
                {progress}
                <div>
                    <h1>Set up online booking</h1>
                    <p className="lead">
                        We&apos;ll text a code to your mobile to make sure it&apos;s yours. Then
                        you&apos;ll link an authenticator app, which is all you need to sign in from
                        then on.
                    </p>
                </div>
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
                <Turnstile onToken={setTurnstileToken} resetKey={turnstileKey} />
                {requestState.error && <p className="alert">{message(requestState.error)}</p>}
                <button
                    className="btn"
                    disabled={!normalized || !turnstileToken || requestState.isLoading}
                >
                    {requestState.isLoading ? "Sending…" : "Text me a code"}
                </button>
                <Link className="btn btn--link" href="/">
                    I already set it up
                </Link>
            </form>
        );
    }

    if (step.kind === "sms") {
        const waitSeconds = Math.max(
            0,
            Math.ceil((Date.parse(step.sent.resendAfter) - now) / 1000),
        );
        return (
            <form className="card stack" onSubmit={onSmsCode}>
                {progress}
                <div>
                    <h1>Enter the texted code</h1>
                    <p className="lead">
                        We sent a 6-digit code to <strong>{step.sent.sentTo}</strong>. It works for
                        5 minutes.
                    </p>
                </div>
                <label className="field">
                    <span>Code from the text</span>
                    <input
                        className="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                        required
                        autoFocus
                    />
                </label>
                {(verifyState.error || startState.error) && (
                    <p className="alert">{message(verifyState.error ?? startState.error)}</p>
                )}
                <button
                    className="btn"
                    disabled={smsCode.length !== 6 || verifyState.isLoading || startState.isLoading}
                >
                    {verifyState.isLoading || startState.isLoading ? "Checking…" : "Continue"}
                </button>
                {waitSeconds > 0 ? (
                    <p className="hint center">You can ask for a new code in {waitSeconds}s.</p>
                ) : (
                    <>
                        <Turnstile onToken={setTurnstileToken} resetKey={turnstileKey} />
                        {requestState.error && (
                            <p className="alert">{message(requestState.error)}</p>
                        )}
                        <button
                            type="button"
                            className="btn btn--ghost"
                            disabled={!turnstileToken || requestState.isLoading}
                            onClick={() => sendCode()}
                        >
                            Send a new code
                        </button>
                    </>
                )}
                <button
                    type="button"
                    className="btn btn--link"
                    onClick={() => setStep({ kind: "mobile" })}
                >
                    Use a different number
                </button>
            </form>
        );
    }

    if (step.kind === "name") {
        return (
            <form className="card stack" onSubmit={onName}>
                {progress}
                <div>
                    <h1>Nice to meet you</h1>
                    <p className="lead">What name should we put on your bookings?</p>
                </div>
                <div className="row">
                    <label className="field">
                        <span>First name</span>
                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            autoComplete="given-name"
                            maxLength={100}
                            required
                            autoFocus
                        />
                    </label>
                    <label className="field">
                        <span>
                            Last name <span className="hint">(optional)</span>
                        </span>
                        <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            autoComplete="family-name"
                            maxLength={100}
                        />
                    </label>
                </div>
                {startState.error && <p className="alert">{message(startState.error)}</p>}
                <button className="btn" disabled={!firstName.trim() || startState.isLoading}>
                    {startState.isLoading ? "Please wait…" : "Continue"}
                </button>
            </form>
        );
    }

    // QR
    return (
        <form className="card stack" onSubmit={onAppCode}>
            {progress}
            <div>
                <h1>{step.firstName ? `Almost done, ${step.firstName}` : "Almost done"}</h1>
                <p className="lead">Link an authenticator app on this phone.</p>
            </div>
            {step.hadApp && <p className="note">This replaces the app you set up before.</p>}
            <ol className="howto">
                <li>
                    Install <strong>Google Authenticator</strong> (free on the App Store and Google
                    Play) if you don&apos;t have it.
                </li>
                <li>
                    Tap <strong>+</strong>, then <strong>Scan a QR code</strong>, and scan this
                    code. On this same phone? Choose <strong>Enter a setup key</strong> and type the
                    key below.
                </li>
                <li>Type the 6-digit code it shows for Kisetsu Spa.</li>
            </ol>
            <div className="qr">
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL from the API */}
                <img
                    src={step.enrollment.qrDataUrl}
                    alt="QR code to scan with your authenticator app"
                />
                <div className="secret" aria-label="Setup key">
                    {groupSecret(step.enrollment.secret)}
                </div>
                <a className="btn btn--link" href={step.enrollment.otpauthUrl}>
                    Open in authenticator app
                </a>
            </div>
            <label className="field">
                <span>Code from the app</span>
                <input
                    className="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={7}
                    value={appCode}
                    onChange={(e) => setAppCode(e.target.value.replace(/[^\d ]/g, ""))}
                    required
                />
            </label>
            {confirmState.error && <p className="alert">{message(confirmState.error)}</p>}
            <button
                className="btn"
                disabled={appCode.replace(/\s/g, "").length !== 6 || confirmState.isLoading}
            >
                {confirmState.isLoading ? "Checking…" : "Finish and book"}
            </button>
        </form>
    );
}
