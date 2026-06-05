import { CDN_URL } from "../utils/constants";

const RestaurantCard = (props) => {
  const { resData } = props; //Parent sends restaurant data.

  const { name, avgRating, slaString, cuisines, locality, costForTwo } =
    resData?.info || {};

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:scale-[1.01] hover:shadow-md h-full flex flex-col">
      <div className="relative overflow-hidden">
        <img
          className="w-full h-36 object-cover"
          alt="res-card"
          src={CDN_URL + (resData?.info?.cloudinaryImageId || "")}
        />
        {avgRating && (
          <span className="absolute bottom-1.5 left-1.5 bg-white/95 text-gray-800 text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-sm">
            ⭐ {avgRating}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col gap-0.5 flex-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
          {name || "Restaurant"}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-300">{slaString || "Time not available"}</p>
        <p className="text-xs text-gray-500 line-clamp-2">
          {Array.isArray(cuisines)
            ? cuisines.join(", ")
            : "Cuisine not available"}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-auto">
          {locality || "Location not available"}
          {costForTwo ? ` · ${costForTwo}` : ""}
        </p>
      </div>
    </article>
  );
};

//higher ordr compoenents
//input-restsaurant=>restaurantCardPromted

export const withPromotedLabel = (RestaurantCard) => {
  return (props) => {
    return (
      <div className="relative">
        <label className="absolute bg-black text-white px-2 py-1 m-2 rounded-lg z-10 text-xs">
          Promoted
        </label>

        <RestaurantCard {...props} />
      </div>
    );
  };
};

export default RestaurantCard;

