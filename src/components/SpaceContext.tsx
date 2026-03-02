"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Space {
    id: string;
    name: string;
}

interface SpaceContextType {
    spaces: Space[];
    activeSpaceId: string | null;
    setActiveSpaceId: (id: string | null) => void;
    refreshSpaces: () => Promise<void>;
    loading: boolean;
}

const SpaceContext = createContext<SpaceContextType>({
    spaces: [],
    activeSpaceId: null,
    setActiveSpaceId: () => { },
    refreshSpaces: async () => { },
    loading: true,
});

export const useSpace = () => useContext(SpaceContext);

export const SpaceProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session } = useSession();
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [activeSpaceId, setActiveSpaceIdState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSpaces = useCallback(async () => {
        try {
            const res = await fetch("/api/spaces");
            if (res.ok) {
                const data = await res.json();
                setSpaces(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Failed to fetch spaces:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (session?.user) {
            refreshSpaces();
        } else {
            setLoading(false);
        }
    }, [session, refreshSpaces]);

    // Restore active space from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("activeSpaceId");
        if (stored) {
            setActiveSpaceIdState(stored);
        }
    }, []);

    // Auto-select first space if none selected
    useEffect(() => {
        if (!activeSpaceId && spaces.length > 0) {
            const stored = localStorage.getItem("activeSpaceId");
            const validStored = stored && spaces.find(s => s.id === stored);
            setActiveSpaceIdState(validStored ? stored : spaces[0].id);
        }
    }, [spaces, activeSpaceId]);

    const setActiveSpaceId = (id: string | null) => {
        setActiveSpaceIdState(id);
        if (id) {
            localStorage.setItem("activeSpaceId", id);
        } else {
            localStorage.removeItem("activeSpaceId");
        }
    };

    return (
        <SpaceContext.Provider value={{ spaces, activeSpaceId, setActiveSpaceId, refreshSpaces, loading }}>
            {children}
        </SpaceContext.Provider>
    );
};
