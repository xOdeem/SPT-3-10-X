"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceManager = void 0;
const path = __importStar(require("node:path"));
class InstanceManager {
    //#region Accessible in or after preAkiLoad
    modName;
    debug;
    // Useful Paths
    modPath = path.join(process.cwd(), "user", "mods", "TarkovTools");
    dbPath = path.join(process.cwd(), "user", "mods", "TarkovTools", "database");
    profilePath = path.join(process.cwd(), "user", "profiles");
    cachePath = path.join(path.dirname(__filename), "..", "config", "cache.json");
    // Instances
    container;
    preSptModLoader;
    configServer;
    saveServer;
    itemHelper;
    logger;
    staticRouter;
    vfs;
    //#endregion
    //#region Accessible in or after postDBLoad
    database;
    customItem;
    imageRouter;
    jsonUtil;
    profileHelper;
    ragfairPriceService;
    importerUtil;
    hashUtil;
    //#endregion
    // Call at the start of the mods postDBLoad method
    preSptLoad(container, mod) {
        this.modName = mod;
        this.container = container;
        this.preSptModLoader = container.resolve("PreSptModLoader");
        this.imageRouter = container.resolve("ImageRouter");
        this.configServer = container.resolve("ConfigServer");
        this.saveServer = container.resolve("SaveServer");
        this.itemHelper = container.resolve("ItemHelper");
        this.logger = container.resolve("WinstonLogger");
        this.staticRouter = container.resolve("StaticRouterModService");
        this.vfs = container.resolve("VFS");
    }
    postDBLoad(container) {
        this.database = container.resolve("DatabaseServer").getTables();
        this.customItem = container.resolve("CustomItemService");
        this.jsonUtil = container.resolve("JsonUtil");
        this.profileHelper = container.resolve("ProfileHelper");
        this.ragfairPriceService = container.resolve("RagfairPriceService");
        this.importerUtil = container.resolve("ImporterUtil");
        this.hashUtil = container.resolve("HashUtil");
    }
}
exports.InstanceManager = InstanceManager;
//# sourceMappingURL=InstanceManager.js.map