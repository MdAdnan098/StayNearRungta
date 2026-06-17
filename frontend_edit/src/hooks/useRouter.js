import { useState, useEffect } from "react";

const useRouter = () => {
  const [path, setPath] = useState(window.location.hash || "#/");

  useEffect(() => {
    const handler = () => setPath(window.location.hash || "#/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return { path };
};

export default useRouter;
