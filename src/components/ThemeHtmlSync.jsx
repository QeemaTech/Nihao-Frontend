import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function isDashboardPath(pathname) {
  return pathname.startsWith("/admin") || pathname.startsWith("/instructor");
}

/**
 * Applies `dark` on <html> only for /admin/* and /instructor/* using the user's stored preference.
 * All other routes force light mode (no `dark` class).
 */
export default function ThemeHtmlSync() {
  const { pathname } = useLocation();
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (!isDashboardPath(pathname)) {
      root.classList.remove("dark");
      return;
    }
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [pathname, theme]);

  return null;
}
