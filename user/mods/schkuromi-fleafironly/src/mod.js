"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mod = void 0;
class Mod {
    postDBLoad(container) {
        const logger = container.resolve("WinstonLogger");
        // get database from the server
        const databaseServer = container.resolve("DatabaseServer");
        // get all the in-memory json foudn in /assets/database
        const tables = databaseServer.getTables();
        // change flea market to only allow selling for FIR items
        tables.globals.config.RagFair.isOnlyFoundInRaidAllowed = true;
        logger.log("[SCHKRM] Flea Market now only accepts FIR items", "yellow");
    }
}
exports.mod = new Mod();
//# sourceMappingURL=mod.js.map