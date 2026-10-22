import { baseApi } from "@/store/baseApi";
import {
    ClientLoginDocument,
    ConfirmAppSetupDocument,
    RequestSetupCodeDocument,
    StartAppSetupDocument,
    VerifySetupCodeDocument,
    type ClientLoginMutation,
    type ClientLoginMutationVariables,
    type ClientSessionFieldsFragment,
    type ConfirmAppSetupMutation,
    type ConfirmAppSetupMutationVariables,
    type RequestSetupCodeMutation,
    type RequestSetupCodeMutationVariables,
    type StartAppSetupMutation,
    type StartAppSetupMutationVariables,
    type VerifySetupCodeMutation,
    type VerifySetupCodeMutationVariables,
} from "@/gql/graphql";

export type SetupCodeSent = RequestSetupCodeMutation["requestSetupCode"];
export type SetupCodeVerified = VerifySetupCodeMutation["verifySetupCode"];
export type AppEnrollment = StartAppSetupMutation["startAppSetup"];

export const sessionApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /** Sign in: mobile + the current code from the authenticator app */
        clientLogin: build.mutation<ClientSessionFieldsFragment, ClientLoginMutationVariables>({
            query: (variables) => ({ document: ClientLoginDocument, variables }),
            transformResponse: (data: ClientLoginMutation) => data.clientLogin,
        }),
        /** Setup 1: text a 6-digit code (needs a Turnstile token) */
        requestSetupCode: build.mutation<SetupCodeSent, RequestSetupCodeMutationVariables>({
            query: (variables) => ({ document: RequestSetupCodeDocument, variables }),
            transformResponse: (data: RequestSetupCodeMutation) => data.requestSetupCode,
        }),
        /** Setup 2: the texted code */
        verifySetupCode: build.mutation<SetupCodeVerified, VerifySetupCodeMutationVariables>({
            query: (variables) => ({ document: VerifySetupCodeDocument, variables }),
            transformResponse: (data: VerifySetupCodeMutation) => data.verifySetupCode,
        }),
        /** Setup 3: (name for a new client) -> QR code */
        startAppSetup: build.mutation<AppEnrollment, StartAppSetupMutationVariables>({
            query: (variables) => ({ document: StartAppSetupDocument, variables }),
            transformResponse: (data: StartAppSetupMutation) => data.startAppSetup,
        }),
        /** Setup 4: first code from the app -> signed in */
        confirmAppSetup: build.mutation<
            ClientSessionFieldsFragment,
            ConfirmAppSetupMutationVariables
        >({
            query: (variables) => ({ document: ConfirmAppSetupDocument, variables }),
            transformResponse: (data: ConfirmAppSetupMutation) => data.confirmAppSetup,
        }),
    }),
});

export const {
    useClientLoginMutation,
    useRequestSetupCodeMutation,
    useVerifySetupCodeMutation,
    useStartAppSetupMutation,
    useConfirmAppSetupMutation,
} = sessionApi;
