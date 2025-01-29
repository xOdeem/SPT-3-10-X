"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
const node_path_1 = __importDefault(require("node:path"));
const ConfigTypes_1 = require("C:/snapshot/project/obj/models/enums/ConfigTypes");
const jsonc_1 = require("C:/snapshot/project/node_modules/jsonc");
class Mod {
    preSptLoad(container) {
        const weatherCallbacks = container.resolve("WeatherCallbacks");
        const router = container.resolve("StaticRouterModService");
        const logger = container.resolve("WinstonLogger");
        router.registerStaticRouter("[RSR] /client/weather", [
            {
                url: "/client/weather",
                action: (url, info, sessionID) => {
                    const sptConfigWeather = container.resolve("ConfigServer").getConfig(ConfigTypes_1.ConfigTypes.WEATHER);
                    const season = this.getRandomSeason(container);
                    sptConfigWeather.overrideSeason = season;
                    logger.success(`${this.modName} Randomly Selected Season: ${this.seasonsArray[season]}`);
                    return weatherCallbacks.getWeather(url, info, sessionID);
                }
            }
        ], "[RSR] /client/weather");
    }
    postDBLoad(container) {
        // Don't fuck with the science team!
    }
    modName = "[Random Season Ripoff]";
    seasonsArray = [
        "Summer", // 0
        "Autumn", // 1
        "Winter", // 2
        "Spring", // 3
        "Late Autumn", // 4
        "Early Spring", // 5
        "Storm" // 6
    ]; // seasons array
    getRandomSeason(container) {
        const logger = container.resolve("WinstonLogger");
        // Resolve the Virtual File System (VFS) from the container to handle file operations.
        const vfs = container.resolve("VFS");
        // Read and parse the JSONC configuration file located in the "config" directory.
        const modConfigJsonC = jsonc_1.jsonc.parse(vfs.readFile(node_path_1.default.resolve(__dirname, "../config/config.jsonc")));
        // Extract the season weights from the parsed configuration file and store them in an array.
        const seasonWeights = [
            modConfigJsonC.Summer,
            modConfigJsonC.Autumn,
            modConfigJsonC.Winter,
            modConfigJsonC.Spring,
            modConfigJsonC.LateAutumn,
            modConfigJsonC.EarlySpring,
            modConfigJsonC.Storm
        ];
        // Check if any value in seasonWeights is not a number or is negative, and returns if so.
        if (seasonWeights.some(weight => typeof weight !== "number" || weight < 0)) {
            logger.error(`${this.modName} Invalid season weights in config. All weights must be non-negative numbers.`);
            return;
        }
        // Calculate total of all season weights by summing up values in seasonWeights
        const totalWeight = seasonWeights.reduce((sum, weight) => sum + weight, 0);
        // Generate a random number between 0 and the total weight to select a season based on the weights.
        const random = Math.random() * totalWeight;
        // Iterate through the seasonWeights array, keeping a running total (cumulativeWeight).
        let cumulativeWeight = 0;
        for (let i = 0; i < seasonWeights.length; i++) {
            cumulativeWeight += seasonWeights[i];
            if (random < cumulativeWeight) {
                // Return the index of the first season where the random number is less than the cumulative weight.
                return i;
            }
        }
        throw new Error("Failed to select a season based on weightings.");
    }
}
exports.mod = new Mod();
//# sourceMappingURL=mod.js.map