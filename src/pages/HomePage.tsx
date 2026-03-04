import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMsal, useAccount } from '@azure/msal-react';
import { tokenRequest } from '@/auth/msalConfig';
import { Header } from '@/components/Header';
import { ReviewCard } from '@/components/ReviewCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { reviewItems } from '@/data/sampleData';
import { ClipboardList, User, Mail, CheckCircle } from 'lucide-react';

type TabType = 'pending' | 'validated';

export function HomePage() {
    const { instance, accounts } = useMsal();
    const account = useAccount(accounts[0] || {});
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('pending');

    const pendingItems = reviewItems.filter((r) => r.status === 'pending');
    const validatedItems = reviewItems.filter((r) => r.status === 'validated');

    const handleAction = (id: string) => {
        navigate('/table');
    };

    return (
        <div className="min-h-screen bg-background">
            <Header title="Home Page" subtitle="Manage your reviews" />

            <main className="max-w-4xl mx-auto p-6 space-y-6">
                {/* User Info Card */}
                {account && (
                    <Card className="border-0 shadow-sm bg-gradient-to-r from-primary/5 to-transparent">
                        <CardContent className="py-4 px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground flex items-center gap-2">
                                            {account.name || 'User'}
                                        </p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3.5 h-3.5" />
                                                {account.username || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reviews Card */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl">My Reviews</CardTitle>
                        </div>
                        <CardDescription>
                            Review and validate warehouse operations
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* Tab Switcher */}
                        <div className="flex bg-muted rounded-xl p-1 mb-6">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === 'pending'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setActiveTab('validated')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === 'validated'
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Validated
                            </button>
                        </div>

                        {/* Review Items */}
                        <div className="space-y-1">
                            {activeTab === 'pending' ? (
                                pendingItems.length > 0 ? (
                                    pendingItems.map((item) => (
                                        <ReviewCard
                                            key={item.id}
                                            item={item}
                                            onAction={handleAction}
                                        />
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">
                                        No pending reviews
                                    </p>
                                )
                            ) : validatedItems.length > 0 ? (
                                validatedItems.map((item) => (
                                    <ReviewCard
                                        key={item.id}
                                        item={item}
                                        onAction={handleAction}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No validated reviews
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
