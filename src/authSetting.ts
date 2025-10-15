import { ExtensionContext, SecretStorage } from "vscode";

export default class AuthSetting {
  private static _instance: AuthSetting;

  constructor(private secretStorage: SecretStorage) {}

  static init(context: ExtensionContext): void {
    /*
        Create instance of new AuthSettings.
        */
    AuthSetting._instance = new AuthSetting(context.secrets);
  }

  static get instance(): AuthSetting {
    /*
        Getter of our AuthSettings existing instance.
        */
    return AuthSetting._instance;
  }

  async storeAuthData(token?: string): Promise<void> {
    /*
        Update values in bugout_auth secret storage.
        */
    if (token) {
      this.secretStorage.store("APIKEY", token);
    }
  }

  async getAuthData(): Promise<string | undefined> {
    /*
        Retrieve data from secret storage.
        */
    return await this.secretStorage.get("APIKEY");
  }

  //https://code.visualstudio.com/api/references/vscode-api#SecretStorage
  //deletes
  async delete(): Promise<void> {
    try {
      await this.secretStorage.delete("APIKEY");
    } catch (e) {
      console.error(e);
    }
  }
}
