import UserClass from "./UserClass";
import { Component } from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">

      {/* HERO SECTION */}
      <section className="text-center px-6 py-20 border-b">
        <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-300 text-lg leading-8">
          Est. 2025 • India
        </p>

        <h1 className="text-5xl font-bold leading-tight mb-6">
          Convenience, delivered <br /> every single day.
        </h1>

        <p className="max-w-2xl mx-auto text-gray-500 text-lg leading-8">
          We started with one simple idea — making food delivery
          faster, smarter, and more enjoyable.
        </p>
      </section>

      {/* STATS SECTION */}
      <section className="px-6 py-16 border-b">
        <h2 className="uppercase text-sm tracking-widest text-gray-400 dark:text-gray-300 mb-8">
          By the numbers
        </h2>

        <div className="grid md:grid-cols-4 gap-5">
          <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
            <h3 className="text-3xl font-bold">700+</h3>
            <p className="text-black mt-2">Cities Served</p>
          </div>

          <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
            <h3 className="text-3xl font-bold">50M+</h3>
            <p className="text-black mt-2">Orders Delivered</p>
          </div>

          <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
            <h3 className="text-3xl font-bold">10 min</h3>
            <p className="text-black mt-2">Fast Delivery</p>
          </div>

          <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
            <h3 className="text-3xl font-bold">24/7</h3>
            <p className="text-black mt-2">Customer Support</p>
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="px-6 py-16 border-b">
        <h2 className="uppercase text-sm tracking-widest text-gray-400 dark:text-gray-300 mb-8">
          Our Mission
        </h2>

        <div className="bg-orange-100 rounded-3xl p-10">
          <p className="text-2xl font-semibold text-orange-700 leading-10">
            To elevate everyday life by delivering food,
            groceries, and happiness instantly.
          </p>
        </div>
      </section>

      {/* AI SECTION */}
<section className="px-6 py-16 border-b">

  <div className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm mb-8">
    ✨ AI & Technology
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

    <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
      <h3 className="font-semibold text-lg mb-3">
        Neural Search
      </h3>

      <p className="text-black">
        Understands searches like
        “healthy dinner after gym”.
      </p>
    </div>

    <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
      <h3 className="font-semibold text-lg mb-3">
        Smart Logistics
      </h3>

      <p className="text-black">
        AI-powered route optimization
        for faster deliveries.
      </p>
    </div>

    <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
      <h3 className="font-semibold text-lg mb-3">
        AI Support
      </h3>

      <p className="text-black">
        Instant customer help without
        long waiting times.
      </p>
    </div>

    <div className="bg-gray-100 rounded-2xl p-6 text-black dark:text-black">
      <h3 className="font-semibold text-lg mb-3">
        Personalisation
      </h3>

      <p className="text-black">
        Food recommendations based
        on your mood and history.
      </p>
    </div>

  </div>
</section>
<section className="px-6 py-16 border-b">

  <h2 className="uppercase text-sm tracking-widest text-gray-400 mb-10">
    Why Choose Us
  </h2>

  <div className="grid md:grid-cols-3 gap-6">

    <div className="p-8 rounded-3xl bg-orange-100 text-black dark:text-black">
      <h3 className="text-2xl font-bold mb-4">
        ⚡ Fast Delivery
      </h3>

      <p className="text-black leading-7">
        Get your favorite meals delivered
        in minutes with real-time tracking.
      </p>
    </div>

    <div className="p-8 rounded-3xl bg-orange-100 text-black dark:text-black">
      <h3 className="text-2xl font-bold mb-4">
        🤖 AI Recommendations
      </h3>

      <p className="text-black leading-7">
        Discover food based on your mood,
        cravings, and order history.
      </p>
    </div>

    <div className="p-8 rounded-3xl bg-orange-100 text-black dark:text-black">
      <h3 className="text-2xl font-bold mb-4">
        🍔 Unlimited Choices
      </h3>

      <p className="text-black leading-7">
        Explore thousands of restaurants
        and cuisines near you.
      </p>
    </div>

  </div>
</section>

      {/* VALUES SECTION */}
      <section className="px-6 py-16 border-b">
        <h2 className="uppercase text-sm tracking-widest text-gray-400 mb-8">
          What We Stand For
        </h2>

        <div className="grid md:grid-cols-4 gap-5">

          <div className="border rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">
              Think Win-Win
            </h3>
            <p className="text-gray-500 dark:text-gray-300">
              Customers and partners grow together.
            </p>
          </div>

          <div className="border rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">
              Move Fast
            </h3>
            <p className="text-gray-500 dark:text-gray-300">
              We build quickly and improve constantly.
            </p>
          </div>

          <div className="border rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">
              Dream Big
            </h3>
            <p className="text-gray-500">
              Big ideas create powerful experiences.
            </p>
          </div>

          <div className="border rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-2">
              Stay Humble
            </h3>
            <p className="text-gray-500">
              Learning never stops for us.
            </p>
          </div>

        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center px-6 py-20">
        <h2 className="text-4xl font-bold mb-4">
          Hungry for more?
        </h2>

        <p className="text-gray-500 dark:text-gray-300 mb-8">
          Explore restaurants and discover amazing food near you.
        </p>

        <button
  onClick={() => navigate("/")}
  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition"
>
  Order Now
</button>
      </section>

    </div>
  );
};

export default About;
