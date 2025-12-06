"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="text-8xl mb-6">😵</div>
        <h1 className="text-5xl font-bold mb-4 text-error">Oops! Something went wrong</h1>
        <p className="text-xl opacity-70 mb-8">
          We encountered an unexpected error. Don't worry, it's not your fault!
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button onClick={() => reset()} className="btn btn-primary btn-lg">
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary btn-lg">
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="text-sm opacity-50 mt-8">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
