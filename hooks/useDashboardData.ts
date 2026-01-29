'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { syncEngine } from '@/lib/sync';
import { storage } from '@/lib/storage';

export function useDashboardData() {
    const [user, setUser] = useState<any>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        // Sanitize session from other products
        if (typeof window !== 'undefined') {
            const ghostKeys = ['peck_session', 'pec-os-token', 'current_farm'];
            let cleared = false;
            ghostKeys.forEach(k => {
                if (localStorage.getItem(k)) {
                    localStorage.removeItem(k);
                    cleared = true;
                }
            });
            if (cleared) {
                console.log("Session sanitized: Residual data from other products removed.");
                window.location.reload();
            }
        }

        async function getUserAndSync() {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Auto-pull latest data
                try {
                    await syncEngine.pullRemoteToLocal(user.id);

                    // Check onboarding status
                    const prefs = storage.getPreferences();
                    if (!prefs.onboardingCompleted) {
                        setShowOnboarding(true);
                    }
                } catch (e) {
                    console.error("Auto-sync failed", e);
                }
            } else {
                // Guest mode, still check local storage
                const prefs = storage.getPreferences();
                if (!prefs.onboardingCompleted) {
                    setShowOnboarding(true);
                }
            }
        }
        getUserAndSync();
    }, [supabase]);

    return { user, showOnboarding, setShowOnboarding };
}
