import { useEffect, useState } from "react";

const useOnlineStatus = () => {
  // Read navigator.onLine after mount, not during render
  const [onlineStatus, setOnlineStatus] = useState(true);

  useEffect(() => {
    setOnlineStatus(navigator.onLine);

    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return onlineStatus;
};

export default useOnlineStatus;





