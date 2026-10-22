import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";
import bookingReducer from "./bookingSlice";
import sessionReducer from "./sessionSlice";

const rootReducer = combineReducers({
    session: sessionReducer,
    booking: bookingReducer,
    [baseApi.reducerPath]: baseApi.reducer,
});

export const makeStore = () =>
    configureStore({
        reducer: rootReducer,
        middleware: (getDefault) => getDefault().concat(baseApi.middleware),
    });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
