"use client";

import { useActionState, useEffect, useRef } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { loginAction } from "@/actions/authActions";
import { getUserRoleAction } from "@/actions/authActions";
import { getLastViewedEventSlug } from "@/utils/last-viewed-event";
import { useUserStore } from "@/store/useUserStore";

type UserLoginFormProps = { showRegisteredMessage?: boolean };

export default function UserLoginForm({
  showRegisteredMessage,
}: UserLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectDone = useRef(false);

  const [state, formAction, isPending] = useActionState(loginAction, null);
  const error = state?.error ?? "";

  useEffect(() => {
    if (!state?.success || redirectDone.current) return;
    redirectDone.current = true;
    let cancelled = false;
    (async () => {
      const res = await getUserRoleAction();
      if (cancelled) return;
      const data = (res.data ?? {}) as {
        role?: string | null;
        userId?: string | null;
      };

      // Update global store
      const userRole =
        data?.role === "admin"
          ? "admin"
          : data?.role === "user"
            ? "user"
            : null;
      useUserStore.getState().setUser(userRole, data?.userId ?? null);

      if (userRole === "admin") {
        router.replace("/admin/dashboard");
        return;
      }
      const rawNext = searchParams.get("next");
      const nextPath =
        rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
          ? rawNext
          : null;
      if (nextPath) {
        router.replace(nextPath);
        return;
      }
      const lastSlug = getLastViewedEventSlug();
      router.replace(lastSlug ? `/event/${lastSlug}` : "/my-events");
    })();
    return () => {
      cancelled = true;
    };
  }, [state?.success, router, searchParams]);

  return (
    <div
      className="
      relative overflow-hidden
      bg-[rgba(255,255,255,0.03)]
      backdrop-blur-md
      border border-[rgba(255,255,100,0.15)]
      rounded-[24px]
      p-8
      shadow-[0_8px_32px_rgba(0,0,0,0.4)]
    "
    >
      {showRegisteredMessage && (
        <div className="mb-4 rounded-xl bg-yellow-500/10 border border-yellow-400/30 px-4 py-3 text-center">
          <p className="text-yellow-200 text-xs">
            Account created. Sign in to continue.
          </p>
        </div>
      )}

      {state?.success && (
        <div className="mb-4 rounded-xl bg-yellow-500/10 border border-yellow-400/30 px-4 py-3 text-center">
          <p className="text-yellow-200 text-xs">
            Sign in successful. Please wait...
          </p>
        </div>
      )}
      <form action={formAction} className="space-y-5">
        {/* error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-200 text-xs text-center">{error}</p>
          </div>
        )}

        {/* email input */}
        <div className="space-y-2">
          <label className="text-yellow-400 text-[11px] font-medium block uppercase tracking-wider">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            disabled={isPending}
            className={`
              w-full
              !bg-[rgba(25,25,10,0.8)]
              border ${
                focusedField === "email"
                  ? "!border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                  : "!border-yellow-900/50"
              }
              rounded-xl
              px-4 py-3
              !text-yellow-50 text-sm
              !placeholder:text-yellow-700/50
              outline-none
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />
        </div>

        {/* password input */}
        <div className="space-y-2">
          <label className="text-yellow-400 text-[11px] font-medium block uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              disabled={isPending}
              className={`
                w-full
                !bg-[rgba(25,25,10,0.8)]
                border ${
                  focusedField === "password"
                    ? "!border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                    : "!border-yellow-900/50"
                }
                rounded-xl
                px-4 py-3 pr-12
                !text-yellow-50 text-sm
                !placeholder:text-yellow-700/50
                outline-none
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />

            {/* show password toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="text-right pt-1">
            <Link
              href="/forgot-password"
              className="text-[11px] text-yellow-500/80 hover:text-yellow-400 underline-offset-4 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* submit button */}
        <button
          type="submit"
          disabled={isPending || !!state?.success}
          className="
            w-full
            bg-yellow-500/10
            hover:bg-yellow-500/20
            border border-yellow-500/30
            hover:border-yellow-500/50
            text-yellow-400
            font-bold
            py-3.5
            rounded-xl
            transition-all duration-300
            text-sm
            mt-4
            disabled:opacity-40
            disabled:cursor-not-allowed
            active:scale-[0.98]
          "
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </span>
          ) : state?.success ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting...
            </span>
          ) : (
            "SIGN IN"
          )}
        </button>
      </form>

      {/* Footer Text inside card */}
      <div className="mt-7 pt-6 border-t border-yellow-900/20">
        <p className="text-yellow-600/60 text-[10px] text-center font-medium tracking-widest uppercase">
          Welcome back · ICPEP SE - PUP Manila
        </p>
      </div>
    </div>
  );
}
