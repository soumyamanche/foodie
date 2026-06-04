import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoginPopup from "../components/LoginPopup";

const restaurants = [
  { id: 1, name: "Pizza Palace",  cuisine: "Italian",  rating: 4.5, time: "30 min", price: "₹200", img: "🍕" },
  { id: 2, name: "Burger Barn",   cuisine: "American", rating: 4.2, time: "25 min", price: "₹150", img: "🍔" },
  { id: 3, name: "Noodle House",  cuisine: "Chinese",  rating: 4.7, time: "35 min", price: "₹180", img: "🍜" },
  { id: 4, name: "Biryani Blues", cuisine: "Indian",   rating: 4.8, time: "40 min", price: "₹250", img: "🍛" },
  { id: 5, name: "Taco Town",     cuisine: "Mexican",  rating: 4.3, time: "20 min", price: "₹120", img: "🌮" },
  { id: 6, name: "Sushi Spot",    cuisine: "Japanese", rating: 4.6, time: "45 min", price: "₹350", img: "🍣" },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleOrder = (restaurant) => {
    if (!user) {
      setShowPopup(true);
    } else {
      navigate(`/order/${restaurant.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showPopup && <LoginPopup onClose={() => setShowPopup(false)} />}

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-8 py-16 text-center">
        <h1 className="text-4xl font-bold text-white">Order food you love 🍔</h1>
        <p className="mt-2 text-base text-orange-100">Delivery in 30 minutes. Fresh and hot!</p>
      </div>

      {/* Restaurant Cards */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-6 text-xl font-bold text-gray-800">Restaurants near you</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="overflow-hidden rounded-2xl bg-white shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Card Image */}
              <div className="bg-orange-50 py-6 text-center text-6xl">
                {r.img}
              </div>

              {/* Card Body */}
              <div className="px-5 py-4">
                <h3 className="text-base font-bold text-gray-900">{r.name}</h3>
                <p className="mb-2 text-xs text-gray-400">{r.cuisine}</p>

                {/* Meta */}
                <div className="mb-4 flex gap-3 text-xs text-gray-500">
                  <span>⭐ {r.rating}</span>
                  <span>🕐 {r.time}</span>
                  <span>{r.price} for two</span>
                </div>

                <button
                  onClick={() => handleOrder(r)}
                  className="w-full rounded-lg bg-orange-400 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-500 active:bg-orange-600"
                >
                  Order Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}