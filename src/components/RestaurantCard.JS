import {CDN_URL} from "../utils/constants";

const RestaurantCard = (props) => {
  const { resData  } = props;

  const{name,avgRating,slaString,cuisines,locality,costForTwo}=resData?.info;

  return (
    <div className="res-card">
       <img
        width="200"
        alt="res-card"
        src={CDN_URL + resData.info.cloudinaryImageId}
      />

      <h3>{name}</h3>
      <h4>⭐ {avgRating}</h4>
      <h4>{slaString}</h4>
      <h4>{cuisines.join(", ")}</h4>
      <h4>{locality}</h4>
      <h4>{costForTwo}</h4>
    </div>
  );
};

export default RestaurantCard;