"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SetupNonPMCBotChanges;
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const config_json_1 = __importDefault(require("../../config/config.json"));
const nonPmcBotConfig_json_1 = __importDefault(require("../../config/nonPmcBotConfig.json"));
const NonPmcUtils_1 = require("./NonPmcUtils");
const GlobalValues_1 = require("../LoadoutChanges/GlobalValues");
function SetupNonPMCBotChanges(container) {
    const databaseServer = container.resolve("DatabaseServer");
    const tables = databaseServer.getTables();
    const items = tables.templates.items;
    const botsForUpdate = nonPmcBotConfig_json_1.default?.nonPmcBots;
    const configServer = container.resolve("ConfigServer");
    // const tieredItemTypes = buldTieredItemTypes(items);
    // saveToFile(tieredItemTypes, "Constants/tieredItems.json");
    const botConfig = configServer.getConfig(ConfigTypes_1.ConfigTypes.BOT);
    Object.keys(botsForUpdate).forEach((name) => {
        if (botConfig.equipment?.[name]?.weightingAdjustmentsByPlayerLevel) {
            botConfig.equipment[name].weightingAdjustmentsByPlayerLevel = [];
        }
        if (botConfig.equipment[name] &&
            !botConfig.equipment[name]?.forceOnlyArmoredRigWhenNoArmor &&
            nonPmcBotConfig_json_1.default.nonPmcBots[name].forceOnlyArmoredRigWhenNoArmor) {
            botConfig.equipment[name]["forceOnlyArmoredRigWhenNoArmor"] = true;
        }
        if (!tables.bots.types[name]?.inventory?.Ammo)
            return;
        const inventory = tables.bots.types[name].inventory;
        const chances = tables.bots.types[name].chances;
        if (name !== "assault") {
            Object.keys(nonPmcBotConfig_json_1.default.nonPmcBots[name]).forEach((key) => {
                if (chances.equipment[key] !== undefined &&
                    chances.equipment[key] < 30 &&
                    nonPmcBotConfig_json_1.default.nonPmcBots[name][key][1] > 0) {
                    switch (key) {
                        case "Scabbard":
                            break;
                        case "Backpack":
                        case "Holster":
                        case "Eyewear":
                        case "FaceCover":
                        case "Earpiece":
                            chances.equipment[key] = 30;
                            break;
                        default:
                            if (name.includes("infected")) {
                                chances.equipment[key] = 50;
                                break;
                            }
                            chances.equipment[key] = 70;
                            break;
                    }
                }
            });
            if (chances.equipment.SecondPrimaryWeapon) {
                chances.equipment.SecondPrimaryWeapon = 10;
            }
            else {
                chances.equipment.SecondPrimaryWeapon = 0;
            }
            // console.log("\n");
        }
        // if (name === "marksman") {
        //   saveToFile(tables.bots.types[name].inventory, `refDBS/marksman.json`);
        // }
        // console.log("\n", name);
        (0, NonPmcUtils_1.addItemsToBotInventory)(inventory, nonPmcBotConfig_json_1.default.nonPmcBots[name], items, name === "marksman");
        if (nonPmcBotConfig_json_1.default.nonPmcBots[name].HasModdedWeapons) {
            inventory.mods = tables.bots.types.usec.inventory.mods;
        }
        (0, NonPmcUtils_1.normalizeMedianInventoryValues)(inventory);
        const storedEquipmentValues = (0, NonPmcUtils_1.buildEmptyWeightAdjustmentsByDevision)(nonPmcBotConfig_json_1.default.nonPmcBots[name]);
        (0, NonPmcUtils_1.applyValuesToStoredEquipment)(inventory, items, storedEquipmentValues);
        // if (name === "marksman") {
        //   saveToFile(tables.bots.types[name].inventory, `refDBS/marksman2.json`);
        // }
        GlobalValues_1.globalValues.storedEquipmentValues[name] = storedEquipmentValues;
    });
    // console.log(bots);
    // saveToFile(
    //   globalValues.storedEquipmentValues,
    //   `refDBS/storedEquipmentValues.json`
    // );
    // saveToFile(botConfig.equipment.assault, "refDBS/equipmentAssault.json");
    // saveToFile(
    //   globalValues.tables.bots.types["assault"]?.inventory,
    //   `NonPmcBotChanges/botsRef/storedAssault.json`
    // );
    config_json_1.default.debug &&
        console.log("Algorthimic Progression: nonPmcBots equipment stored!");
}
//# sourceMappingURL=SetupNonPMCBotChanges.js.map