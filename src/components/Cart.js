import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeItem, deleteItem, addItem, clearCart } from "../store/cartSlice";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import LoginPopup from "./LoginPopup";

const isImage = (img) =>
  typeof img === "string" &&
  (img.startsWith("http") || img.startsWith("/"));

const DELIVERY_FEE = 40;
const TAX_RATE = 0.05;

export default function Cart() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();//used for send actions to redux
  const items = useSelector((state) => state.cart.items);//Reads cart data from Redux Store.

  const [showPopup, setShowPopup] = useState(false);
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("upi");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0); //100*2 200*1  =400
  const taxes = Math.round(subtotal * TAX_RATE); //400*0.05
  const total = subtotal + DELIVERY_FEE + taxes; //460

  const handlePlaceOrder = () => {
    if (!user) return setShowPopup(true);
    if (!address.trim()) return alert("Please enter your delivery address!");
    dispatch(clearCart());
    setOrderPlaced(true);
  };

  const paymentOptions = [
    { id: "upi", icon: "📱", label: "UPI", desc: "GPay, PhonePe" },
    { id: "card", icon: "💳", label: "Card", desc: "Debit / Credit" },
    { id: "cash", icon: "💵", label: "Cash", desc: "Pay on delivery" },
  ];

  const CenterCard = ({ icon, title, sub, btnText, onBtn }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow text-center max-w-sm w-full">
        <div className="text-6xl mb-3">{icon}</div>
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-5">{sub}</p>
        <button
          onClick={onBtn}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
        >
          {btnText}
        </button>
      </div>
    </div>
  );

  if (orderPlaced)
    return (
      <CenterCard
        icon="🎉"
        title="Order Placed!"
        sub={`Your order of ₹${total} has been placed.`}
        btnText="Back to Home"
        onBtn={() => navigate("/")}
      />
    );

  if (items.length === 0)
    return (
      <CenterCard
        icon="🛒"
        title="Cart is Empty"
        sub="Add delicious food from restaurants"
        btnText="Browse Restaurants"
        onBtn={() => navigate("/")}
      />
    );


  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">

      {showPopup && <LoginPopup onClose={() => setShowPopup(false)} />}

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            🛒 Your Cart
          </h1>

          <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            {items.length} items
          </span>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-8">

          <div className="flex flex-col gap-6">

            {/* CART ITEMS (FIXED) */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <h2 className="font-bold text-gray-900 mb-4">Order Items</h2>

              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4 gap-4"
                  >

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3 min-w-0">

                      <div className="w-12 h-12 shrink-0 flex items-center justify-center">
  {isImage(item.img) ? (
    <img
      src={item.img}
      alt={item.name}
      className="w-12 h-12 rounded-xl object-cover"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  ) : (
    <span className="text-3xl">{item.img || "🍽️"}</span>
  )}
</div>

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {item.restaurant}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ₹{item.price} each
                        </p>
                      </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-col items-end gap-2 shrink-0">

                      {/* QTY */}
                      <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1">

                        <button
                          className="text-lg font-bold text-orange-600"
                          onClick={() => dispatch(removeItem(item.id))}
                        >
                          −
                        </button>

                        <span className="font-bold text-sm w-5 text-center">
                          {item.qty}
                        </span>

                        <button
                          className="text-lg font-bold text-orange-600"
                          onClick={() => dispatch(addItem(item))}
                        >
                          +
                        </button>

                      </div>

                      {/* PRICE + DELETE */}
                      <div className="flex items-center gap-2">

                        <span className="font-semibold text-gray-900">
                          ₹{item.price * item.qty}
                        </span>

                        <button
                          className="text-gray-400 hover:text-red-500 transition"
                          onClick={() => dispatch(deleteItem(item.id))}
                        >
                          🗑
                        </button>

                      </div>

                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* ADDRESS */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <h2 className="font-bold mb-3">📍 Delivery Address</h2>

              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-orange-400 resize-none"
                rows={3}
                placeholder="House no, Street, Area, City..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            {/* PAYMENT */}
            <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">
              <h2 className="font-bold mb-3">💳 Payment Method</h2>

              <div className="grid grid-cols-3 gap-3">
                {paymentOptions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={`rounded-xl border p-3 text-center transition ${
                      payment === p.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="text-2xl">{p.icon}</div>
                    <p className="text-xs font-semibold mt-1">{p.label}</p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ================= RIGHT SIDE ================= */}
          <div className="lg:sticky lg:top-6 h-fit">

            <div className="bg-white rounded-2xl shadow-md p-6 border">

              <h2 className="font-bold text-lg mb-4">📋 Order Summary</h2>

              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate">
                      {item.name} × {item.qty}
                    </span>
                    <span>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>₹{DELIVERY_FEE}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span>₹{taxes}</span>
                </div>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span className="text-orange-600">₹{total}</span>
              </div>

              <div className="mt-3 text-center text-sm bg-orange-50 border border-orange-200 rounded-lg py-2">
                Paying via {payment.toUpperCase()}
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl"
              >
                Place Order · ₹{total}
              </button>

              <p className="text-xs text-center text-gray-400 mt-2">
                🔒 Safe & Secure Checkout
              </p>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}