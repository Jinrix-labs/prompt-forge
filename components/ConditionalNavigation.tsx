'use client';

import { SignedIn } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { Navigation } from '@/components/Navigation';

export function ConditionalNavigation() {
    const pathname = usePathname();

    if (pathname !== '/') {
        return <Navigation />;
    }

    return (
        <SignedIn>
            <Navigation />
        </SignedIn>
    );
}
