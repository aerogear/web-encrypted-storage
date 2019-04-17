function arrayToStr(buf: ArrayBuffer) {
    const a = new Uint8Array(buf);
    return String.fromCharCode.apply(String, Array.from(a));
}

function strToArray(str: string) {
    const result = [];
    for (let i = 0; i < str.length; i++) {
        result.push(str.charCodeAt(i));
    }
    return new Uint8Array(result);
}

export const utils = { arrayToStr, strToArray };
