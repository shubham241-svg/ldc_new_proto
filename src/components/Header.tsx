import { useMsal } from '@azure/msal-react';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
    const { instance } = useMsal();

    const handleLogout = () => {
        instance.logoutRedirect({
            postLogoutRedirectUri: 'http://localhost:3000/',
        });
    };

    return (
        <header className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-lg font-semibold">{title}</h1>
                    {subtitle && (
                        <p className="text-sm text-primary-foreground/70">{subtitle}</p>
                    )}
                </div>
            </div>
            <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-primary-foreground hover:bg-white/10 gap-2"
            >
                <LogOut className="w-4 h-4" />
                Logout
            </Button>
        </header>
    );
}
