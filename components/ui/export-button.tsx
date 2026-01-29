import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { resolveApiBaseUrl } from '@/lib/api-base';

interface ExportButtonProps {
    type: 'citizens' | 'visits' | 'reports';
    filters?: Record<string, any>;
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
}

export function ExportButton({ type, filters, label = 'Export', variant = 'outline', className }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) queryParams.append(key, value);
                });
            }

            const baseUrl = resolveApiBaseUrl();
            const response = await fetch(`${baseUrl}/export/${type}?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_export_${Date.now()}.${type === 'citizens' ? 'csv' : type === 'visits' ? 'xlsx' : 'pdf'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({
                title: "Export Successful",
                description: `Your ${type} export has been downloaded.`,
            });
        } catch (error) {
            console.error('Export error:', error);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "There was an error generating your export. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant={variant} onClick={handleExport} disabled={loading} className={className}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {loading ? 'Exporting...' : label}
        </Button>
    );
}
