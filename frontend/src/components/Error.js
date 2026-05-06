import {useRouteError} from "react-router-dom";

const Error = () =>{
    const err=useRouteError();
    console.log(err);
    return(
        <div className="Error">
            <h1>Oops something went wrong</h1>
            <h2>Error page</h2>
            <h3>{err.status}: {err.statusText}</h3>
        </div>
    )
}

export default Error;