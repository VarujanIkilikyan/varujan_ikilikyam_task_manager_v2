import CryptoJS from 'crypto-js';

const {
    TOKEN_SECRET,
} = process.env;

export default {
    encrypt(data) {
        return CryptoJS.AES.encrypt(
            JSON.stringify(data),
            TOKEN_SECRET,
        ).toString();
    },
    decrypt(ciphertext) {
        try {
            const bytes = CryptoJS.AES.decrypt(ciphertext, TOKEN_SECRET);
            return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        } catch (e) {
            console.log(e.message);
            return null;
        }
    }
}