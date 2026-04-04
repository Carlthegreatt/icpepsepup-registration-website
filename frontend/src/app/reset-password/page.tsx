import Image from "next/image";
import Link from "next/link";
import AdminLoginBackground from "@/components/admin/AdminLoginBackground";
import ResetPasswordForm from "@/components/users/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#0a0a05]">
      <AdminLoginBackground />

      <div className="relative z-10 w-full max-w-[420px]">
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
          <h1 className="text-[36px] sm:text-[44px] md:text-[48px] font-bold text-[#f5f5f5] tracking-tight leading-none">
            Set New Password
          </h1>
          <p className="text-yellow-500 text-[11px] tracking-[0.3em] uppercase font-bold drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]">
            Finish account recovery
          </p>
        </div>

        <ResetPasswordForm />

        <p className="mt-6 text-center text-[11px] text-yellow-100/50">
          Need to request another link?{" "}
          <Link
            href="/forgot-password"
            className="text-yellow-400 hover:text-yellow-200 underline-offset-4 hover:underline font-semibold transition-colors"
          >
            Forgot Password
          </Link>
        </p>
      </div>
    </div>
  );
}
