export default function Loading() {
  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
        <h2 className="text-2xl font-bold mt-6 text-primary">Loading StarMy...</h2>
        <p className="opacity-70 mt-2">Preparing amazing content for you</p>
      </div>
    </div>
  );
}
