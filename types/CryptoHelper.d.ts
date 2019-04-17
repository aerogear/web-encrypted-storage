import { PersistentStore, PersistedData } from "./PersistentStore";
export declare class CryptoHelper {
    private storage;
    constructor(storage: PersistentStore<PersistedData>);
    wrapCryptoKey(password: string, keyToWrap: CryptoKey): Promise<void | ArrayBuffer>;
    unwrapCryptoKey(password: string, masterKey: ArrayBuffer, salt: Uint8Array): Promise<void | CryptoKey>;
    getKeyMaterial(password: string): Promise<void | CryptoKey>;
    deriveWrappingKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey>;
    generateKey(): Promise<CryptoKey>;
    decrypt(data: string, masterKey: CryptoKey): PromiseLike<ArrayBuffer>;
    encrypt(data: string, masterKey: CryptoKey, iv: Uint8Array): PromiseLike<ArrayBuffer>;
    getSalt(): Promise<Uint8Array | undefined>;
    splitIVFromCipherText(cipherTextWithIv: string): {
        iv: Uint8Array;
        cipherText: string;
    };
}
