import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { TypedDocumentString } from "@/gql/graphql";
import { mockBookingApi } from "./mockBookingApi";

export interface GraphqlRequest {
    /** A generated `<Name>Document` from @/gql/graphql */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: TypedDocumentString<any, any>;
    variables?: Record<string, unknown>;
}

export interface GraphqlError {
    message: string;
    /** extensions.code, e.g. "INVALID_CLIENT_CODE", "SLOT_TAKEN", "SESSION_EXPIRED" */
    code?: string;
    details?: unknown;
}

interface StateWithSession {
    session: { token: string | null };
}

export const BOOKING_API_URL =
    process.env.NEXT_PUBLIC_BOOKING_API_URL ?? "http://localhost:2200/booking/graphql";
const USE_MOCK = process.env.NEXT_PUBLIC_MOCK_API === "true";

/** Codes meaning "the session is over": the app signs the client out and asks again. */
export const SESSION_ENDED = new Set(["SESSION_EXPIRED", "INVALID_TOKEN", "UNAUTHENTICATED"]);

/**
 * GraphQL base query for the PUBLIC booking API. Sends the client session as a Bearer token
 * (no cookies), returns the first GraphQL error as `error`.
 */
export const graphqlBaseQuery: BaseQueryFn<GraphqlRequest, unknown, GraphqlError> = async (
    { document, variables },
    api,
) => {
    const token = (api.getState() as StateWithSession).session.token;
    const result = USE_MOCK
        ? await mockBookingApi(document.toString(), variables, token)
        : await send(document.toString(), variables, token, api.signal);
    if ("error" in result && result.error.code && SESSION_ENDED.has(result.error.code) && token) {
        api.dispatch({
            type: "session/signedOut",
            payload: "Your session ended. Please sign in again.",
        });
    }
    return result;
};

async function send(
    query: string,
    variables: Record<string, unknown> | undefined,
    token: string | null,
    signal: AbortSignal,
): Promise<{ data: unknown } | { error: GraphqlError }> {
    try {
        const res = await fetch(BOOKING_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ query, variables }),
            signal,
        });
        const json = (await res.json()) as {
            data?: unknown;
            errors?: { message: string; extensions?: { code?: string; details?: unknown } }[];
        };
        if (json.errors?.length) {
            const [first] = json.errors;
            return {
                error: {
                    message: first.message,
                    code: first.extensions?.code,
                    details: first.extensions?.details,
                },
            };
        }
        if (!res.ok) return { error: { message: `Request failed (${res.status})` } };
        return { data: json.data };
    } catch {
        return {
            error: {
                message:
                    "We couldn't reach the booking service. Check your connection and try again.",
            },
        };
    }
}
