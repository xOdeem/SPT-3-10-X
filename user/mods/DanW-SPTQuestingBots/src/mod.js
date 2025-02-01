"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("../config/config.json"));
const eftQuestSettings_json_1 = __importDefault(require("../config/eftQuestSettings.json"));
const zoneAndItemQuestPositions_json_1 = __importDefault(require("../config/zoneAndItemQuestPositions.json"));
const CommonUtils_1 = require("./CommonUtils");
const BotLocationUtil_1 = require("./BotLocationUtil");
const PMCConversionUtil_1 = require("./PMCConversionUtil");
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const modName = "SPTQuestingBots";
const spawningModNames = ["SWAG", "DewardianDev-MOAR", "PreyToLive-BetterSpawnsPlus", "RealPlayerSpawn"];
class QuestingBots {
    commonUtils;
    botUtil;
    pmcConversionUtil;
    logger;
    configServer;
    databaseServer;
    databaseTables;
    localeService;
    questHelper;
    vfs;
    httpResponseUtil;
    randomUtil;
    botController;
    iBotConfig;
    iPmcConfig;
    iLocationConfig;
    basePScavConversionChance;
    preSptLoad(container) {
        this.logger = container.resolve("WinstonLogger");
        const staticRouterModService = container.resolve("StaticRouterModService");
        const dynamicRouterModService = container.resolve("DynamicRouterModService");
        // Cache and adjust the PMC conversion chances
        staticRouterModService.registerStaticRouter(`StaticRaidConfiguration${modName}`, [{
                url: "/client/game/start",
                // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                action: async (url, info, sessionId, output) => {
                    if (config_json_1.default.bot_spawns.enabled) {
                        this.pmcConversionUtil.adjustAllPmcConversionChances(0, false);
                    }
                    return output;
                }
            }], "aki");
        // Get config.json settings for the bepinex plugin
        staticRouterModService.registerStaticRouter(`StaticGetConfig${modName}`, [{
                url: "/QuestingBots/GetConfig",
                action: async () => {
                    return JSON.stringify(config_json_1.default);
                }
            }], "GetConfig");
        if (!config_json_1.default.enabled) {
            return;
        }
        // Apply a scalar factor to the SPT-AKI PMC conversion chances
        dynamicRouterModService.registerDynamicRouter(`DynamicAdjustPMCConversionChances${modName}`, [{
                url: "/QuestingBots/AdjustPMCConversionChances/",
                action: async (url) => {
                    const urlParts = url.split("/");
                    const factor = Number(urlParts[urlParts.length - 2]);
                    const verify = JSON.parse(urlParts[urlParts.length - 1].toLowerCase());
                    this.pmcConversionUtil.adjustAllPmcConversionChances(factor, verify);
                    return JSON.stringify({ resp: "OK" });
                }
            }], "AdjustPMCConversionChances");
        // Apply a scalar factor to the SPT-AKI PScav conversion chance
        dynamicRouterModService.registerDynamicRouter(`DynamicAdjustPScavChance${modName}`, [{
                url: "/QuestingBots/AdjustPScavChance/",
                action: async (url) => {
                    const urlParts = url.split("/");
                    const factor = Number(urlParts[urlParts.length - 1]);
                    this.iBotConfig.chanceAssaultScavHasPlayerScavName = Math.round(this.basePScavConversionChance * factor);
                    this.commonUtils.logInfo(`Adjusted PScav spawn chance to ${this.iBotConfig.chanceAssaultScavHasPlayerScavName}%`);
                    return JSON.stringify({ resp: "OK" });
                }
            }], "AdjustPScavChance");
        // Get all EFT quest templates
        // NOTE: This includes custom quests added by mods
        staticRouterModService.registerStaticRouter(`GetAllQuestTemplates${modName}`, [{
                url: "/QuestingBots/GetAllQuestTemplates",
                action: async () => {
                    return JSON.stringify({ templates: this.questHelper.getQuestsFromDb() });
                }
            }], "GetAllQuestTemplates");
        // Get override settings for EFT quests
        staticRouterModService.registerStaticRouter(`GetEFTQuestSettings${modName}`, [{
                url: "/QuestingBots/GetEFTQuestSettings",
                action: async () => {
                    return JSON.stringify({ settings: eftQuestSettings_json_1.default });
                }
            }], "GetEFTQuestSettings");
        // Get override settings for quest zones and items
        staticRouterModService.registerStaticRouter(`GetZoneAndItemQuestPositions${modName}`, [{
                url: "/QuestingBots/GetZoneAndItemQuestPositions",
                action: async () => {
                    return JSON.stringify({ zoneAndItemPositions: zoneAndItemQuestPositions_json_1.default });
                }
            }], "GetZoneAndItemQuestPositions");
        // Get Scav-raid settings to determine PScav conversion chances
        staticRouterModService.registerStaticRouter(`GetScavRaidSettings${modName}`, [{
                url: "/QuestingBots/GetScavRaidSettings",
                action: async () => {
                    return JSON.stringify({ maps: this.iLocationConfig.scavRaidTimeSettings.maps });
                }
            }], "GetScavRaidSettings");
        // Get the chance that a PMC will be a USEC
        staticRouterModService.registerStaticRouter(`GetUSECChance${modName}`, [{
                url: "/QuestingBots/GetUSECChance",
                action: async () => {
                    return JSON.stringify({ usecChance: this.iPmcConfig.isUsec });
                }
            }], "GetUSECChance");
        // Intercept the EFT bot-generation request to include a PScav conversion chance
        container.afterResolution("BotCallbacks", (_t, result) => {
            result.generateBots = async (url, info, sessionID) => {
                const bots = await this.generateBots({ conditions: info.conditions }, sessionID, this.randomUtil.getChance100(info.PScavChance));
                return this.httpResponseUtil.getBody(bots);
            };
        }, { frequency: "Always" });
    }
    postDBLoad(container) {
        this.configServer = container.resolve("ConfigServer");
        this.databaseServer = container.resolve("DatabaseServer");
        this.localeService = container.resolve("LocaleService");
        this.questHelper = container.resolve("QuestHelper");
        this.vfs = container.resolve("VFS");
        this.httpResponseUtil = container.resolve("HttpResponseUtil");
        this.randomUtil = container.resolve("RandomUtil");
        this.botController = container.resolve("BotController");
        this.iBotConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.BOT);
        this.iPmcConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.PMC);
        this.iLocationConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.LOCATION);
        this.databaseTables = this.databaseServer.getTables();
        this.commonUtils = new CommonUtils_1.CommonUtils(this.logger, this.databaseTables, this.localeService);
        this.botUtil = new BotLocationUtil_1.BotUtil(this.commonUtils, this.databaseTables, this.iLocationConfig, this.iBotConfig);
        this.pmcConversionUtil = new PMCConversionUtil_1.PMCConversionUtil(this.commonUtils, this.iPmcConfig);
        if (!config_json_1.default.enabled) {
            return;
        }
        if (!this.doesFileIntegrityCheckPass()) {
            config_json_1.default.enabled = false;
            return;
        }
    }
    postSptLoad(container) {
        if (!config_json_1.default.enabled) {
            this.commonUtils.logInfo("Mod disabled in config.json", true);
            return;
        }
        const presptModLoader = container.resolve("PreSptModLoader");
        this.pmcConversionUtil.removeBlacklistedBrainTypes();
        // Disable the Questing Bots spawning system if another spawning mod has been loaded
        if (this.shouldDisableSpawningSystem(presptModLoader.getImportedModsNames())) {
            config_json_1.default.bot_spawns.enabled = false;
        }
        // Make Questing Bots control PScav spawning
        this.basePScavConversionChance = this.iBotConfig.chanceAssaultScavHasPlayerScavName;
        if (config_json_1.default.adjust_pscav_chance.enabled || (config_json_1.default.bot_spawns.enabled && config_json_1.default.bot_spawns.player_scavs.enabled)) {
            this.iBotConfig.chanceAssaultScavHasPlayerScavName = 0;
        }
        this.configureSpawningSystem();
    }
    configureSpawningSystem() {
        if (!config_json_1.default.bot_spawns.enabled) {
            return;
        }
        this.commonUtils.logInfo("Configuring game for bot spawning...");
        // Overwrite BSG's chances of bots being friendly toward each other
        this.botUtil.adjustAllBotHostilityChances();
        // Remove all of BSG's PvE-only boss waves
        this.botUtil.disablePvEBossWaves();
        // Currently these are all PMC waves, which are unnecessary with PMC spawns in this mod
        this.botUtil.disableCustomBossWaves();
        // Disable all of the extra Scavs that spawn into Factory
        this.botUtil.disableCustomScavWaves();
        // If Rogues don't spawn immediately, PMC spawns will be significantly delayed
        if (config_json_1.default.bot_spawns.limit_initial_boss_spawns.disable_rogue_delay) {
            this.commonUtils.logInfo("Removing SPT Rogue spawn delay...");
            this.iLocationConfig.rogueLighthouseSpawnTimeSettings.waitTimeSeconds = -1;
        }
        if (config_json_1.default.bot_spawns.advanced_eft_bot_count_management.enabled) {
            this.commonUtils.logInfo("Enabling advanced_eft_bot_count_management will instruct EFT to ignore this mod's PMC's and PScavs when spawning more bots.");
            this.botUtil.useEFTBotCaps();
            this.botUtil.modifyNonWaveBotSpawnSettings();
        }
        if (config_json_1.default.bot_spawns.bot_cap_adjustments.enabled) {
            this.botUtil.increaseBotCaps();
        }
        this.commonUtils.logInfo("Configuring game for bot spawning...done.");
    }
    async generateBots(info, sessionID, shouldBePScavGroup) {
        const bots = await this.botController.generate(sessionID, info);
        if (!shouldBePScavGroup) {
            return bots;
        }
        const pmcNames = [
            ...this.databaseTables.bots.types.usec.firstName,
            ...this.databaseTables.bots.types.bear.firstName
        ];
        for (const bot in bots) {
            if (info.conditions[0].Role !== "assault") {
                continue;
            }
            bots[bot].Info.Nickname = `${bots[bot].Info.Nickname} (${this.randomUtil.getArrayValue(pmcNames)})`;
        }
        return bots;
    }
    doesFileIntegrityCheckPass() {
        const path = `${__dirname}/..`;
        if (this.vfs.exists(`${path}/quests/`)) {
            this.commonUtils.logWarning("Found obsolete quests folder 'user\\mods\\DanW-SPTQuestingBots\\quests'. Only quest files in 'BepInEx\\plugins\\DanW-SPTQuestingBots\\quests' will be used.");
        }
        if (this.vfs.exists(`${path}/log/`)) {
            this.commonUtils.logWarning("Found obsolete log folder 'user\\mods\\DanW-SPTQuestingBots\\log'. Logs are now saved in 'BepInEx\\plugins\\DanW-SPTQuestingBots\\log'.");
        }
        if (this.vfs.exists(`${path}/../../../BepInEx/plugins/SPTQuestingBots.dll`)) {
            this.commonUtils.logError("Please remove BepInEx/plugins/SPTQuestingBots.dll from the previous version of this mod and restart the server, or it will NOT work correctly.");
            return false;
        }
        return true;
    }
    shouldDisableSpawningSystem(importedModNames) {
        if (!config_json_1.default.bot_spawns.enabled) {
            return false;
        }
        for (const spawningModName of spawningModNames) {
            if (importedModNames.includes(spawningModName)) {
                this.commonUtils.logWarning(`${spawningModName} detected. Disabling the Questing Bots spawning system.`);
                return true;
            }
        }
        return false;
    }
}
module.exports = { mod: new QuestingBots() };
//# sourceMappingURL=mod.js.map