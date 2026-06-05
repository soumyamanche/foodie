import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem, removeItem } from "../store/cartSlice";
import { useAuth } from "../context/AuthContext";
import LoginPopup from "./LoginPopup";

const MENU_IMAGE_URL =
  "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_208,h_208,c_fit/";

const formatPrice = (price) => {
  if (!price) return "";
  return `₹${price / 100}`;
};

const FoodTypeIcon = ({ isVeg }) => (
  <span
    className={`inline-flex h-4 w-4 items-center justify-center rounded-[3px] border ${
      isVeg ? "border-green-600" : "border-red-600"
    }`}
    aria-label={isVeg ? "Vegetarian" : "Non vegetarian"}
  >
    <span
      className={`h-2 w-2 rounded-full ${isVeg ? "bg-green-600" : "bg-red-600"}`}
    />
  </span>
);

const RestaurantCategory = ({ data, restaurantName }) => {
  const [showItems, setShowItems]           = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const itemCount  = data?.items?.length || 0;
  const dispatch   = useDispatch();
  const { user }   = useAuth();
  const cartItems  = useSelector((state) => state.cart.items);

  const getQty = (id) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.qty : 0;
  };

  const handleAdd = (info) => {
    if (!user) {
      setShowLoginPopup(true);
      return;
    }
    dispatch(addItem({
      id:         info.id,
      name:       info.name,
      price:      (info.price || info.defaultPrice) / 100,
      restaurant: restaurantName || "",
      img:        info.imageId ? MENU_IMAGE_URL + info.imageId : "",
    }));
  };

  const handleRemove = (id) => {
    dispatch(removeItem(id));
  };

  return (
    <section className="bg-white dark:bg-gray-900 border-t-[16px] border-gray-100 dark:border-gray-800 first:border-t-0">

      {/* LoginPopup is INSIDE return now */}
      {showLoginPopup && (
        <LoginPopup onClose={() => setShowLoginPopup(false)} />
      )}

      {/* Accordion header */}
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-5 text-left"
        onClick={() => setShowItems((prev) => !prev)}
        aria-expanded={showItems}
      >
        <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white">
          {data?.title} ({itemCount})
        </h2>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {showItems ? "⌃" : "⌄"}
        </span>
      </button>

      {showItems && (
        <div className="px-4">
          {data?.items?.map((item, index) => {
            const info     = item?.card?.info || {};
            const price    = formatPrice(info?.price || info?.defaultPrice);
            const rating   = info?.ratings?.aggregatedRating?.rating;
            const ratingCount =
              info?.ratings?.aggregatedRating?.ratingCountV2 ||
              info?.ratings?.aggregatedRating?.ratingCount;
            const isVeg    = info?.itemAttribute?.vegClassifier === "VEG";
            const qty      = getQty(info?.id);

            return (
              <article
                key={`${info?.id || info?.name || "item"}-${index}`}
                className="flex gap-4 border-b border-gray-200 py-5 last:border-b-0"
              >
                {/* Left: item details */}
                <div className="min-w-0 flex-1 pr-1">
                  <FoodTypeIcon isVeg={isVeg} />

                  <h3 className="mt-2 text-[16px] font-bold leading-snug text-gray-800 dark:text-white">
                    {info?.name}
                  </h3>

                  {price && (
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {price}
                    </p>
                  )}

                  {rating && (
                    <p className="mt-2 text-[13px] leading-5 text-gray-500 dark:text-gray-300 line-clamp-2">
                      <span>★ {rating}</span>
                      {ratingCount && (
                        <span className="font-medium text-gray-500">
                          {" "}({ratingCount})
                        </span>
                      )}
                    </p>
                  )}

                  {info?.description && (
                    <p className="mt-2 text-[13px] leading-5 text-gray-500 line-clamp-2">
                      {info.description}
                    </p>
                  )}
                </div>

                {/* Right: image + ADD button */}
<div className="relative h-32 w-32 shrink-0">
  {info?.imageId ? (
    <img
      src={MENU_IMAGE_URL + info.imageId}
      alt={info?.name || "Menu item"}
      className="h-28 w-32 rounded-xl object-cover"
    />
  ) : (
    <div className="h-28 w-32 rounded-xl bg-gray-100 dark:bg-gray-800" />
  )}

                  {/* ADD / qty controls */}
                  {qty === 0 ? (
                    <button
                      type="button"
                      className="absolute bottom-0 left-1/2 h-9 min-w-24 -translate-x-1/2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 text-sm font-extrabold text-green-600 shadow-md"
                      onClick={() => handleAdd(info)}
                    >
                      ADD
                    </button>
                  ) : (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-600 text-white rounded-lg shadow-md px-3 h-9 min-w-24 justify-between">
                      <button
                        type="button"
                        className="text-lg font-bold leading-none"
                        onClick={() => handleRemove(info?.id)}
                      >
                        −
                      </button>
                      <span className="text-sm font-extrabold">{qty}</span>
                      <button
                        type="button"
                        className="text-lg font-bold leading-none"
                        onClick={() => handleAdd(info)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default RestaurantCategory;