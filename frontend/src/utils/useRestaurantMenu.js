import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/constants";

const useRestaurantMenu = (resId) => {
  const [resInfo, setResInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMenu = useCallback(async () => {
    if (!resId) return;

    try {
      setLoading(true);
      setError(false);

      const response = await fetch(`${API_BASE_URL}/menu/${resId}`);
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const json = await response.json();
      const realData = json?.data?.data || json?.data;

      if (!realData?.cards) {
        throw new Error("Invalid data");
      }

      setResInfo(realData);
    } catch (err) {
      console.warn("Menu fetch failed:", err?.message || err);
      setResInfo(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [resId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { resInfo, loading, error, fetchMenu };
};
export default useRestaurantMenu;
