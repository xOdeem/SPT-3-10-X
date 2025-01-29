"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationUpdater = void 0;
const GlobalValues_1 = require("./GlobalValues");
const config_json_1 = require("../../config/config.json");
const LocationUpdater = (container) => {
    const staticRouterModService = container.resolve("StaticRouterModService");
    const weatherController = container.resolve("WeatherController");
    staticRouterModService.registerStaticRouter(`AlgorithmicLevelProgressionMapUpdater`, [
        {
            url: "/client/match/local/start",
            action: async (_url, info, sessionId, output) => {
                const time = weatherController.generate().time;
                const hours = getTime(time, info.timeVariant === "PAST" ? 12 : 0);
                // console.log("hours", hours);
                try {
                    GlobalValues_1.globalValues.setValuesForLocation(info.location.toLowerCase(), hours);
                    if (config_json_1.enableNonPMCBotChanges) {
                        const pmcData = GlobalValues_1.globalValues.profileHelper.getPmcProfile(sessionId);
                        GlobalValues_1.globalValues.updateInventory(pmcData?.Info?.Level || 1, info.location.toLowerCase());
                    }
                    console.log("Algorthimic LevelProgression: Loaded");
                }
                catch (error) {
                    console.log(`"Algorthimic LevelProgression: failed to make equipment changes.
                ` + error?.message);
                }
                return output;
            },
        },
    ], "aki");
    GlobalValues_1.globalValues.config.debug &&
        console.log("Algorthimic LevelProgression: Custom router AlgorithmicLevelProgressionMapUpdater Registered");
};
exports.LocationUpdater = LocationUpdater;
function getTime(time, hourDiff) {
    let [hours, minutes] = time.split(":");
    if (hourDiff == 12 && parseInt(hours) >= 12) {
        return Math.abs(parseInt(hours) - hourDiff);
    }
    return Math.abs(parseInt(hours) + hourDiff);
}
//# sourceMappingURL=LocationUpdater.js.map