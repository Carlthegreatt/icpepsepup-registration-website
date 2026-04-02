"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { forgotPasswordAction } from "@/actions/authActions";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    null,
  );

  const error = state?.error ?? "";
  const successMessage =
    state?.success && state?.data && "message" in state.data
      ? (state.data.message as string)
      : "";

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
      <form action={formAction} className="space-y-5">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-200 text-xs text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-yellow-200 text-xs text-center">
              {successMessage}
            </p>
          </div>
        )}

        {/* Email Input */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
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
              Sending reset link...
            </span>
          ) : (
            "Send Reset Link"
          )}
        </button>
      </form>

      {/* Footer Text */}
      <div className="mt-7 pt-6 border-t border-yellow-900/20">
        <p className="text-yellow-600/60 text-[10px] text-center font-medium tracking-wide">
          We will send a secure, single-use reset link if your account exists.
        </p>
      </div>
    </div>
  );
}
