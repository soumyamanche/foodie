import React from "react";

class UserClass extends React.Component {
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

componentWillUnmount(){
     console.log("component will unmount");

}

    render() {
        const { name, location, avatar_url } = this.state.userInfo;

        console.log(this.props.name + "child Render");

        return (
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 max-w-sm hover:shadow-lg transition">
                {avatar_url && (
                  <img
                    src={avatar_url}
                    alt={name || "User avatar"}
                    className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-orange-100"
                  />
                )}
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Name: Soumya</h2>
                <h3 className="text-gray-600 text-sm">Location: Hyderabad </h3>
                <h3 className="text-gray-600 text-sm mt-1">Contact: @soumya27</h3>
            </div>
        );
    }
}

export default UserClass;
