"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModDetector = void 0;
const fs_1 = __importDefault(require("fs"));
class ModDetector {
    client;
    server;
    logger;
    constructor(logger) {
        this.logger = logger;
        this.client = [];
        this.server = [];
    }
    getInstalledMods(container) {
        const ModLoader = container.resolve("PreSptModLoader");
        const clientPluginsPath = `${__dirname}/../../../../../../BepInEx/plugins/`;
        const isLocalInstall = fs_1.default.existsSync(clientPluginsPath);
        if (isLocalInstall) {
            this.client = fs_1.default.readdirSync(clientPluginsPath);
        }
        else {
            this.logger.log(`You're a smart cookie, appears to be a remote host installation? Client plugins could not be detected.`);
        }
        this.server = ModLoader.getImportedModsNames() || [];
        return {
            client: this.client,
            server: this.server
        };
    }
    // Mod Specific Helpers
    isModInstalled(modSignature) {
        let client = !!this.client.find((mod) => mod.includes(modSignature.CLIENT));
        let server = !!this.client.find((mod) => mod.includes(modSignature.SERVER));
        return {
            client,
            server
        };
    }
}
exports.ModDetector = ModDetector;
//# sourceMappingURL=modDetection.js.map