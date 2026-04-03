import Image from "next/image";
import Link from "next/link";
import AdminLoginBackground from "@/components/admin/AdminLoginBackground";
import UserRegisterForm from "@/components/users/UserRegisterForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextUrl = typeof next === "string" ? next : undefined;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0a0a05]">
      {/* Background Layers (reuse admin login background) */}
      <AdminLoginBackground />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo and Title */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block mb-4 max-h-[60px]">
            <Image
              src="/images/logos/ICPEP-logo-1.png"
              alt="ICPEP SE - PUP Manila"
              width={96}
              height={90}
              className="opacity-95 brightness-110"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
          <h1 className="text-[40px] sm:text-[48px] md:text-[56px] font-bold text-[#f5f5f5] tracking-tight leading-none">
            Sign Up
          </h1>
          <p className="text-yellow-500 text-[11px] tracking-[0.3em] uppercase font-bold drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
            ICPEP SE - PUP Manila
          </p>
        </div>

        {/* Register Card */}
        <UserRegisterForm nextUrl={nextUrl} />

        {/* Sign in link */}
        <p className="mt-6 text-center text-[11px] text-yellow-100/50">
          Already have an account?{" "}
          <Link
            href="/"
            className="text-yellow-400 hover:text-yellow-200 underline-offset-4 hover:underline font-semibold transition-colors"
          >
            Sign In
          </Link>
        </p>

        {/* Bottom Text */}
        <p className="text-yellow-100/40 text-[10px] text-center mt-6 font-medium tracking-wide">
          Powered by ICPEP SE - PUP Manila &copy; 2026
        </p>
      </div>
    </div>
  );
}
