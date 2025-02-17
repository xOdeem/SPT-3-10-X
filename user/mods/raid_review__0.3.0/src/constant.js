"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketConfig = exports.CONSTANTS = void 0;
const config_json_1 = __importDefault(require("../config.json"));
exports.CONSTANTS = {
    // Mod Signature, or file name
    MOD_SIGNATURES: {
        SAIN: {
            CLIENT: 'SAIN.dll',
            SERVER: 'zSolarint-SAIN-ServerMod',
        },
        FIKA: {
            CLIENT: 'Fika.Core.dll',
            SERVER: 'fika-server',
        },
    },
    // STRING CONSTANTS
    REASON_RAID_REMOVAL__CLIENT_PACKET: "Received 'onGameSessionEnd' packet from 'Raid-Review' client mod.",
    REASON_RAID_REMOVAL__TIMEOUT: "Raid timed out, no web socket packets recieved from 'Raid-Review' client mod for 2 minutes.",
};
exports.WebSocketConfig = {
    port: config_json_1.default.web_socket_port || 7828,
    perMessageDeflate: {
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3,
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024,
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024,
    },
};
//# sourceMappingURL=constant.js.map