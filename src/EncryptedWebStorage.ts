import { CryptoHelper } from "./CryptoHelper";
import { PersistentStore, PersistedData } from "./PersistentStore";
import { utils } from "./utils";

export class Storage implements PersistentStore<PersistedData> {
    public storage: PersistentStore<PersistedData>;
    private crypto: CryptoHelper;
    private masterKey: CryptoKey | undefined;
    private password: string;

    constructor(storage: PersistentStore<PersistedData>, encryptionPassword: string) {
        this.password = encryptionPassword;
        this.storage = storage;
        this.crypto = new CryptoHelper(this.storage);
    }

    /**
     * Retrieves an encrypted item from storage.
     * First extracts the initialisation vector that was previously prepended to the stored encrypted data
     * @param key the key to use to retreive your value
     */
    public async getItem(key: string) {
        if (!this.masterKey) {
            await this.init();
        }
        const retrieved = await this.storage.getItem(key);
        if (retrieved) {
            if (this.masterKey) {
                this.crypto.decrypt(retrieved.toString(), this.masterKey).then(result => {
                    return utils.arrayToStr(result);
                });
            }
        }
        return retrieved;
    }

    /**
     * Stores an ecrypted item in storage. Generates a random initialisation vector for each encryption.
     * This value is then prepended to the data and also stored for later decryption.
     * @param key the key to use to store your value
     * @param data the data to persist
     */
    public async setItem(key: string, data: PersistedData) {
        if (!this.masterKey) {
            await this.init();
        }
        if (data) {
            if (this.masterKey) {
                const iv = await crypto.getRandomValues(new Uint8Array(12));
                this.crypto.encrypt(data.toString(), this.masterKey, iv).then(result => {
                    this.storage.setItem(key, iv + ":" + utils.arrayToStr(result));
                });
            }
        }
    }

    /**
     * Remove an item from storage
     * @param key the key to use to remove your value
     */
    public removeItem(key: string) {
        this.storage.removeItem(key);
    }

    private async init() {
        const masterKey = await this.storage.getItem("masterKey");
        if (masterKey) {
            const keyAsString = masterKey.toString();
            const parsedKey = keyAsString.slice(keyAsString.indexOf(":") + 1);
            const salt = await this.crypto.getSalt();
            if (salt) {
                await this.crypto.unwrapCryptoKey(this.password, utils.strToArray(parsedKey), salt)
                .then(unwrapped => {
                    if (unwrapped) {
                        this.masterKey = unwrapped;
                    }
                });
            }
        } else {
            await this.crypto.generateKey().then( async result => {
               this.masterKey = result;
               await this.crypto.wrapCryptoKey(this.password, result);
            });
        }
    }
}
