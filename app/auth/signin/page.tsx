"use client";

import { signIn, getCsrfToken } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useT } from "@/hooks/useT";

export default function SignInPage({ searchParams }: { searchParams: { callbackUrl?: string; error?: string } }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const error = searchParams?.error;
  const callbackUrl = searchParams?.callbackUrl ?? "/account";
  const t = useT();

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token || null));
  }, []);

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "OAuthAccountNotLinked":
        return t("auth.error.OAuthAccountNotLinked");
      case "OAuthCreateAccount":
        return t("auth.error.OAuthCreateAccount");
      case "AccessDenied":
        return t("auth.error.AccessDenied");
      case "OAuthSignin":
        return t("auth.error.OAuthSignin");
      case "Callback":
      case "OAuthCallback":
      case "CallbackRouteError":
        return t("auth.error.OAuthCallback");
      case "Configuration":
        return t("auth.error.Configuration");
      case "EmailCreateAccount":
        return t("auth.error.EmailCreateAccount");
      case "CredentialsSignin":
        return t("auth.error.CredentialsSignin");
      default:
        return t("auth.error.generic", { error: errorCode });
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold">{t("auth.signIn.title")}</h1>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {getErrorMessage(error)}
        </div>
      )}

      {/* Google */}
      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full rounded-md border px-4 py-2 hover:bg-gray-50 transition-colors"
      >
        {t("auth.signIn.continueWithGoogle")}
      </button>

      {/* Divider */}
      <div className="my-6 text-center text-sm text-gray-500">{t("auth.signIn.or")}</div>

      {/* Credentials (only works if CredentialsProvider is enabled) */}
      <form method="post" action="/api/auth/callback/credentials" className="space-y-3">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken ?? undefined} />
        <input name="callbackUrl" type="hidden" defaultValue={callbackUrl} />
        <input 
          name="email" 
          type="email" 
          required 
          placeholder={t("auth.signIn.emailPlaceholder")}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <input 
          name="password" 
          type="password" 
          required 
          placeholder={t("auth.signIn.passwordPlaceholder")}
          className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <button 
          type="submit" 
          className="w-full rounded-md bg-black px-4 py-2 text-white hover:opacity-90 transition-opacity"
        >
          {t("auth.signIn.continueWithEmail")}
        </button>
      </form>

      {/* Sign up link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t("auth.signIn.noAccount")}{' '}
          <Link href="/auth/signup" className="font-medium text-black hover:underline">
            {t("auth.signIn.signUpLink")}
          </Link>
        </p>
      </div>

      {/* Back link */}
      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          {t("auth.signIn.backToHome")}
        </Link>
      </div>
    </main>
  );
}