'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProtectedRoute } from '@/components/auth/protected-route';

function CitizenFeedbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [visitId, setVisitId] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const id = searchParams.get('visitId');
        if (id) setVisitId(id);
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!visitId) {
            setError('Visit ID is missing.');
            return;
        }
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await apiClient.submitMyFeedback({
                visitId,
                rating,
                comment
            });

            if (response.success) {
                toast({ title: 'Feedback Submitted', description: 'Thank you for your feedback.' });
                router.push('/citizen-portal/visits');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to submit feedback');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedRoute permissionCode="feedback.submit">
            <div className="max-w-md mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Share Feedback</h1>
                    <p className="text-muted-foreground">How was your experience with the police visit?</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Rate Your Experience</CardTitle>
                        <CardDescription>Your feedback helps us improve our service.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`rounded-full p-1 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-slate-200'
                                            }`}
                                    >
                                        <Star className="h-8 w-8 fill-current" />
                                    </button>
                                ))}
                            </div>
                            <div className="text-center text-sm font-medium text-slate-600">
                                {rating === 1 && 'Very Poor'}
                                {rating === 2 && 'Poor'}
                                {rating === 3 && 'Average'}
                                {rating === 4 && 'Good'}
                                {rating === 5 && 'Excellent'}
                            </div>

                            <div className="space-y-2">
                                <Label>Comments (Optional)</Label>
                                <Textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us more about your experience..."
                                    className="min-h-[100px]"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Feedback'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ProtectedRoute>
    );
}

export default function CitizenFeedbackPage() {
    return (
        <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>}>
            <CitizenFeedbackContent />
        </Suspense>
    );
}
