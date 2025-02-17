"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRaidData = getRaidData;
const DataSaver_1 = require("../FileSystem/DataSaver");
const CompileRaidPositionalData_1 = require("../PositionalData/CompileRaidPositionalData");
async function getRaidData(db, logger, raidId) {
    // Need to fix this; N+1 Problem
    const sqlRaidQuery = `SELECT * FROM raid WHERE timeInRaid > 10 AND raidId = ?`;
    const sqlRaidValues = [raidId];
    const raid = await db
        .get(sqlRaidQuery, sqlRaidValues)
        .catch((e) => logger.error(`[ERR:GET_RAID_DATA_CORE] `, e));
    const keys = ["kills", "looting", "player", "player_status", "ballistic"];
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        let sqlKeyQuery = `SELECT * FROM ${key} WHERE raidId = ? ORDER BY time ASC`;
        if (key === 'player') {
            sqlKeyQuery = `SELECT * FROM ${key} WHERE raidId = ? ORDER BY spawnTime ASC, "group" ASC`;
        }
        const sqlKeyValues = [raidId];
        const sqlResult = await db.all(sqlKeyQuery, sqlKeyValues).catch((e) => logger.error(`[ERR:GET_RAID_DATA_KEYS] `, e));
        raid[key] = sqlResult || [];
    }
    // Positions check
    const rawPositionData = (0, DataSaver_1.FileExists)(logger, "positions", "", "", `${raidId}_positions`);
    const compiledPositionData = (0, DataSaver_1.FileExists)(logger, "positions", "", "", `${raidId}_${CompileRaidPositionalData_1.ACTIVE_POSITIONAL_DATA_STRUCTURE}_positions.json`);
    raid.positionsTracked = compiledPositionData ? 'COMPILED' : rawPositionData ? 'RAW' : 'NOT_AVAILABLE';
    // Quick Fix
    raid.players = raid.player;
    delete raid.player;
    return raid;
}
//# sourceMappingURL=GetRaidData.js.map