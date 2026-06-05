import { useState } from "react";
import Shimmer from "./Shimmer";
import { useParams } from "react-router-dom";
import RestaurantCategory from "./RestaurantCategory";
import useRestaurantMenu from "../utils/useRestaurantMenu";

const RestaurantMenu = () => {
  const [searchDish, setSearchDish] = useState("");
  const { resId } = useParams(); //access dynamic parameters from the URL
  const { resInfo, loading, error, fetchMenu } = useRestaurantMenu(resId);

  if (loading) return <Shimmer />;
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu not loading</h1>
        <p className="text-gray-600 mb-6">
          Network or API issue. Please try again.
        </p>
        <button
          type="button"
          onClick={fetchMenu}
          className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const restaurantCard = resInfo?.cards?.find((c) => c?.card?.card?.info)?.card
    ?.card?.info;

  const {
    name,
    cuisines,
    costForTwoMessage,
    avgRating,
    areaName,
    sla,
    aggregatedDiscountInfoV3,
  } = restaurantCard || {};

  const freeDelivery = aggregatedDiscountInfoV3?.header;

  const regularCards =
    resInfo?.cards?.find((c) => c?.groupedCard)?.groupedCard?.cardGroupMap
      ?.REGULAR?.cards || [];

  const categories = regularCards
    .map((c) => c?.card?.card)
    .filter((card) => {
      const hasDirectItems =
        Array.isArray(card?.itemCards) && card.itemCards.length > 0;
      const hasNestedCategories =
        Array.isArray(card?.categories) &&
        card.categories.some(
          (cat) => Array.isArray(cat?.itemCards) && cat.itemCards.length > 0
        );
      return hasDirectItems || hasNestedCategories;
    });

  const normalizedCategories = categories.flatMap((categoryCard, categoryIndex) => {
    if (
      Array.isArray(categoryCard?.itemCards) &&
      categoryCard.itemCards.length > 0
    ) {
      return [
        {
          id: `${categoryCard?.title || "Recommended"}-${categoryIndex}`,
          title: categoryCard?.title || "Recommended",
          items: categoryCard.itemCards,
          restaurantName: name, 
        },
      ];
    }

    return (categoryCard?.categories || []).map((nestedCategory, nestedIndex) => ({
      id: `${categoryCard?.title || "Category"}-${nestedCategory?.title || "Items"}-${categoryIndex}-${nestedIndex}`,
      title: nestedCategory?.title || categoryCard?.title || "Recommended",
      items: nestedCategory?.itemCards || [],
      restaurantName: name,
    }));
  });

  const filteredCategories = normalizedCategories
    .map((category) => {
      const filteredItems = category.items.filter((item) =>
        item?.card?.info?.name
          ?.toLowerCase()
          .includes(searchDish.toLowerCase())
      );
      return {
        id: category.id,
        title: category.title,
        items: filteredItems,
        restaurantName: category.restaurantName,
      };
    })
    .filter((category) => category.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 pb-16 bg-white dark:bg-black text-black dark:text-white">

      {/* Restaurant Info Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-800 p-6 mt-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {name}
        </h1>
        <p className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
            ⭐ {avgRating}
          </span>
          <span className="text-gray-300">•</span>
          <span>{costForTwoMessage}</span>
        </p>
        <p className="text-gray-600 mt-2 text-sm">{cuisines?.join(", ")}</p>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <p><span className="font-medium text-gray-600 dark:text-gray-300">Outlet:</span> {areaName}</p>
          <p>{sla?.slaString}</p>
        </div>
        <div className="mt-4 bg-orange-50 text-orange-800 text-sm font-medium px-4 py-2.5 rounded-lg border border-gray-100 dark:border-gray-800">
          <p>{freeDelivery || "Free delivery on orders above Rs.199"}</p>
        </div>
      </div>

      {/* Menu Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm font-bold tracking-widest text-gray-500 dark:text-gray-400">MENU</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>


      {/* Search */}
<div className="mb-8 sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur py-2">
  <input
    type="text"
    placeholder="Search for dishes"
    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white rounded-xl text-sm shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition"
    value={searchDish}
    onChange={(e) => setSearchDish(e.target.value)}
  />
</div>

      {/* Categories — Add to Cart button is inside RestaurantCategory */}
      <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm">
        {filteredCategories.map((category) => (
          <RestaurantCategory
            key={category.id}
            data={category}
            restaurantName={name} 
          />
        ))}
      </div>

      {filteredCategories.length === 0 && searchDish && (
        <p className="text-center text-gray-500 py-8">
          No dishes match &ldquo;{searchDish}&rdquo;.
        </p>
      )}
    </div>
  );
};

export default RestaurantMenu;