import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLoginBackground from "@/components/admin/AdminLoginBackground";
import UserLoginForm from "@/components/users/UserLoginForm";
import { getUserRole } from "@/services/authService";

type PageProps = {
  searchParams: Promise<{ registered?: string; next?: string }>;
};

export default async function Home({ searchParams }: PageProps) {
  const { registered, next } = await searchParams;
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : null;
  const { role } = await getUserRole();

  if (safeNext && role) {
    redirect(safeNext);
  }

  if (role === "admin") {
    redirect("/admin/dashboard");
  }

  if (role === "user") {
    redirect("/my-events");
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0a0a05]">
      {/* Background Layers */}
      {/* NOTE: Ensure AdminLoginBackground uses yellow/gold glows instead of emerald */}
      <AdminLoginBackground />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo and Title */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block mb-4 max-h-[60px]">
            <Image
              src="/images/logos/ICPEP-logo 1.png"
              alt="Arduino Day Philippines"
              width={96}
              height={90}
              className="opacity-95 brightness-110"
              style={{ objectFit: "cover", objectPosition: "center" }}
            />
          </div>
          <h1 className="text-[40px] sm:text-[48px] md:text-[56px] font-bold text-[#f5f5f5] tracking-tight leading-none">
            Sign In
          </h1>
          <p className="text-yellow-500 text-[11px] tracking-[0.3em] uppercase font-bold drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
            ICPEP SE - PUP Manila
          </p>
        </div>

        {/* Login Card */}
        <UserLoginForm showRegisteredMessage={registered === "1"} />

        {/* Sign up link */}
        <p className="mt-6 text-center text-[11px] text-yellow-100/50">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-yellow-400 hover:text-yellow-200 underline-offset-4 hover:underline font-semibold transition-colors"
          >
            Sign Up
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
