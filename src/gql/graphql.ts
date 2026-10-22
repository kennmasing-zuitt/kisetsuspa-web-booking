/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
    T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type AppointmentInput = {
    durationMin: number;
    serviceId: string | number;
    /** A start time from availableSlots */
    start: string;
    /** Omit for any therapist */
    therapistId?: string | number | null | undefined;
};

export type BookingWindowQueryVariables = Exact<{ [key: string]: never }>;

export type BookingWindowQuery = {
    bookingWindow: {
        today: string;
        lastDay: string;
        earliestStart: string;
        timeZone: string;
        phone: string;
    };
};

export type BookingOptionsQueryVariables = Exact<{
    date: string;
}>;

export type BookingOptionsQuery = {
    bookingServices: Array<{
        id: string;
        name: string;
        options: Array<{ durationMin: number; price: number }>;
    }>;
    bookingTherapists: Array<{ id: string; name: string }>;
};

export type AvailableSlotsQueryVariables = Exact<{
    date: string;
    serviceId: string | number;
    durationMin: number;
}>;

export type AvailableSlotsQuery = {
    availableSlots: Array<{ start: string; end: string; therapistIds: Array<string> }>;
};

export type BookAppointmentMutationVariables = Exact<{
    input: AppointmentInput;
}>;

export type BookAppointmentMutation = {
    bookAppointment: {
        bookingId: string;
        start: string;
        end: string;
        serviceName: string;
        durationMin: number;
        therapistName: string;
        price: number;
    };
};

export type ClientSessionFieldsFragment = {
    token: string;
    expiresAt: string;
    clientId: string;
    firstName: string;
};

export type ClientLoginMutationVariables = Exact<{
    mobile: string;
    code: string;
}>;

export type ClientLoginMutation = {
    clientLogin: { token: string; expiresAt: string; clientId: string; firstName: string };
};

export type RequestSetupCodeMutationVariables = Exact<{
    mobile: string;
    turnstileToken: string;
}>;

export type RequestSetupCodeMutation = {
    requestSetupCode: { sentTo: string; expiresAt: string; resendAfter: string };
};

export type VerifySetupCodeMutationVariables = Exact<{
    mobile: string;
    code: string;
}>;

export type VerifySetupCodeMutation = {
    verifySetupCode: {
        setupToken: string;
        needsName: boolean;
        firstName: string | null;
        hasApp: boolean;
    };
};

export type StartAppSetupMutationVariables = Exact<{
    setupToken: string;
    firstName?: string | null | undefined;
    lastName?: string | null | undefined;
}>;

export type StartAppSetupMutation = {
    startAppSetup: { setupToken: string; secret: string; otpauthUrl: string; qrDataUrl: string };
};

export type ConfirmAppSetupMutationVariables = Exact<{
    setupToken: string;
    code: string;
}>;

export type ConfirmAppSetupMutation = {
    confirmAppSetup: { token: string; expiresAt: string; clientId: string; firstName: string };
};

export class TypedDocumentString<TResult, TVariables>
    extends String
    implements DocumentTypeDecoration<TResult, TVariables>
{
    __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>["__apiType"]>;
    private value: string;
    public __meta__?: Record<string, any> | undefined;

    constructor(value: string, __meta__?: Record<string, any> | undefined) {
        super(value);
        this.value = value;
        this.__meta__ = __meta__;
    }

    override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
        return this.value;
    }
}
export const ClientSessionFieldsFragmentDoc = new TypedDocumentString(
    `
    fragment ClientSessionFields on ClientSession {
  token
  expiresAt
  clientId
  firstName
}
    `,
    { fragmentName: "ClientSessionFields" },
) as unknown as TypedDocumentString<ClientSessionFieldsFragment, unknown>;
export const BookingWindowDocument = new TypedDocumentString(`
    query BookingWindow {
  bookingWindow {
    today
    lastDay
    earliestStart
    timeZone
    phone
  }
}
    `) as unknown as TypedDocumentString<BookingWindowQuery, BookingWindowQueryVariables>;
export const BookingOptionsDocument = new TypedDocumentString(`
    query BookingOptions($date: String!) {
  bookingServices(date: $date) {
    id
    name
    options {
      durationMin
      price
    }
  }
  bookingTherapists {
    id
    name
  }
}
    `) as unknown as TypedDocumentString<BookingOptionsQuery, BookingOptionsQueryVariables>;
export const AvailableSlotsDocument = new TypedDocumentString(`
    query AvailableSlots($date: String!, $serviceId: ID!, $durationMin: Int!) {
  availableSlots(date: $date, serviceId: $serviceId, durationMin: $durationMin) {
    start
    end
    therapistIds
  }
}
    `) as unknown as TypedDocumentString<AvailableSlotsQuery, AvailableSlotsQueryVariables>;
export const BookAppointmentDocument = new TypedDocumentString(`
    mutation BookAppointment($input: AppointmentInput!) {
  bookAppointment(input: $input) {
    bookingId
    start
    end
    serviceName
    durationMin
    therapistName
    price
  }
}
    `) as unknown as TypedDocumentString<BookAppointmentMutation, BookAppointmentMutationVariables>;
export const ClientLoginDocument = new TypedDocumentString(`
    mutation ClientLogin($mobile: String!, $code: String!) {
  clientLogin(mobile: $mobile, code: $code) {
    ...ClientSessionFields
  }
}
    fragment ClientSessionFields on ClientSession {
  token
  expiresAt
  clientId
  firstName
}`) as unknown as TypedDocumentString<ClientLoginMutation, ClientLoginMutationVariables>;
export const RequestSetupCodeDocument = new TypedDocumentString(`
    mutation RequestSetupCode($mobile: String!, $turnstileToken: String!) {
  requestSetupCode(mobile: $mobile, turnstileToken: $turnstileToken) {
    sentTo
    expiresAt
    resendAfter
  }
}
    `) as unknown as TypedDocumentString<
    RequestSetupCodeMutation,
    RequestSetupCodeMutationVariables
>;
export const VerifySetupCodeDocument = new TypedDocumentString(`
    mutation VerifySetupCode($mobile: String!, $code: String!) {
  verifySetupCode(mobile: $mobile, code: $code) {
    setupToken
    needsName
    firstName
    hasApp
  }
}
    `) as unknown as TypedDocumentString<VerifySetupCodeMutation, VerifySetupCodeMutationVariables>;
export const StartAppSetupDocument = new TypedDocumentString(`
    mutation StartAppSetup($setupToken: String!, $firstName: String, $lastName: String) {
  startAppSetup(
    setupToken: $setupToken
    firstName: $firstName
    lastName: $lastName
  ) {
    setupToken
    secret
    otpauthUrl
    qrDataUrl
  }
}
    `) as unknown as TypedDocumentString<StartAppSetupMutation, StartAppSetupMutationVariables>;
export const ConfirmAppSetupDocument = new TypedDocumentString(`
    mutation ConfirmAppSetup($setupToken: String!, $code: String!) {
  confirmAppSetup(setupToken: $setupToken, code: $code) {
    ...ClientSessionFields
  }
}
    fragment ClientSessionFields on ClientSession {
  token
  expiresAt
  clientId
  firstName
}`) as unknown as TypedDocumentString<ConfirmAppSetupMutation, ConfirmAppSetupMutationVariables>;
