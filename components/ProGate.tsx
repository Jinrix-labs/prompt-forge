'use client';

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { UpgradeButton } from './UpgradeButton'

interface ProGateProps {
    children: React.ReactNode
    feature?: string
}

export function ProGate({ children, feature = 'this feature' }: ProGateProps) {
    const { userId } = useAuth()
    const [isPro, setIsPro] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return
        }

        const checkProStatus = async () => {
            try {
                const res = await fetch('/api/check-pro')
                const data = await res.json()
                setIsPro(data.isPro)
            } catch (error) {
                console.error('Failed to check pro status:', error)
            } finally {
                setLoading(false)
            }
        }

        checkProStatus()
    }, [userId])

    if (loading) {
        return <div className="opacity-50">{children}</div>
    }

    if (!isPro) {
        return (
            <div className="relative">
                <div className="opacity-30 pointer-events-none blur-sm">{children}</div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gray-900/95 p-6 rounded-lg border border-cyan-500 text-center max-w-sm">
                        <div className="text-2xl mb-2">🔒</div>
                        <h3 className="text-lg font-bold text-white mb-2">Pro Feature</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Upgrade to Pro to unlock {feature}
                        </p>
                        <UpgradeButton />
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}


