import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@/auth/msalConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export function LoginPage() {
    const { instance } = useMsal();

    const handleLogin = async () => {
        try {
            await instance.loginRedirect(loginRequest);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23228B22' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <Card className="w-full max-w-md relative shadow-xl border-0 bg-white/80 dark:bg-card/80 backdrop-blur-xl">
                <CardHeader className="text-center pb-2 pt-10">
                    <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                        <ShieldCheck className="w-9 h-9 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        SA - LDC Gen AI (POC)
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                        Sign in to access your matching dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 pb-4 px-8">
                    <Button
                        onClick={handleLogin}
                        size="lg"
                        className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                        </svg>
                        Login with Microsoft
                    </Button>
                </CardContent>

                <CardFooter className="flex flex-col items-center gap-3 pb-8 pt-2">
                    <p className="text-xs text-muted-foreground">
                        Powered by Cargill Data Solutions
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        Need help? Contact your administrator
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
