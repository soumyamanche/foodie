import {CDN_URL} from "../utils/constants";

const RestaurantCard = (props) => {
  const { resData  } = props;

  const{name,avgRating,slaString,cuisines,locality,costForTwo}=resData?.info || {};
  return (
    <div className="res-card">
       <img
        width="200"
        alt="res-card"
        src={CDN_URL + (resData?.info?.cloudinaryImageId || "")}
      />

      <h3>{name || "Restaurant"}</h3>
      <h4>⭐ {avgRating || "N/A"}</h4>
      <h4>{slaString || "Time not available"}</h4>
      <h4>{Array.isArray(cuisines) ? cuisines.join(", ") : "Cuisine not available"}</h4>
      <h4>{locality || "Location not available"}</h4>
      <h4>{costForTwo || ""}</h4>
    </div>
  );
};

export default RestaurantCard;
