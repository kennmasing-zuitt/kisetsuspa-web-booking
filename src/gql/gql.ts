/* eslint-disable */
import * as types from "./graphql";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query BookingWindow {\n  bookingWindow {\n    today\n    lastDay\n    earliestStart\n    timeZone\n    phone\n  }\n}\n\nquery BookingOptions($date: String!) {\n  bookingServices(date: $date) {\n    id\n    name\n    options {\n      durationMin\n      price\n    }\n  }\n  bookingTherapists {\n    id\n    name\n  }\n}\n\nquery AvailableSlots($date: String!, $serviceId: ID!, $durationMin: Int!) {\n  availableSlots(date: $date, serviceId: $serviceId, durationMin: $durationMin) {\n    start\n    end\n    therapistIds\n  }\n}\n\nmutation BookAppointment($input: AppointmentInput!) {\n  bookAppointment(input: $input) {\n    bookingId\n    start\n    end\n    serviceName\n    durationMin\n    therapistName\n    price\n  }\n}": typeof types.BookingWindowDocument;
    "fragment ClientSessionFields on ClientSession {\n  token\n  expiresAt\n  clientId\n  firstName\n}\n\nmutation ClientLogin($mobile: String!, $code: String!) {\n  clientLogin(mobile: $mobile, code: $code) {\n    ...ClientSessionFields\n  }\n}\n\nmutation RequestSetupCode($mobile: String!, $turnstileToken: String!) {\n  requestSetupCode(mobile: $mobile, turnstileToken: $turnstileToken) {\n    sentTo\n    expiresAt\n    resendAfter\n  }\n}\n\nmutation VerifySetupCode($mobile: String!, $code: String!) {\n  verifySetupCode(mobile: $mobile, code: $code) {\n    setupToken\n    needsName\n    firstName\n    hasApp\n  }\n}\n\nmutation StartAppSetup($setupToken: String!, $firstName: String, $lastName: String) {\n  startAppSetup(\n    setupToken: $setupToken\n    firstName: $firstName\n    lastName: $lastName\n  ) {\n    setupToken\n    secret\n    otpauthUrl\n    qrDataUrl\n  }\n}\n\nmutation ConfirmAppSetup($setupToken: String!, $code: String!) {\n  confirmAppSetup(setupToken: $setupToken, code: $code) {\n    ...ClientSessionFields\n  }\n}": typeof types.ClientSessionFieldsFragmentDoc;
};
const documents: Documents = {
    "query BookingWindow {\n  bookingWindow {\n    today\n    lastDay\n    earliestStart\n    timeZone\n    phone\n  }\n}\n\nquery BookingOptions($date: String!) {\n  bookingServices(date: $date) {\n    id\n    name\n    options {\n      durationMin\n      price\n    }\n  }\n  bookingTherapists {\n    id\n    name\n  }\n}\n\nquery AvailableSlots($date: String!, $serviceId: ID!, $durationMin: Int!) {\n  availableSlots(date: $date, serviceId: $serviceId, durationMin: $durationMin) {\n    start\n    end\n    therapistIds\n  }\n}\n\nmutation BookAppointment($input: AppointmentInput!) {\n  bookAppointment(input: $input) {\n    bookingId\n    start\n    end\n    serviceName\n    durationMin\n    therapistName\n    price\n  }\n}":
        types.BookingWindowDocument,
    "fragment ClientSessionFields on ClientSession {\n  token\n  expiresAt\n  clientId\n  firstName\n}\n\nmutation ClientLogin($mobile: String!, $code: String!) {\n  clientLogin(mobile: $mobile, code: $code) {\n    ...ClientSessionFields\n  }\n}\n\nmutation RequestSetupCode($mobile: String!, $turnstileToken: String!) {\n  requestSetupCode(mobile: $mobile, turnstileToken: $turnstileToken) {\n    sentTo\n    expiresAt\n    resendAfter\n  }\n}\n\nmutation VerifySetupCode($mobile: String!, $code: String!) {\n  verifySetupCode(mobile: $mobile, code: $code) {\n    setupToken\n    needsName\n    firstName\n    hasApp\n  }\n}\n\nmutation StartAppSetup($setupToken: String!, $firstName: String, $lastName: String) {\n  startAppSetup(\n    setupToken: $setupToken\n    firstName: $firstName\n    lastName: $lastName\n  ) {\n    setupToken\n    secret\n    otpauthUrl\n    qrDataUrl\n  }\n}\n\nmutation ConfirmAppSetup($setupToken: String!, $code: String!) {\n  confirmAppSetup(setupToken: $setupToken, code: $code) {\n    ...ClientSessionFields\n  }\n}":
        types.ClientSessionFieldsFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "query BookingWindow {\n  bookingWindow {\n    today\n    lastDay\n    earliestStart\n    timeZone\n    phone\n  }\n}\n\nquery BookingOptions($date: String!) {\n  bookingServices(date: $date) {\n    id\n    name\n    options {\n      durationMin\n      price\n    }\n  }\n  bookingTherapists {\n    id\n    name\n  }\n}\n\nquery AvailableSlots($date: String!, $serviceId: ID!, $durationMin: Int!) {\n  availableSlots(date: $date, serviceId: $serviceId, durationMin: $durationMin) {\n    start\n    end\n    therapistIds\n  }\n}\n\nmutation BookAppointment($input: AppointmentInput!) {\n  bookAppointment(input: $input) {\n    bookingId\n    start\n    end\n    serviceName\n    durationMin\n    therapistName\n    price\n  }\n}",
): typeof import("./graphql").BookingWindowDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
    source: "fragment ClientSessionFields on ClientSession {\n  token\n  expiresAt\n  clientId\n  firstName\n}\n\nmutation ClientLogin($mobile: String!, $code: String!) {\n  clientLogin(mobile: $mobile, code: $code) {\n    ...ClientSessionFields\n  }\n}\n\nmutation RequestSetupCode($mobile: String!, $turnstileToken: String!) {\n  requestSetupCode(mobile: $mobile, turnstileToken: $turnstileToken) {\n    sentTo\n    expiresAt\n    resendAfter\n  }\n}\n\nmutation VerifySetupCode($mobile: String!, $code: String!) {\n  verifySetupCode(mobile: $mobile, code: $code) {\n    setupToken\n    needsName\n    firstName\n    hasApp\n  }\n}\n\nmutation StartAppSetup($setupToken: String!, $firstName: String, $lastName: String) {\n  startAppSetup(\n    setupToken: $setupToken\n    firstName: $firstName\n    lastName: $lastName\n  ) {\n    setupToken\n    secret\n    otpauthUrl\n    qrDataUrl\n  }\n}\n\nmutation ConfirmAppSetup($setupToken: String!, $code: String!) {\n  confirmAppSetup(setupToken: $setupToken, code: $code) {\n    ...ClientSessionFields\n  }\n}",
): typeof import("./graphql").ClientSessionFieldsFragmentDoc;

export function graphql(source: string) {
    return (documents as any)[source] ?? {};
}
