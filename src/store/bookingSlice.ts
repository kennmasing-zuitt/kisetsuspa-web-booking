import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BookAppointmentMutation } from "@/gql/graphql";

export type Confirmation = BookAppointmentMutation["bookAppointment"];

/** The booking just made, for the confirmation page */
const bookingSlice = createSlice({
    name: "booking",
    initialState: { confirmation: null as Confirmation | null },
    reducers: {
        booked(state, action: PayloadAction<Confirmation>) {
            state.confirmation = action.payload;
        },
    },
});

export const { booked } = bookingSlice.actions;
export default bookingSlice.reducer;
