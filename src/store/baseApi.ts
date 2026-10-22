import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlBaseQuery } from "@/lib/graphqlBaseQuery";

/** One RTK Query API; each module adds its endpoints with injectEndpoints. */
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: graphqlBaseQuery,
    tagTypes: ["Slots"],
    endpoints: () => ({}),
});
