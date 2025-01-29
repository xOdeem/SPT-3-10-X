"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LogTextColor_1 = require("C:/snapshot/project/obj/models/spt/logging/LogTextColor");
class RemoveTimeGateFromQuests {
    logger;
    preAkiLoad(container) {
        this.logger = container.resolve("WinstonLogger");
    }
    postDBLoad(container) {
        // get database from server
        const databaseServer = container.resolve("DatabaseServer");
        this.logger = container.resolve("WinstonLogger");
        // Get all the in-memory json found in /assets/database
        const tables = databaseServer.getTables();
        const quests = tables.templates.quests;
        for (const quest in quests) {
            const conditionsAOS = quests[quest].conditions.AvailableForStart;
            if (conditionsAOS !== undefined) {
                for (const condition in conditionsAOS) {
                    if (conditionsAOS[condition]?.conditionType === "Quest" && conditionsAOS[condition]?.availableAfter > 0) {
                        conditionsAOS[condition].availableAfter = 0;
                        this.logger.logWithColor(`${quests[quest].QuestName} Time requirement removed.`, LogTextColor_1.LogTextColor.GREEN);
                    }
                }
            }
        }
    }
}
module.exports = { mod: new RemoveTimeGateFromQuests() };
//# sourceMappingURL=mod.js.map