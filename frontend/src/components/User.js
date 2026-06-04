import { useState } from "react";

const User = ({ name }) => {
  const [count, setCount] = useState(0);
  const [count2] = useState(1);

  useEffect(() => {
    //api calls
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 max-w-sm">
      <h2 className="text-lg font-semibold text-gray-900">Name: {name}</h2>
      <h3 className="text-gray-600 text-sm mt-2">Location:Hyderabad</h3>
      <h3 className="text-gray-600 text-sm mt-1">Contact: @soumya27</h3>
    </div>
  );
};

export default User;
