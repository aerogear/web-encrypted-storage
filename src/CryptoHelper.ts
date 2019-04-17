import { PersistentStore, PersistedData } from "./PersistentStore";
import { utils } from "./utils";

export class CryptoHelper {
    private storage: PersistentStore<PersistedData>;

    constructor(storage: PersistentStore<PersistedData>) {
        this.storage = storage;
    }
    // wrap the master key and store it under the "masterKey" key.
    // when wrapped it can be stored safely and later unwrapped
    public async wrapCryptoKey(password: string, keyToWrap: CryptoKey) {
        // get the key encryption key
        const keyMaterial = await this.getKeyMaterial(password);
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        if (salt && keyMaterial) {
            const wrappingKey = await this.deriveWrappingKey(keyMaterial, salt);
            return window.crypto.subtle.wrapKey(
                "raw",
                keyToWrap,
                wrappingKey,
                "AES-KW"
            ).then(result => {
                this.storage.setItem("masterKey", utils.arrayToStr(salt) + ":" + utils.arrayToStr(result));
                return result;
            }, error => {
                console.error("Unable to wrap crypto key", { error });
            });
        }
    }

    // unwrap the safely stored masterKey from storage to be used for decryption
    public async unwrapCryptoKey(password: string, masterKey: ArrayBuffer, salt: Uint8Array) {
        const key = await this.getKeyMaterial(password);
        if (salt && key) {
            if (masterKey) {
                const unwrappingKey = await this.deriveWrappingKey(key, salt);

                return await window.crypto.subtle.unwrapKey(
                    "raw",
                    masterKey,
                    unwrappingKey,
                    "AES-KW",
                    "AES-GCM",
                    true,
                    ["encrypt", "decrypt"]
                ).then((result) => {
                    return result;
                }, error => {
                    console.error("Unable to unwrap crypto key", { error });
                });
            }
        }
    }

    // generate a PBKDF2 key from the user provided password. Without the password this key
    // (and therefore the encrypted data) cannot be retreived
    public async getKeyMaterial(password: string) {
        return await window.crypto.subtle.importKey(
            "raw",
            utils.strToArray(password),
            { name: "PBKDF2", length: 256 },
            false,
            ["deriveBits", "deriveKey"]
        ).then(result => {
            return result;
        }, error => {
            console.error("Unable to wrap crypto key", { error });
        });
    }

    // create a key to use to wrap the masterKey so it can be safely stored
    public async deriveWrappingKey(keyMaterial: CryptoKey, salt: Uint8Array): Promise<CryptoKey> {
        return await window.crypto.subtle.deriveKey(
            {
                "name": "PBKDF2",
                salt,
                "iterations": 100000,
                "hash": "SHA-256"
            },
            keyMaterial,
            { "name": "AES-KW", "length": 256 },
            true,
            ["wrapKey", "unwrapKey"]
        );
    }

    public async generateKey(): Promise<CryptoKey> {
        return await window.crypto.subtle.generateKey(
            {
                name: "AES-GCM",
                length: 256
            },
            true,
            ["encrypt", "decrypt"]
        ).then(result => result);
    }

    public decrypt(data: string, masterKey: CryptoKey): PromiseLike<ArrayBuffer> {
        const { iv, cipherText } = this.splitIVFromCipherText(data);
        return window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, masterKey, utils.strToArray(cipherText));
    }

    public encrypt(data: string, masterKey: CryptoKey, iv: Uint8Array): PromiseLike<ArrayBuffer> {
        return window.crypto.subtle.encrypt({
            name: "AES-GCM",
            iv
        },
            masterKey,
            utils.strToArray(data.toString())
        ).then(cipherText => cipherText);
    }

    // fetches the salt from the stored masterKey and returns it
    public async getSalt() {
        const masterKey = await this.storage.getItem("masterKey");
        if (masterKey) {
            const keyWithSalt = masterKey.toString();
            const saltStr = keyWithSalt.substr(0, keyWithSalt.indexOf(":"));
            // const cipherText = keyWithSalt.slice(keyWithSalt.indexOf(":") + 1);
            const salt = utils.strToArray(saltStr);
            return salt;
        }
    }

    public splitIVFromCipherText(cipherTextWithIv: string) {
        const cipherText = cipherTextWithIv.slice(cipherTextWithIv.indexOf(":") + 1);
        const iv = utils.strToArray(cipherTextWithIv.substr(0, cipherTextWithIv.indexOf(":")));
        return { iv, cipherText };
    }

}
