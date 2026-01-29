'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
                    <CardDescription className="text-center">Select your registration type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Link href="/citizens/register" className="block">
                        <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all">
                            <span className="text-lg font-semibold text-blue-700">Senior Citizen</span>
                            <span className="text-sm text-gray-500 font-normal">I want to register myself or a family member</span>
                        </Button>
                    </Link>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p>Are you a Police Officer?</p>
                        <p className="mt-1">Please contact your administrator for account creation.</p>
                    </div>

                    <div className="text-center text-sm text-gray-600 mt-4">
                        Already have an account?{' '}
                        <Link href="/admin/login" className="text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
