# Web Encrypted Storage

This package provides a mechanism by which you can leverage both the storage and crypto apis of the web to enable secure storage in your application.

## Usage

The example below uses window.localStorage as the storage mechanism, however you can pass any storage provider which supports the web storage api.
For more information please see here: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API>

`npm i web-encrypted-storage`

```js

import { EncryptedWebStorage } from 'web-encrypted-storage';

let config = {
    storage: window.localStorage,           // the storage you wish to use
    password: "yoursupersecretpassword"     // the password to use to give access to your masterKey
}

let storage = new EncryptedWebStorage(config)

```

NOTE: It is critical that you keep the password above safe. Any data encrypted with a master key which is in turn encrypted using the password above will not be retrievable without this password.

## Disclaimer

This software is intended to be a proof of concept and should not be considered production ready. It is provided as is and the author takes no responsibility for data loss or corruption as a result of using this software.

## Licence

Apache 2.0 licence.

### TO DO

* Unit tests