//skeleton loader

const ShimmerCard = () => (// returns a single loading card
  <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden animate-pulse">
    <div className="h-36 bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-3/4" />
      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
      <div className="h-2.5 bg-gray-200 rounded w-full" />
      <div className="h-2.5 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const Shimmer = () => { //This component displays multiple shimmer cards
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-8 animate-pulse" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">//Responsive grid
        {Array.from({ length: 12 }).map((_, i) => (
          <ShimmerCard key={i} />
        ))}
      </div>
    </div>
  );
};

export default Shimmer;
