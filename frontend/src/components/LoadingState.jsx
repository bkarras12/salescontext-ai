export default function LoadingState() {
  return (
    <div className="w-full max-w-3xl mx-auto mt-12 text-center">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
      </div>
      <p className="mt-6 text-gray-500 text-lg">Researching company... this may take up to 60 seconds</p>
    </div>
  );
}
