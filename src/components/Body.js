import RestaurantCard from "./RestaurantCard";
import {useState,useEffect} from "react";
import Shimmer from "./Shimmer";
import {Link} from "react-router-dom";


const Body = () => {
  //local state variable
  const [ListOfRestaurant,setListOfRestaurant]=useState([]);
  const [filteredRestaurants,setFilteredRestaurants]=useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [fetchError, setFetchError] = useState("");

  const [searchText,setSearchText]=useState("") //whenever we change local state variable ,REACT rerenders the component

  


  //whenever state variable updates, react triggers reconcilation cycle(re-rendering)
  //console.log("body rendered")//renders two times loads->render->api->rerenders........
    //console.log("useEffect called");//when thr body component render ,as soon as render cycle finish the useEffect is called
  useEffect(() => {
    const filtered = ListOfRestaurant.filter((res) =>
      res.info.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredRestaurants(filtered);
  }, [searchText, ListOfRestaurant]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData=async ()=>{
    const swiggyApiUrl =
      "https://www.swiggy.com/dapi/restaurants/list/v5?lat=17.3426876&lng=78.3135288&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING";

    const urlsToTry = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(swiggyApiUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(swiggyApiUrl)}`
    ];

    try {
      setIsLoading(true);
      setFetchError("");

      let json = null;
      let lastError = null;

      for (const url of urlsToTry) {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
          }
          json = await response.json();
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!json) {
        throw lastError || new Error("All restaurant API requests failed");
      }

      //optinal chaining
      const restaurants = json?.data?.cards //api call
        ?.filter(card => card?.card?.card?.gridElements?.infoWithStyle?.restaurants)
        ?.flatMap(card => card?.card?.card?.gridElements?.infoWithStyle?.restaurants);

      setListOfRestaurant(restaurants || []);
      setFilteredRestaurants(restaurants || []);
    } catch (error) {
      setFetchError("Failed to load restaurants. Please refresh or try again later.");
      setListOfRestaurant([]);
      setFilteredRestaurants([]);
      console.warn("Restaurant fetch failed:", error?.message || error);
    } finally {
      setIsLoading(false);
    }
};
//conditinal rendering
// if(ListOfRestaurant.length===0){
//   return <Shimmer />;
// }



  if (isLoading) return <Shimmer />;

  if (fetchError) {
    return (
      <div className="body">
        <p>{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="body">

       <h1 className="hero-title">
        Order food...! <br />
        Explore flavors that match your mood.
      </h1>

      <div className="filter">

        <div className="search">
          <input
            type="search"
            className="search-box"
            placeholder="Search your cravings..." // 🔥 NEW
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          
         <button
            className="search-btn" // 🔥 NEW class
            onClick={() => {
              const filtered = ListOfRestaurant.filter((res) =>
                res.info.name
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              );
              setFilteredRestaurants(filtered);
            }}
          >
            Search
          </button>
        </div>
        
        <button className="filter-btn"
          onClick={() => {
            //filter logic
            const filteredList=ListOfRestaurant.filter(
              (res)=>res.info.avgRating>4
            );
            setFilteredRestaurants(filteredList);
          }} 
          >
          Top rated restaurant</button>
      </div>

     <div className="res-container"> 
  {filteredRestaurants.map((restaurant, index) => (
    <Link 
      key={restaurant.info.id + "-" + index}
      to={"/restaurants/" + restaurant.info.id}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <RestaurantCard resData={restaurant} />
    </Link>
  ))} 
</div>
    </div>
  );
};

export default Body;

//react is re-rendering the whole body component ,but it is only updateing the input box value inside the DOM
//REACT compares the OLD virtual DOM AND NEW VIRTUAL DOM
//whole body component re-renders each time of key press(serach)
//reactfiber (reconsilation two virtual doms compares and updates the only specifice portion  required )of makes the react faster)

//when we write anything in search evryletter considers as react re-rendering it (serach)