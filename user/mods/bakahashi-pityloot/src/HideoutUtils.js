"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HideoutUtils = void 0;
const DatabaseUtils_1 = require("./DatabaseUtils");
function getSkillLevelFromProgress(progress) {
    let xpToLevel = 10;
    let level = 0;
    while (progress > xpToLevel) {
        level += 1;
        progress -= xpToLevel;
        xpToLevel = Math.min(100, xpToLevel + 10);
    }
    return level;
}
class HideoutUtils {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    getHideoutRequirements(hideoutAreas, profile) {
        const possibleUpgrades = this.getPossibleHideoutUpgrades(hideoutAreas, profile);
        const hideoutTracker = (0, DatabaseUtils_1.loadPityTrackerDatabase)().hideout;
        return possibleUpgrades.flatMap((possibleUpgrade) => {
            const tracker = hideoutTracker[possibleUpgrade.area];
            const secondsSinceStarted = tracker?.timeAvailable
                ? Math.round((Date.now() - tracker.timeAvailable) / 1000)
                : 0;
            return possibleUpgrade.requiredItems.flatMap((requiredItem) => ({
                type: "hideout",
                amountRequired: requiredItem.count,
                itemId: requiredItem.id,
                raidsSinceStarted: tracker?.raidsSinceStarted ?? 0,
                secondsSinceStarted,
            }));
        });
    }
    // Returns a list of hideouts upgrades that you meet all the prerequisites for, and what items are required
    getPossibleHideoutUpgrades(hideoutAreas, profile) {
        const completedHideoutAreas = Object.fromEntries(profile.characters.pmc.Hideout.Areas.map((h) => [
            h.type,
            h.constructing ? h.level + 1 : h.level,
        ]));
        const traders = profile.characters.pmc.TradersInfo;
        const skillLevels = Object.fromEntries(profile.characters.pmc.Skills.Common.map((s) => [
            s.Id,
            getSkillLevelFromProgress(s.Progress),
        ]));
        // Get the next hideout upgrade per area
        const possibleUpgrades = [];
        for (const area of hideoutAreas) {
            const currentLevel = completedHideoutAreas[area.type] ?? 0;
            const nextStage = area.stages[currentLevel + 1];
            if (nextStage) {
                let canUpgrade = true;
                const requiredItems = [];
                for (const req of nextStage.requirements) {
                    switch (req.type) {
                        case "Area":
                            if (req.areaType == null || req.requiredLevel == null) {
                                this.logger.warning(`Corrupt area stage requirement for area ${area._id} stage ${currentLevel + 1}, req: ${JSON.stringify(req, null, 2)}`);
                                break;
                            }
                            if ((completedHideoutAreas[req.areaType] ?? 0) < req.requiredLevel) {
                                canUpgrade = false;
                            }
                            break;
                        case "Skill":
                            if (req.skillLevel == null || !req.skillName) {
                                this.logger.warning(`Corrupt skill stage requirement for area ${area._id} stage ${currentLevel + 1}, req: ${JSON.stringify(req, null, 2)}`);
                                break;
                            }
                            if ((skillLevels[req.skillName] ?? 0) < req.skillLevel) {
                                canUpgrade = false;
                            }
                            break;
                        case "TraderLoyalty":
                            if (!req.traderId || req.loyaltyLevel == null) {
                                this.logger.warning(`Corrupt trader stage requirement for area ${area._id} stage ${currentLevel + 1}, req: ${JSON.stringify(req, null, 2)}`);
                                break;
                            }
                            if ((traders[req.traderId]?.loyaltyLevel ?? 0) < req.loyaltyLevel) {
                                canUpgrade = false;
                            }
                            break;
                        case "Item":
                            if (req.count == null || !req.templateId) {
                                this.logger.warning(`Corrupt item stage requirement for area ${area._id} stage ${currentLevel + 1}, req: ${JSON.stringify(req, null, 2)}`);
                                break;
                            }
                            requiredItems.push({
                                count: req.count,
                                id: req.templateId,
                            });
                            break;
                        default:
                            this.logger.warning(`Unknown stage requirement for area ${area._id} stage ${currentLevel + 1}, req: ${JSON.stringify(req, null, 2)}`);
                            break;
                    }
                }
                if (canUpgrade) {
                    possibleUpgrades.push({
                        area: area.type,
                        level: currentLevel + 1,
                        requiredItems,
                    });
                }
            }
        }
        return possibleUpgrades;
    }
}
exports.HideoutUtils = HideoutUtils;
//# sourceMappingURL=HideoutUtils.js.map