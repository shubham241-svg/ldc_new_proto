import { ArrowRight, FileCheck, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReviewItem } from '@/data/sampleData';

interface ReviewCardProps {
    item: ReviewItem;
    onAction?: (id: string) => void;
}

export function ReviewCard({ item, onAction }: ReviewCardProps) {
    const isPending = item.status === 'pending';

    return (
        <div className="flex items-center justify-between py-4 px-2 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors duration-200 rounded-lg group">
            <div className="flex items-center gap-3">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPending
                            ? 'bg-primary/10 text-primary'
                            : 'bg-primary/15 text-primary'
                        }`}
                >
                    {isPending ? (
                        <ClipboardList className="w-5 h-5" />
                    ) : (
                        <FileCheck className="w-5 h-5" />
                    )}
                </div>
                <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {item.date} · {item.recordCount} records
                    </p>
                </div>
            </div>
            <Button
                size="sm"
                variant={isPending ? 'default' : 'outline'}
                onClick={() => onAction?.(item.id)}
                className="gap-1.5"
            >
                {isPending ? 'Validate' : 'View'}
                <ArrowRight className="w-3.5 h-3.5" />
            </Button>
        </div>
    );
}
