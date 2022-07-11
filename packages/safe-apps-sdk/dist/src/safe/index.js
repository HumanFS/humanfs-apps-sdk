"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Safe = void 0;
const ethers_1 = require("ethers");
const signatures_1 = require("./signatures");
const methods_1 = require("../communication/methods");
const constants_1 = require("../eth/constants");
const permissions_1 = require("../types/permissions");
class Safe {
    constructor(communicator, wallet) {
        this.communicator = communicator;
        this.wallet = wallet;
    }
    async getChainInfo() {
        const response = await this.communicator.send(methods_1.Methods.getChainInfo, undefined);
        return response.data;
    }
    async getInfo() {
        const response = await this.communicator.send(methods_1.Methods.getSafeInfo, undefined);
        return response.data;
    }
    // There is a possibility that this method will change because we may add pagination to the endpoint
    async experimental_getBalances({ currency = 'usd' } = {}) {
        const response = await this.communicator.send(methods_1.Methods.getSafeBalances, {
            currency,
        });
        return response.data;
    }
    async check1271Signature(messageHash, signature = '0x') {
        const safeInfo = await this.getInfo();
        const encodedIsValidSignatureCall = signatures_1.EIP_1271_INTERFACE.encodeFunctionData('isValidSignature', [
            messageHash,
            signature,
        ]);
        const payload = {
            call: constants_1.RPC_CALLS.eth_call,
            params: [
                {
                    to: safeInfo.safeAddress,
                    data: encodedIsValidSignatureCall,
                },
                'latest',
            ],
        };
        try {
            const response = await this.communicator.send(methods_1.Methods.rpcCall, payload);
            return response.data.slice(0, 10).toLowerCase() === signatures_1.MAGIC_VALUE;
        }
        catch (err) {
            return false;
        }
    }
    async check1271SignatureBytes(messageHash, signature = '0x') {
        const safeInfo = await this.getInfo();
        const msgBytes = ethers_1.ethers.utils.arrayify(messageHash);
        const encodedIsValidSignatureCall = signatures_1.EIP_1271_BYTES_INTERFACE.encodeFunctionData('isValidSignature', [
            msgBytes,
            signature,
        ]);
        const payload = {
            call: constants_1.RPC_CALLS.eth_call,
            params: [
                {
                    to: safeInfo.safeAddress,
                    data: encodedIsValidSignatureCall,
                },
                'latest',
            ],
        };
        try {
            const response = await this.communicator.send(methods_1.Methods.rpcCall, payload);
            return response.data.slice(0, 10).toLowerCase() === signatures_1.MAGIC_VALUE_BYTES;
        }
        catch (err) {
            return false;
        }
    }
    calculateMessageHash(message) {
        return ethers_1.ethers.utils.hashMessage(message);
    }
    async isMessageSigned(message, signature = '0x') {
        const messageHash = this.calculateMessageHash(message);
        const messageHashSigned = await this.isMessageHashSigned(messageHash, signature);
        return messageHashSigned;
    }
    async isMessageHashSigned(messageHash, signature = '0x') {
        const checks = [this.check1271Signature.bind(this), this.check1271SignatureBytes.bind(this)];
        for (const check of checks) {
            const isValid = await check(messageHash, signature);
            if (isValid) {
                return true;
            }
        }
        return false;
    }
    async getEnvironmentInfo() {
        const response = await this.communicator.send(methods_1.Methods.getEnvironmentInfo, undefined);
        return response.data;
    }
    async getAddressBook() {
        let isAddressBookPermissionGranted = await this.wallet.hasPermission(methods_1.Methods.getAddressBook);
        console.log('1.isAddressBookPermissionGranted', isAddressBookPermissionGranted);
        if (!isAddressBookPermissionGranted) {
            const permissions = await this.wallet.requestPermissions([{ [methods_1.Methods.getAddressBook]: {} }]);
            console.log('2.permissions', permissions);
            isAddressBookPermissionGranted = !!this.wallet.findPermission(permissions, methods_1.Methods.getAddressBook);
            console.log('3.isAddressBookPermissionGranted', isAddressBookPermissionGranted);
        }
        if (isAddressBookPermissionGranted) {
            const response = await this.communicator.send(methods_1.Methods.getAddressBook, []);
            console.log('4.addressBook', response.data);
            return response.data;
        }
        console.log('5.throw Error');
        throw new permissions_1.PermissionsError('Permissions rejected', permissions_1.PERMISSIONS_REQUEST_REJECTED);
    }
}
exports.Safe = Safe;
//# sourceMappingURL=index.js.map