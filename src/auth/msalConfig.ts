import { type Configuration, LogLevel } from '@azure/msal-browser';

const clientId = import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id-here';
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID || 'common';

export const msalConfig: Configuration = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: 'http://localhost:3000/',
        postLogoutRedirectUri: 'http://localhost:3000/',
        navigateToLoginRequestUrl: false,
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
                if (containsPii) return;
                switch (level) {
                    case LogLevel.Error:
                        console.error(message);
                        break;
                    case LogLevel.Warning:
                        console.warn(message);
                        break;
                    case LogLevel.Info:
                        console.info(message);
                        break;
                    case LogLevel.Verbose:
                        console.debug(message);
                        break;
                }
            },
            logLevel: LogLevel.Warning,
        },
    },
};

export const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'User.Read'],
};

export const tokenRequest = {
    scopes: ['User.Read'],
};
