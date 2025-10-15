"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthSetting {
    secretStorage;
    static _instance;
    constructor(secretStorage) {
        this.secretStorage = secretStorage;
    }
    static init(context) {
        /*
            Create instance of new AuthSettings.
            */
        AuthSetting._instance = new AuthSetting(context.secrets);
    }
    static get instance() {
        /*
            Getter of our AuthSettings existing instance.
            */
        return AuthSetting._instance;
    }
    async storeAuthData(token) {
        /*
            Update values in bugout_auth secret storage.
            */
        if (token) {
            this.secretStorage.store("APIKEY", token);
        }
    }
    async getAuthData() {
        /*
            Retrieve data from secret storage.
            */
        return await this.secretStorage.get("APIKEY");
    }
    //https://code.visualstudio.com/api/references/vscode-api#SecretStorage
    //deletes
    async delete() {
        try {
            await this.secretStorage.delete("APIKEY");
        }
        catch (e) {
            console.error(e);
        }
    }
}
exports.default = AuthSetting;
//# sourceMappingURL=authSetting.js.map