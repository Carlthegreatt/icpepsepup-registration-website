"use client";

import { useActionState, useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { registerAction } from "@/actions/authActions";

interface UserRegisterFormProps {
  nextUrl?: string;
}

export default function UserRegisterForm({ nextUrl }: UserRegisterFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const [state, formAction, isPending] = useActionState(registerAction, null);
  const error = state?.error ?? "";

  const passwordsMismatch =
    password.length > 0 &&
    (confirmPassword.length === 0 || password !== confirmPassword);

  const canGoNext =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0;

  // Shared classes for inputs to keep it clean
  const inputBaseClasses = `
    w-full
    !bg-[rgba(25,25,10,0.8)]
    rounded-xl
    px-4 py-3
    !text-yellow-50 text-sm
    !placeholder:text-yellow-700/50
    outline-none
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

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
      <form action={step === 2 ? formAction : undefined} className="space-y-5">
        {/* error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3 mb-4">
            <p className="text-red-200 text-xs text-center">{error}</p>
          </div>
        )}

        {step === 1 && (
          <>
            {/* first name */}
            <div className="space-y-2">
              <label className="text-yellow-400 text-[11px] font-medium block uppercase tracking-wider">
                First name
              </label>
              <input
                name="firstName"
                type="text"
                placeholder="Juan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onFocus={() => setFocusedField("firstName")}
                onBlur={() => setFocusedField(null)}
                disabled={isPending}
                className={`${inputBaseClasses} border ${
                  focusedField === "firstName"
                    ? "!border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                    : "!border-yellow-900/50"
                }`}
              />
            </div>

            {/* last name */}
            <div className="space-y-2">
              <label className="text-yellow-400 text-[11px] font-medium block uppercase tracking-wider">
                Last name
              </label>
              <input
                name="lastName"
                type="text"
                placeholder="Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onFocus={() => setFocusedField("lastName")}
                onBlur={() => setFocusedField(null)}
                disabled={isPending}
                className={`${inputBaseClasses} border ${
                  focusedField === "lastName"
                    ? "!border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                    : "!border-yellow-900/50"
                }`}
              />
            </div>

            {/* email */}
            <div className="space-y-2">
              <label className="text-yellow-400 text-[11px] font-medium block uppercase tracking-wider">
                Email
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
                className={`${inputBaseClasses} border ${
                  focusedField === "email"
                    ? "!border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                    : "!border-yellow-900/50"
                }`}
              />
            </div>

            {/* next button */}
            <button
              type="button"
              disabled={isPending || !canGoNext}
              onClick={() => setStep(2)}
              className="
                w-full
                bg-yellow-500/10
                hover:bg-yellow-500/20
                border border-yellow-500/30
                text-yellow-400
                font-bold
                py-3.5
                rounded-xl
                transition-all duration-300
                text-sm
                mt-4
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input type="hidden" name="firstName" value={firstName} />
            <input type="hidden" name="lastName" value={lastName} />
            <input type="hidden" name="email" value={email} />
            {nextUrl && <input type="hidden" name="next" value={nextUrl} />}

            {/* password */}
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
                  className={`${inputBaseClasses} border ${
                    focusedField === "password"
                      ? "!border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                      : "!border-yellow-900/50"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 hover:text-yellow-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* confirm password */}
            <div className="space-y-2">
              <label className="text-yellow-400 text-[11px] font-medium block uppercase tracking-wider">
                Confirm password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField("confirmPassword")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isPending}
                  className={`${inputBaseClasses} border ${
                    focusedField === "confirmPassword"
                      ? "!border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                      : "!border-yellow-900/50"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 hover:text-yellow-400 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-[11px] text-red-400 font-medium">
                  Passwords do not match.
                </p>
              )}
            </div>

            {/* back + submit buttons */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setStep(1)}
                className="
                  w-full
                  bg-transparent
                  border border-yellow-900/40
                  hover:bg-yellow-950/30
                  text-yellow-700
                  hover:text-yellow-500
                  font-semibold
                  py-3.5
                  rounded-xl
                  transition-all duration-200
                  text-sm
                  disabled:opacity-40
                "
              >
                Back
              </button>

              <button
                type="submit"
                disabled={
                  isPending ||
                  passwordsMismatch ||
                  !password ||
                  !confirmPassword
                }
                className="
                  w-full
                  bg-yellow-500/10
                  hover:bg-yellow-500/20
                  border border-yellow-500/30
                  text-yellow-400
                  font-bold
                  py-3.5
                  rounded-xl
                  transition-all duration-300
                  text-sm
                  disabled:opacity-40
                  active:scale-[0.98]
                "
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </>
        )}
      </form>

      {/* Footer Text inside card */}
      <div className="mt-7 pt-6 border-t border-yellow-900/20">
        <p className="text-yellow-600/60 text-[10px] text-center font-medium tracking-wide">
          Join ICPEP SE - PUP Manila community
        </p>
      </div>
    </div>
  );
}
