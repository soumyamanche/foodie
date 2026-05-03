import React from "react";

class UserClass extends React.Component {
    //this is the best place to create state variables

    constructor(props) {
        super(props);

    this.state={
        userInfo:{
            name:"dummy",
            location:"default",

        }
    };
    console.log(this.props.name + "child Constructor");
};

async componentDidMount(){
   // console.log(this.props.name +"child compoenent did mount");
   //api calls

   const data = await fetch("https://api.github.com/users/soumyamanche");
   const json =await data.json();

   this.setState({
    userInfo:json,
   })

   console.log(json);
}

componentDidUpdate(){
    console.log("component Did Update");
}

componentDidUnmount(){
     console.log("component will unmount");

}

    render() {
        const { name, location, avatar_url } = this.state.userInfo;

        console.log(this.props.name + "child Render");

        return (
            <div className="user-card">
                <img src={avatar_url} alt={name || "User avatar"} />
                <h2>Name: {name}</h2>
                <h3>Location: {location}</h3>
                <h3>Contact: @soumya27</h3>
            </div>
        );
    }
}

export default UserClass;



 /*
parent constructor
parent render

{name: 'first', location: 'hyderabad'}
 child Constructor
  child Render

{name: 'second', location: 'us'}
  child Constructor
  child Render

child compoenent did mount
parent Component did Mount

*/

/*

----MOUNTING------
constructor(dummy)
render(dummy)
    <HTML dummy>
    <this.setState> -> state variable is updated

----update-----
   render(api data)
   <html (new api data)
   componentDid update


*/