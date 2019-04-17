import { PersistentStore, PersistedData } from "./PersistentStore";
export declare class Storage implements PersistentStore<PersistedData> {
    storage: PersistentStore<PersistedData>;
    private crypto;
    private masterKey;
    private password;
    constructor(storage: PersistentStore<PersistedData>, encryptionPassword: string);
    /**
     * Retrieves an encrypted item from storage.
     * First extracts the initialisation vector that was previously prepended to the stored encrypted data
     * @param key the key to use to retreive your value
     */
    getItem(key: string): Promise<PersistedData>;
    /**
     * Stores an ecrypted item in storage. Generates a random initialisation vector for each encryption.
     * This value is then prepended to the data and also stored for later decryption.
     * @param key the key to use to store your value
     * @param data the data to persist
     */
    setItem(key: string, data: PersistedData): Promise<void>;
    /**
     * Remove an item from storage
     * @param key the key to use to remove your value
     */
    removeItem(key: string): void;
    private init;
}
