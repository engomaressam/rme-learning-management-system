import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

export interface AzureConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  authority: string;
}

export const azureConfig: AzureConfig = {
  clientId: process.env.AZURE_CLIENT_ID || '',
  clientSecret: process.env.AZURE_CLIENT_SECRET || '',
  tenantId: process.env.AZURE_TENANT_ID || '',
  authority: process.env.AZURE_AUTHORITY || `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
};

// Custom authentication provider for Microsoft Graph
class CustomAuthProvider implements AuthenticationProvider {
  private credential: ClientSecretCredential;

  constructor() {
    this.credential = new ClientSecretCredential(
      azureConfig.tenantId,
      azureConfig.clientId,
      azureConfig.clientSecret
    );
  }

  async getAccessToken(): Promise<string> {
    const tokenResponse = await this.credential.getToken([
      'https://graph.microsoft.com/.default'
    ]);
    return tokenResponse?.token || '';
  }
}

// Microsoft Graph client
export const createGraphClient = (): Client => {
  const authProvider = new CustomAuthProvider();
  
  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => {
        return await authProvider.getAccessToken();
      }
    }
  });
};

export const graphClient = createGraphClient(); 