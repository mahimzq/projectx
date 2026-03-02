'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Caught:", error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                    <div className="rounded-lg bg-gray-800 p-8 shadow-xl max-w-lg text-center border border-red-500/30">
                        <h2 className="mb-4 text-2xl font-bold text-red-400">Application Error</h2>
                        <p className="mb-6 text-gray-400 text-sm break-all font-mono">
                            {error.message || "An unexpected error occurred in the React Client tree."}
                        </p>
                        <button
                            onClick={() => reset()}
                            className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
