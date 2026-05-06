import {useState} from "react";

const User = ({name}) =>{
    const [count,setCount]=useState(0);
    const [count2]=useState(1);
    
    useEffect(()=>{
        //api calls
    }, []);

  

    return(
        <div className="user-card">
            <h2>Name: {name}</h2>
            <h3>Location:Hyderabad</h3>
            <h3>Contact: @soumya27</h3>
        </div>
    );;
}

export default User;