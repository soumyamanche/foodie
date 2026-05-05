import { useState, useEffect } from "react";
import Shimmer from "./Shimmer";
import { useParams } from "react-router-dom";
import { MENU_API } from "../utils/constants";

const RestaurantMenu = () => {
  const [resInfo, setResInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchDish, setSearchDish] = useState("");

  const { resId } = useParams();

  useEffect(() => {
    fetchMenu();
  }, [resId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(false);

      const menuUrl = MENU_API + resId;
      const proxyUrl = "https://corsproxy.io/?" + encodeURIComponent(menuUrl);
      const data = await fetch(proxyUrl);
      if (!data.ok) {
        throw new Error(`Request failed: ${data.status}`);
      }
      const json = await data.json();

      const realData = json?.data?.data || json?.data;

      if (!realData?.cards) {
        throw new Error("Invalid data");
      }

      setResInfo(realData);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Shimmer />;
  if (error) {
    return (
      <div className="menu-error-wrapper">
        <h1 className="menu-error-title">Menu not loading</h1>
        <p className="menu-error-text">Network or API issue. Please try again.</p>
        <button onClick={fetchMenu} className="menu-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const restaurantCard = resInfo?.cards?.find((c) => c?.card?.card?.info)?.card?.card?.info;

  const { name, cuisines, costForTwoMessage, avgRating, areaName, sla, aggregatedDiscountInfoV3 } =
    restaurantCard || {};

  const freeDelivery = aggregatedDiscountInfoV3?.header;
  const regularCards =
    resInfo?.cards?.find((c) => c?.groupedCard)?.groupedCard?.cardGroupMap?.REGULAR?.cards || [];

  const categories = regularCards
    .map((c) => c?.card?.card)
    .filter((card) => {
      const hasDirectItems = Array.isArray(card?.itemCards) && card.itemCards.length > 0;
      const hasNestedCategories =
        Array.isArray(card?.categories) &&
        card.categories.some((cat) => Array.isArray(cat?.itemCards) && cat.itemCards.length > 0);
      return hasDirectItems || hasNestedCategories;
    });

  const normalizedCategories = categories.flatMap((categoryCard) => {
    if (Array.isArray(categoryCard?.itemCards) && categoryCard.itemCards.length > 0) {
      return [{ title: categoryCard?.title || "Recommended", items: categoryCard.itemCards }];
    }

    return (categoryCard?.categories || []).map((nestedCategory) => ({
      title: nestedCategory?.title || categoryCard?.title || "Recommended",
      items: nestedCategory?.itemCards || [],
    }));
  });

  const filteredCategories = normalizedCategories
    .map((category) => {
      const filteredItems = category.items.filter((item) =>
        item?.card?.info?.name?.toLowerCase().includes(searchDish.toLowerCase())
      );
      return { title: category.title, items: filteredItems };
    })
    .filter((category) => category.items.length > 0);

  return (
    <div className="menu-page">
      <div className="menu-restaurant-card">
        <h1 className="menu-restaurant-name">{name}</h1>
        <p className="menu-rating-line">
          <span className="menu-rating">⭐ {avgRating}</span>
          <span className="menu-dot">•</span>
          <span>{costForTwoMessage}</span>
        </p>
        <p className="menu-cuisines">{cuisines?.join(", ")}</p>
        <div className="menu-location">
          <p>Outlet: {areaName}</p>
          <p>{sla?.slaString}</p>
        </div>
        <div className="menu-discount">
          <p>{freeDelivery || "Free delivery on orders above Rs.199"}</p>
        </div>
      </div>

      <div className="menu-title-wrapper">
        <div className="menu-title-line"></div>
        <span className="menu-title-text">MENU</span>
        <div className="menu-title-line"></div>
      </div>

      <div className="menu-search-wrapper">
        <input
          type="text"
          placeholder="Search for dishes"
          className="menu-search-input"
          value={searchDish}
          onChange={(e) => setSearchDish(e.target.value)}
        />
      </div>

      <div className="menu-list">
        {filteredCategories.map((category) => (
          <div key={category.title} className="menu-category-block">
            <h2 className="menu-category-title">{category.title}</h2>

            {category.items.map((item) => {
                const info = item?.card?.info;
                const price = (info?.price ?? info?.defaultPrice ?? 0) / 100;

                return (
                  <div key={info?.id} className="menu-item-row">
                    <div className="menu-item-left">
                      <div className="menu-veg-icon">
                        <div className="menu-veg-dot"></div>
                      </div>
                      <h3 className="menu-item-name">{info?.name}</h3>
                      <p className="menu-item-price">Rs.{price}</p>
                      {info?.ratings?.aggregatedRating?.rating && (
                        <p className="menu-item-rating">
                          ⭐ {info?.ratings?.aggregatedRating?.rating}
                          <span className="menu-item-rating-count">
                            ({info?.ratings?.aggregatedRating?.ratingCount})
                          </span>
                        </p>
                      )}
                      <p className="menu-item-description">{info?.description}</p>
                    </div>

                    <div className="menu-item-right">
                      {info?.imageId && (
                        <img
                          src={"https://media-assets.swiggy.com/swiggy/image/upload/" + info?.imageId}
                          alt={info?.name}
                          className="menu-item-image"
                        />
                      )}
                      <button className="menu-add-btn">ADD</button>
                      {info?.isCustomisable && (
                        <p className="menu-customisable-text">Customisable</p>
                      )}
                    </div>
                  </div>
                );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
