import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-12 w-12 text-red-600" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600 mb-8">
                    You do not have permission to access this page. Please contact your administrator if you believe this is an error.
                </p>
                <div className="flex gap-4 justify-center">
                    <Button asChild variant="default">
                        <Link href="/">Return Home</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/admin/login">Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
