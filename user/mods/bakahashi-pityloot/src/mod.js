"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LootProbabilityManager_1 = require("./LootProbabilityManager");
const config_json_1 = require("../config/config.json");
const HideoutEventActions_1 = require("C:/snapshot/project/obj/models/enums/HideoutEventActions");
const DatabaseUtils_1 = require("./DatabaseUtils");
const QuestUtils_1 = require("./QuestUtils");
const HideoutUtils_1 = require("./HideoutUtils");
const ExitStatis_1 = require("C:/snapshot/project/obj/models/enums/ExitStatis");
class Mod {
    preSptLoad(container) {
        if (!config_json_1.enabled) {
            return;
        }
        const profileHelper = container.resolve("ProfileHelper");
        const staticRouterModService = container.resolve("StaticRouterModService");
        const databaseServer = container.resolve("DatabaseServer");
        const logger = container.resolve("WinstonLogger");
        const locationController = container.resolve("LocationController");
        const hideoutUtils = new HideoutUtils_1.HideoutUtils(logger);
        const questUtils = new QuestUtils_1.QuestUtils(logger);
        const pityLootManager = new LootProbabilityManager_1.LootProbabilityManager(logger);
        let allQuests;
        let originalLocations;
        let originalBots;
        let algorithmicLevelingProgressionCompatibility = false;
        const preSptModLoader = container.resolve("PreSptModLoader");
        if (preSptModLoader
            .getImportedModsNames()
            .some((mod) => mod.includes("AlgorithmicLevelProgression"))) {
            logger.info("Algorithmic Level Progression detected, updating bot spawns");
            algorithmicLevelingProgressionCompatibility = true;
        }
        container.afterResolution("LocationController", (_t, result) => {
            for (const controller of Array.isArray(result) ? result : [result]) {
                controller.generateAll = (sessionId) => {
                    const start = performance.now();
                    // profile can be null for scav raids
                    const fullProfile = profileHelper.getFullProfile(sessionId);
                    if (!fullProfile?.characters.pmc ||
                        !fullProfile?.characters.pmc.Hideout) {
                        logger.warning(`Profile not valid yet, skipping initialization for now`);
                    }
                    else {
                        const tables = databaseServer.getTables();
                        if (allQuests) {
                            const incompleteItemRequirements = pityLootManager.getIncompleteRequirements(fullProfile, config_json_1.appliesToQuests
                                ? questUtils.getInProgressQuestRequirements(fullProfile, allQuests)
                                : [], config_json_1.appliesToHideout && tables.hideout
                                ? hideoutUtils.getHideoutRequirements(tables.hideout.areas, fullProfile)
                                : []);
                            const getNewLootProbability = pityLootManager.createLootProbabilityUpdater(incompleteItemRequirements);
                            if (originalLocations) {
                                tables.locations = pityLootManager.getUpdatedLocationLoot(getNewLootProbability, originalLocations, incompleteItemRequirements);
                            }
                            const end = performance.now();
                            config_json_1.debug &&
                                logger.info(`Pity loot location updates took: ${end - start} ms`);
                        }
                    }
                    return locationController.generateAll(sessionId);
                };
            }
        }, { frequency: "Always" });
        (0, DatabaseUtils_1.maybeCreatePityTrackerDatabase)();
        function handlePityChange(sessionId, incrementRaidCount) {
            const fullProfile = profileHelper.getFullProfile(sessionId);
            if (!fullProfile?.characters.pmc || !fullProfile.characters.pmc.Hideout) {
                config_json_1.debug &&
                    logger.info(`Profile not valid yet, skipping initialization for now`);
                return;
            }
            const tables = databaseServer.getTables();
            (0, DatabaseUtils_1.updatePityTracker)(fullProfile, hideoutUtils.getPossibleHideoutUpgrades(tables.hideout?.areas ?? [], fullProfile), incrementRaidCount);
        }
        staticRouterModService.registerStaticRouter("PityLootInit", [
            {
                url: "/client/game/start",
                action: async (url, info, sessionId, output) => {
                    const tables = databaseServer.getTables();
                    // Store quests and loot tables at startup, so that we always get them after all other mods have loaded and possibly changed their settings (e.g. AlgorithmicQuestRandomizer or AllTheLoot)
                    // We could try and do this by hooking into postSptLoad and making this mod last in the load order, but this seems like a more reliable solution
                    if (allQuests == null) {
                        allQuests = tables.templates?.quests;
                    }
                    // the reason we also store original tables only once is so that when calculating new odds, we don't have to do funky math to undo previous increases
                    if (originalLocations == null) {
                        originalLocations = tables.locations;
                    }
                    if (originalBots == null) {
                        originalBots = tables.bots;
                    }
                    handlePityChange(sessionId, false);
                    return output;
                },
            },
        ], "spt");
        staticRouterModService.registerStaticRouter("PityLootPostRaidHooks", [
            {
                url: "/client/match/local/end",
                action: async (_url, info, sessionId, output) => {
                    const failed = [
                        ExitStatis_1.ExitStatus.KILLED,
                        ExitStatis_1.ExitStatus.MISSINGINACTION,
                    ].includes(info.results.result);
                    const survived = [ExitStatis_1.ExitStatus.SURVIVED, ExitStatis_1.ExitStatus.RUNNER].includes(info.results.result);
                    if (failed || (!config_json_1.onlyIncreaseOnFailedRaids && survived)) {
                        handlePityChange(sessionId, info.results.profile.Info.Side !== "Savage" || config_json_1.includeScavRaids);
                    }
                    return output;
                },
            },
        ], "spt");
        staticRouterModService.registerStaticRouter("PityLootQuestTurninHooks", [
            {
                url: "/client/game/profile/items/moving",
                action: async (_url, info, sessionId, output) => {
                    let pityStatusChanged = false;
                    for (const body of info.data) {
                        pityStatusChanged =
                            pityStatusChanged ||
                                [
                                    "QuestComplete",
                                    "QuestHandover",
                                    HideoutEventActions_1.HideoutEventActions.HIDEOUT_IMPROVE_AREA,
                                    HideoutEventActions_1.HideoutEventActions.HIDEOUT_UPGRADE,
                                    HideoutEventActions_1.HideoutEventActions.HIDEOUT_UPGRADE_COMPLETE,
                                ].includes(body.Action);
                    }
                    if (!pityStatusChanged) {
                        return output;
                    }
                    handlePityChange(sessionId, false);
                    return output;
                },
            },
        ], "spt");
        staticRouterModService.registerStaticRouter("PityLootPreRaidHooks", [
            {
                url: "/client/raid/configuration",
                action: async (_url, _info, sessionId, output) => {
                    const start = performance.now();
                    const fullProfile = profileHelper.getFullProfile(sessionId);
                    if (!fullProfile?.characters.pmc ||
                        !fullProfile.characters.pmc.Hideout) {
                        logger.warning(`Profile not valid yet, skipping initialization for now`);
                    }
                    else {
                        const tables = databaseServer.getTables();
                        if (allQuests && originalBots && tables.bots) {
                            const incompleteItemRequirements = pityLootManager.getIncompleteRequirements(fullProfile, config_json_1.appliesToQuests
                                ? questUtils.getInProgressQuestRequirements(fullProfile, allQuests)
                                : [], config_json_1.appliesToHideout && tables.hideout
                                ? hideoutUtils.getHideoutRequirements(tables.hideout.areas, fullProfile)
                                : []);
                            const getNewLootProbability = pityLootManager.createLootProbabilityUpdater(incompleteItemRequirements);
                            tables.bots = pityLootManager.getUpdatedBotTables(getNewLootProbability, algorithmicLevelingProgressionCompatibility
                                ? tables.bots
                                : originalBots);
                        }
                        const end = performance.now();
                        config_json_1.debug &&
                            logger.info(`Pity loot bot updates took: ${end - start} ms`);
                    }
                    return output;
                },
            },
        ], "spt");
    }
}
module.exports = { mod: new Mod() };
//# sourceMappingURL=mod.js.map