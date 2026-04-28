import { useEffect } from "react";

const GlobalUrlGuard = () => {
  useEffect(() => {
    const currentURL = window.location.href;

    if (currentURL.includes("/undefined/")) {
      const base = currentURL.includes("localhost")
        ? "http://localhost:5000"
        : "https://resume-generator-app-1.onrender.com";

      window.location.replace(`${base}/product`);
    }
  }, []);

  return null;
};

export default GlobalUrlGuard;