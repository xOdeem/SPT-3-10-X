"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const semver_1 = require("C:/snapshot/project/node_modules/semver");
const node_path_1 = __importDefault(require("node:path"));
class TemporaryFixes {
    static container;
    preSptLoad(container) {
        const logger = container.resolve("WinstonLogger");
        if (!this.validSptVersion(container)) {
            logger.error("This version of Temporary Fixes was not made for your version of SPT. Disabling");
            return;
        }
    }
    postDBLoad(container) {
        const databaseService = container.resolve("DatabaseService");
        const pricesTable = databaseService.getTables().templates.prices;
        const handbookTable = databaseService.getTables().templates.handbook;
        // Set price of TerraGroup Labs residential unit keycard [Res. unit]
        pricesTable["6711039f9e648049e50b3307"] = 165000;
        // Set handbook price of TerraGroup Labs residential unit keycard [Res. unit]
        handbookTable.Items.push({
            "Id": "6711039f9e648049e50b3307",
            "ParentId": "5c518ed586f774119a772aee",
            "Price": 165000
        });
    }
    /**
     * Return true if the current SPT version is valid for this version of the mod
     * @param container Dependency container
     * @returns
     */
    validSptVersion(container) {
        const vfs = container.resolve("VFS");
        const configServer = container.resolve("ConfigServer");
        const sptConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.CORE);
        const sptVersion = globalThis.G_SPTVERSION || sptConfig.sptVersion;
        const packageJsonPath = node_path_1.default.join(__dirname, "../package.json");
        const modSptVersion = JSON.parse(vfs.readFile(packageJsonPath)).sptVersion;
        return (0, semver_1.satisfies)(sptVersion, modSptVersion);
    }
}
exports.mod = new TemporaryFixes();
//# sourceMappingURL=mod.js.map