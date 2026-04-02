export function Navbar() {
  return (
    <nav className="w-full p-6 md:px-12 flex items-center justify-between z-20 relative backdrop-blur-sm bg-black/20 sticky top-0 border-b border-white/5">
      <div className="flex items-center gap-3">
        <h1 className="text-lg md:text-xl font-bold font-urbanist tracking-wide text-white">
          ICPEP SE - PUP Manila{" "}
          <span className="text-secondary hidden md:inline">
            Dashboard Example
          </span>
          <span className="text-secondary md:hidden">Dashboard</span>
        </h1>
      </div>
    </nav>
  );
}
