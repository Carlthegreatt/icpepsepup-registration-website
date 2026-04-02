import React from "react";

interface LoadingScreenProps {
  message: string;
  colorTheme?: "primary" | "amber"; // Updated theme option to amber
}

export const LoadingScreen = ({
  message,
  colorTheme = "amber",
}: LoadingScreenProps) => {
  // Check which theme is selected
  const isAmber = colorTheme === "amber";

  // Apply the correct Tailwind classes based on the theme
  // We use yellow-400/500 to get that ICPEP SE gold look
  const textColor = isAmber ? "text-yellow-400" : "text-yellow-500";
  const ringColor = isAmber
    ? "border-yellow-500/20 border-t-yellow-400"
    : "border-yellow-900/20 border-t-yellow-600";
  const shadowGlow = isAmber
    ? "shadow-[0_0_40px_rgba(250,204,21,0.3)]"
    : "shadow-[0_0_30px_rgba(202,138,4,0.2)]";
  const pulseColor = isAmber ? "bg-yellow-400/20" : "bg-yellow-600/20";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full h-full text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
        {/* Spinning outer ring */}
        <div
          className={`absolute inset-0 border-4 rounded-full animate-spin ${ringColor} ${shadowGlow}`}
        ></div>

        {/* Inner pulsing circle */}
        <div
          className={`w-12 h-12 rounded-full animate-pulse ${pulseColor} shadow-[0_0_20px_rgba(250,204,21,0.2)]`}
        ></div>
      </div>

      <h2
        className={`text-4xl font-morganite tracking-[0.2em] mb-3 uppercase ${textColor} drop-shadow-[0_0_10px_rgba(250,204,21,0.3)]`}
      >
        {message}
      </h2>

      <p className="text-yellow-100/40 text-xs font-medium tracking-widest uppercase">
        Establishing Secure Connection...
      </p>
    </div>
  );
};

