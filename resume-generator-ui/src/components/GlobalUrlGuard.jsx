import { useEffect } from "react";

const GlobalUrlGuard = () => {
  useEffect(() => {
    const currentURL = window.location.href;

    const isLocal = window.location.hostname === "localhost";

    if (currentURL.includes("/undefined/")) {
      const base = isLocal
        ? "http://localhost:5000"
        : window.location.origin;

      window.location.replace(`${base}/product`);
    }
  }, []);

  return null;
};

export default GlobalUrlGuard;