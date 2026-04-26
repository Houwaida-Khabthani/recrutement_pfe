import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store";

// ✅ dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// ✅ selector (THIS WAS MISSING)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;