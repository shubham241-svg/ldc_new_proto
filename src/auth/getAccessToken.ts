// getAccessToken.ts
import { type AccountInfo } from '@azure/msal-browser';
import { PublicClientApplication } from '@azure/msal-browser';
import { tokenRequest } from '@/auth/msalConfig'; // scopes: ['User.Read'] or your API scope

export async function getAccessToken(
  pca: PublicClientApplication,
  overrides?: { scopes?: string[]; account?: AccountInfo | null }
): Promise<string> {
  const account = overrides?.account ?? pca.getActiveAccount();
  const scopes = overrides?.scopes ?? tokenRequest.scopes;

  if (!account) {
    // Not signed in yet — do an interactive login and set active account
    const loginResp = await pca.loginPopup({ scopes });
    if (loginResp.account) pca.setActiveAccount(loginResp.account);
  }

  try {
    const silent = await pca.acquireTokenSilent({
      scopes,
      account: pca.getActiveAccount()!,
    });
    return silent.accessToken;
  } catch {
    const interactive = await pca.acquireTokenPopup({ scopes });
    if (interactive.account) pca.setActiveAccount(interactive.account);
    return interactive.accessToken;
  }
}
