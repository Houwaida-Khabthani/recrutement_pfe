import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { useAppDispatch } from "./hooks/useAppDispatch";
import { useAppSelector } from "./hooks/useAppDispatch";
import { fetchUser } from "./store/slices/authSlice";
import { useSocket } from "./hooks/useSocket";

function App() {
  const dispatch = useAppDispatch();
  const token = localStorage.getItem("token");

  const theme = useAppSelector((state) => state.ui.theme);

  // Initialize socket connection
  useSocket();

  useEffect(() => {
    if (token) {
      dispatch(fetchUser());
    }
  }, [dispatch, token]);

  // ✅ GLOBAL THEME APPLY
  useEffect(() => {
    const root = document.documentElement;

    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return <AppRoutes />;
}

export default App;