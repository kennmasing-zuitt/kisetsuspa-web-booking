import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ClientSessionFieldsFragment } from "@/gql/graphql";

export interface SessionState {
    token: string | null;
    expiresAt: string | null;
    firstName: string | null;
    /** Shown on the sign-in page after a session ended (expired, or reset by staff) */
    notice: string | null;
    /** false until sessionStorage has been read (avoids a flash of the sign-in page) */
    hydrated: boolean;
}

const initialState: SessionState = {
    token: null,
    expiresAt: null,
    firstName: null,
    notice: null,
    hydrated: false,
};

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        hydrate(
            state,
            action: PayloadAction<Pick<SessionState, "token" | "expiresAt" | "firstName"> | null>,
        ) {
            const saved = action.payload;
            const valid = saved?.expiresAt && Date.parse(saved.expiresAt) > Date.now();
            state.token = valid ? saved.token : null;
            state.expiresAt = valid ? saved.expiresAt : null;
            state.firstName = valid ? saved.firstName : null;
            state.hydrated = true;
        },
        signedIn(state, action: PayloadAction<ClientSessionFieldsFragment>) {
            state.token = action.payload.token;
            state.expiresAt = action.payload.expiresAt;
            state.firstName = action.payload.firstName;
            state.notice = null;
        },
        /** Also dispatched by graphqlBaseQuery when the server says the session is over */
        signedOut(state, action: PayloadAction<string | undefined>) {
            state.token = null;
            state.expiresAt = null;
            state.firstName = null;
            state.notice = action.payload ?? null;
        },
    },
});

export const { hydrate, signedIn, signedOut } = sessionSlice.actions;
export default sessionSlice.reducer;
