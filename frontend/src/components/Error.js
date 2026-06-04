import { useRouteError } from "react-router-dom";

const Error = () => {
  const err = useRouteError();
  console.log(err);
  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
        Oops something went wrong
      </h1>
      <h2 className="text-lg text-gray-600 mb-4">Error page</h2>
      <h3 className="text-orange-600 font-semibold">
        {err.status}: {err.statusText}
      </h3>
    </section>
  );
};

export default Error;
