"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalValues = void 0;
const utils_1 = require("./utils");
const config_json_1 = __importDefault(require("../../config/config.json"));
const advancedConfig_json_1 = __importDefault(require("../../config/advancedConfig.json"));
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const OnGameStartUtils_1 = require("./OnGameStartUtils");
const NonPmcUtils_1 = require("../NonPmcBotChanges/NonPmcUtils");
class globalValues {
    static Logger;
    static profileHelper;
    static storedEquipmentValues = {};
    static tables;
    static originalBotTypes;
    static config = config_json_1.default;
    static advancedConfig = advancedConfig_json_1.default;
    static originalWeighting;
    static configServer;
    static updateInventory(currentLevel, location) {
        const items = this.tables.templates.items;
        const nameList = Object.keys(this.storedEquipmentValues);
        if (!nameList.length || !currentLevel)
            return;
        const botConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.BOT);
        const firstPrimaryWeaponMultiplier = advancedConfig_json_1.default.locations[location].weightingAdjustments
            .FirstPrimaryWeapon;
        nameList.forEach((botName) => {
            const copiedInventory = (0, utils_1.cloneDeep)(this.originalBotTypes[botName].inventory);
            const currentLevelIndex = this.storedEquipmentValues[botName].findIndex(({ levelRange: { min, max } }) => currentLevel <= max && currentLevel >= min);
            const weightingToUpdate = this.storedEquipmentValues[botName][currentLevelIndex];
            if (!weightingToUpdate)
                return;
            if (weightingToUpdate?.ammo) {
                for (const caliber in weightingToUpdate.ammo) {
                    copiedInventory.Ammo[caliber] = {
                        ...copiedInventory.Ammo[caliber],
                        ...weightingToUpdate.ammo[caliber],
                    };
                }
            }
            if (weightingToUpdate?.equipment) {
                for (const equipmentType in weightingToUpdate.equipment) {
                    copiedInventory.equipment[equipmentType] = {
                        ...copiedInventory.equipment[equipmentType],
                        ...weightingToUpdate.equipment[equipmentType],
                    };
                    try {
                        //update weapon type weightings per map here
                        if (equipmentType === "FirstPrimaryWeapon" &&
                            botName !== "marksman") {
                            // console.log("Updating", botName, " weapons for map", location);
                            const firstPrimary = (0, utils_1.cloneDeep)(copiedInventory.equipment[equipmentType]);
                            const firstPrimaryKeys = Object.keys(firstPrimary);
                            firstPrimaryKeys?.forEach((weaponId) => {
                                const parentId = items[weaponId]?._parent;
                                const parent = items?.[parentId]?._name;
                                if (parent && firstPrimaryWeaponMultiplier[parent]) {
                                    const multiplier = (firstPrimaryWeaponMultiplier[parent] - 1) / 2 + 1;
                                    copiedInventory.equipment[equipmentType][weaponId] =
                                        Math.round(multiplier * firstPrimary[weaponId]);
                                    // if (botName === "assault") {
                                    //   console.log(
                                    //     multiplier,
                                    //     location,
                                    //     botName,
                                    //     firstPrimary[weaponId],
                                    //     " to ",
                                    //     copiedInventory.equipment[equipmentType][weaponId],
                                    //     parent,
                                    //     items[weaponId]._name
                                    //   );
                                    // }
                                }
                                else {
                                    console.log(`[AlgorithmicLevelProgression]: Unable to set map settings for bot ${botName}'s item ${items[weaponId]._name} - ${weaponId} `);
                                }
                            });
                        }
                    }
                    catch (error) {
                        `[AlgorithmicLevelProgression]: Failed to update bot ${botName}'s ${equipmentType}`;
                    }
                }
                if (botName === "assault") {
                    //adjust randomization
                    (0, NonPmcUtils_1.buffScavGearAsLevel)(botConfig.equipment[botName], currentLevelIndex);
                }
                (0, NonPmcUtils_1.setPlateWeightings)(botName, botConfig.equipment[botName], currentLevelIndex);
                // if (botName === "assault") {
                //   saveToFile(this.tables.bots.types[botName], `refDBS/assault.json`);
                // }
            }
            this.tables.bots.types[botName].inventory = copiedInventory;
        });
    }
    static setValuesForLocation(location, hours) {
        if (location === "factory4_day")
            hours = 12;
        if (location === "factory4_night")
            hours = 1;
        if (location === "laboratory")
            hours = 12;
        this.config.debug &&
            this.Logger.info(`Algorthimic LevelProgression: Setting up values for map ${location}`);
        const botConfig = this.configServer.getConfig(ConfigTypes_1.ConfigTypes.BOT);
        const mapWeightings = advancedConfig_json_1.default.locations?.[location]?.weightingAdjustments;
        const items = this.tables.templates.items;
        if (!mapWeightings) {
            return this.Logger.warning(`Algorthimic LevelProgression: did not recognize 'location': ${location}, using defaults`);
        }
        if (!this.originalWeighting) {
            return this.Logger.error(`Algorthimic LevelProgression: 'originalWeighting' was not set correctly`);
        }
        if (!items) {
            return this.Logger.error(`Algorthimic LevelProgression: 'items' was not set correctly`);
        }
        const finalEquipment = (0, utils_1.cloneDeep)(this.originalWeighting);
        const isNight = hours < 7 || hours >= 19;
        config_json_1.default.debug &&
            console.log("The server thinks it is ", isNight ? "NIGHT" : "DAY", hours, " do appropriate things.");
        const randomisation = finalEquipment.randomisation;
        (0, OnGameStartUtils_1.makeRandomisationAdjustments)(isNight, this.originalWeighting, randomisation, location);
        const originalBotTypesCopy = (0, utils_1.cloneDeep)(this.originalBotTypes);
        (0, OnGameStartUtils_1.cullModItems)(originalBotTypesCopy.usec.inventory.mods, isNight, items, location);
        (0, OnGameStartUtils_1.updateScopes)(originalBotTypesCopy.usec.inventory.mods, isNight, items, location);
        originalBotTypesCopy.bear.inventory.mods =
            originalBotTypesCopy.usec.inventory.mods;
        const pmcWeighting = finalEquipment.weightingAdjustmentsByBotLevel;
        (0, OnGameStartUtils_1.makeMapSpecificWeaponWeightings)(location, items, this.originalWeighting, pmcWeighting);
        // saveToFile(originalBotTypesCopy.usec.inventory.mods, "updated.json")
        // saveToFile(originalBotTypesCopy.usec.inventory, "refDBS/usecInventoryRef.json")
        // saveToFile(finalEquipment, "finalEquipment.json");
        // saveToFile(this.originalWeighting, "originalWeighting.json")
        botConfig.equipment.pmc = finalEquipment;
        this.tables.bots.types = originalBotTypesCopy;
    }
}
exports.globalValues = globalValues;
//# sourceMappingURL=GlobalValues.js.map