import Image from "next/image";
import Link from "next/link";
import AdminLoginBackground from "@/components/admin/AdminLoginBackground";
import UserLoginForm from "@/components/users/UserLoginForm";

type PageProps = { searchParams: Promise<{ registered?: string }> };

export default async function Home({ searchParams }: PageProps) {
  const { registered } = await searchParams;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Layers */}
      <AdminLoginBackground />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo and Title */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block mb-4">
            <Image
              src="/images/logos/adph-logo.png"
              alt="Arduino Day Philippines"
              width={96}
              height={96}
              className="opacity-95"
            />
          </div>
          <h1 className="text-[40px] sm:text-[48px] md:text-[56px] font-bold text-[#f5f5f5] tracking-tight leading-none">
            Login
          </h1>
          <p className="text-[#5dd8d8] text-[11px] tracking-[0.3em] uppercase font-semibold">
            Arduino Day Philippines 2026
          </p>
        </div>

        {/* Login Card */}
        <UserLoginForm showRegisteredMessage={registered === "1"} />

        {/* Sign up link */}
        <p className="mt-4 text-center text-[11px] text-[rgba(200,230,230,0.75)]">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#6dd8d8] hover:text-[#8de5e5] underline-offset-4 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>

        {/* Bottom Text */}
        <p className="text-[rgba(255,255,255,0.25)] text-[10px] text-center mt-5 font-medium">
          Powered by Arduino Community Philippines
        </p>
      </div>
    </div>
  );
}
