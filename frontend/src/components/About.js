import UserClass from "./UserClass";
import { Component } from "react";

class About extends Component{
    constructor(props){
        super(props);

        //console.log(" parent constructor")
    }

componentDidMount(){
    //console.log(this.props.name + "parent Component did Mount");
    }

    render(){
        //console.log("parent render");
        return(
            <div>
                <h1>About class Component</h1>
                <h1>namaste dev series</h1>
                    <UserClass name={"first"} location={"hyderabad"}/>
            </div>
        );
    }
}

export default About;