'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Local Error Caught:", error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] w-full flex-col items-center justify-center space-y-4 p-8">
            <div className="rounded-lg bg-red-900/20 border border-red-500/50 p-6 text-center max-w-lg">
                <h2 className="mb-2 text-xl font-bold text-red-500">Something went wrong!</h2>
                <p className="mb-6 text-sm text-gray-400 break-words font-mono">
                    {error.message || "An unexpected rendering error occurred."}
                </p>
                <button
                    onClick={() => reset()}
                    className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}
