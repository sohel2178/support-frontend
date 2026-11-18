// AuthProvider redirects "/" to the right landing page for the signed-in user (or /login).
export default function HomePage() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-slate-500">Redirecting...</p>
      </div>
    </div>
  );
}
