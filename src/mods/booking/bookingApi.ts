import { baseApi } from "@/store/baseApi";
import {
    AvailableSlotsDocument,
    BookAppointmentDocument,
    BookingOptionsDocument,
    BookingWindowDocument,
    type AvailableSlotsQuery,
    type AvailableSlotsQueryVariables,
    type BookAppointmentMutation,
    type BookAppointmentMutationVariables,
    type BookingOptionsQuery,
    type BookingWindowQuery,
} from "@/gql/graphql";

export type BookingWindow = BookingWindowQuery["bookingWindow"];
export type BookingOptions = BookingOptionsQuery;
export type PublicService = BookingOptionsQuery["bookingServices"][number];
export type Slot = AvailableSlotsQuery["availableSlots"][number];

export const bookingApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        /** Bookable days (today … +7) and the earliest start (2 hours from now) */
        getBookingWindow: build.query<BookingWindow, void>({
            query: () => ({ document: BookingWindowDocument }),
            transformResponse: (data: BookingWindowQuery) => data.bookingWindow,
        }),
        /** Services with lengths and prices on that day, and therapists (first names) */
        getBookingOptions: build.query<BookingOptions, string>({
            query: (date) => ({ document: BookingOptionsDocument, variables: { date } }),
        }),
        /** Free start times; each lists the therapists free then */
        getAvailableSlots: build.query<Slot[], AvailableSlotsQueryVariables>({
            query: (variables) => ({ document: AvailableSlotsDocument, variables }),
            transformResponse: (data: AvailableSlotsQuery) => data.availableSlots,
            providesTags: ["Slots"],
            keepUnusedDataFor: 15,
        }),
        bookAppointment: build.mutation<
            BookAppointmentMutation["bookAppointment"],
            BookAppointmentMutationVariables["input"]
        >({
            query: (input) => ({ document: BookAppointmentDocument, variables: { input } }),
            transformResponse: (data: BookAppointmentMutation) => data.bookAppointment,
            invalidatesTags: ["Slots"],
        }),
    }),
});

export const {
    useGetBookingWindowQuery,
    useGetBookingOptionsQuery,
    useGetAvailableSlotsQuery,
    useBookAppointmentMutation,
} = bookingApi;
