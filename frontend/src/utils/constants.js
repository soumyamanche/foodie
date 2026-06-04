export const CDN_URL =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_660/";

export const LOGO_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOYqcNyLh1ysspFcIB_3ULSam5AQt_-YUEHg&s";

export const MENU_API =
  "https://www.swiggy.com/mapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=17.3426876&lng=78.3135288&restaurantId=";

const LOCAL_BACKEND_URL = "http://localhost:3001";

export const API_BASE_URL =
  process.env.PARCEL_PUBLIC_API_BASE_URL || LOCAL_BACKEND_URL;
