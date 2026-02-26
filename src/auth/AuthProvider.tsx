import { type ReactNode, useEffect, useState } from 'react';
import {
    PublicClientApplication,
    EventType,
    type EventMessage,
    type AuthenticationResult,
} from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeMsal = async () => {
            try {
                await msalInstance.initialize();

                // Handle redirect promise
                const response = await msalInstance.handleRedirectPromise();
                if (response) {
                    msalInstance.setActiveAccount(response.account);
                }

                // Set active account if not already set
                if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
                    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
                }

                // Listen for sign-in events
                msalInstance.addEventCallback((event: EventMessage) => {
                    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
                        const payload = event.payload as AuthenticationResult;
                        msalInstance.setActiveAccount(payload.account);
                    }
                });

                setIsInitialized(true);
            } catch (error) {
                console.error('MSAL initialization failed:', error);
                setIsInitialized(true); // Still render the app so login page is visible
            }
        };

        initializeMsal();
    }, []);

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground text-sm">Initializing...</p>
                </div>
            </div>
        );
    }

    return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}

export { msalInstance };
