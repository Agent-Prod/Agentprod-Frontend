'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

function SuccessPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    useEffect(() => {
        if (sessionId?.startsWith('cs_')) {
            const timeout = setTimeout(() => {
                router.push('/')
            }, 5000)

            return () => clearTimeout(timeout)
        } else {
            router.push('/')
        }
    }, [sessionId, router])

    if (!sessionId?.startsWith('cs_')) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
                <div className="flex justify-center mb-4">
                    <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Payment Successful!
                </h1>
                <p className="text-gray-600 mb-4">
                    Thank you for your purchase. You will be redirected to the homepage in a few seconds.
                </p>
                <div className="animate-pulse inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full">
                    Redirecting...
                </div>
            </div>
        </div>
    )
}

export default SuccessPage