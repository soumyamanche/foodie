import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../store/cartSlice";
import { useAuth } from "../context/AuthContext";
import LoginPopup from "./LoginPopup";

export default function ItemList({ items }) {
  const dispatch  = useDispatch();
  const { user }  = useAuth();
  const cartItems = useSelector((state) => state.cart.items);

  const [showPopup, setShowPopup] = useState(false);
  const [added, setAdded]         = useState(null);

  const handleAdd = (item) => {
    if (!user) {
  setShowPopup(true);
  return;
}
    dispatch(
      addItem({//redux update cart
        id:         item.card.info.id,
        name:       item.card.info.name,
        price:      (item.card.info.price || item.card.info.defaultPrice) / 100,
        restaurant: item.restaurantName || "",
        img:        item.card.info.imageId || "",
      })
    );
    setAdded(item.card.info.id);
    setTimeout(() => setAdded(null), 1500);
  };

  const getQtyInCart = (id) => {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.qty : 0;
  };

  return (
    <div className="w-full">

      {/* LOGIN POPUP */}
      {showPopup && <LoginPopup onClose={() => setShowPopup(false)} />}

      {/* ITEMS */}
      <div className="flex flex-col">
        {items.map((item) => {
          const info = item?.card?.info;
          if (!info) return null;

          const price      = (info.price || info.defaultPrice) / 100;
          const qtyInCart  = getQtyInCart(info.id);
          const isAdded    = added === info.id;

          return (
            <div
              key={info.id}
              className="flex justify-between gap-4 border-b border-gray-200 py-5"
            >
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-gray-900">
                  {info.name}
                </h3>

                <p className="mt-1 text-[15px] font-bold text-gray-800">
                  ₹{price}
                </p>

                {info.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                    {info.description}
                  </p>
                )}

                {qtyInCart > 0 && (
                  <div className="mt-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">
                    🛒 {qtyInCart} in cart
                  </div>
                )}
              </div>

              {/* RIGHT SIDE */}
              <div className="flex min-w-[110px] flex-col items-center gap-3">
                {info.imageId ? (
                  <img
                    src={`https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_208,h_208,c_fit/${info.imageId}`}
                    alt={info.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                    🍽️
                  </div>
                )}

                <button
                  onClick={() => handleAdd(item)}
                  className={`w-[90px] rounded-lg border py-2 text-sm font-bold shadow-md transition-all duration-300 bg-white ${
                    isAdded
                      ? "border-green-500 text-green-600"
                      : "border-gray-200 text-green-600 hover:border-green-400 hover:shadow-lg"
                  }`}
                >
                  {isAdded ? "Added ✓" : "+ ADD"}
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
