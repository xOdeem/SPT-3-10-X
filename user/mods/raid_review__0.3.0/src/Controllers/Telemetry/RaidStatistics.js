"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendStatistics = sendStatistics;
const _ = __importStar(require("lodash"));
const CalculateDistancesTravelled_1 = require("../PositionalData/CalculateDistancesTravelled");
const GetRaidData_1 = require("../Collection/GetRaidData");
async function sendStatistics(db, logger, raidId, positions) {
    const raidData = await (0, GetRaidData_1.getRaidData)(db, logger, raidId);
    logger.log(`Generating statistics payload.`);
    const payload = await generateStatisticsPayload(logger, raidData, positions);
    logger.log(`Sending statistics payload.`);
    await sendStatisticsPayload(payload, logger);
    logger.log(`Statistics payload recieved.`);
}
async function generateStatisticsPayload(logger, raid, positions) {
    // Data points
    let players = {
        total: 0,
        usec: 0,
        bear: 0,
        savage: 0
    };
    let kills = {
        total: 0,
        usec: 0,
        bear: 0,
        savage: 0
    };
    // Should speed up data reads
    let playerDic = _.groupBy(raid.players, 'playerId');
    // Iterations
    let lootingsLen = raid.looting.length;
    players.total = raid.players.length;
    raid.players.forEach(player => {
        if (player && player.team) {
            let lowercaseTeam = player.team.toLowerCase();
            if (!players[lowercaseTeam] !== undefined) {
                players[lowercaseTeam]++;
            }
        }
    });
    // Iterating through kills to count kills per team
    kills.total = raid.kills.length;
    raid.kills.forEach(kill => {
        let killedPlayer = playerDic[kill.killedId];
        if (killedPlayer && killedPlayer.team) {
            let lowercaseTeam = killedPlayer.team.toLowerCase();
            if (kills[lowercaseTeam] !== undefined) {
                kills[lowercaseTeam]++;
            }
        }
    });
    // Final Payload
    const data = {
        raidId: raid.raidId,
        location: raid.location,
        status: raid.exitStatus,
        time: Number(raid.timeInRaid),
        players,
        kills,
        lootings: lootingsLen,
        positions: _.chain(positions).valuesIn().flatMapDeep().value().length,
        distanceTravelled: (0, CalculateDistancesTravelled_1.calculateTotalDistance)(positions, logger)
    };
    return data;
}
async function sendStatisticsPayload(statisticsPayload, logger) {
    try {
        await fetch(`https://telemetry.raid-review.online/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(statisticsPayload)
        });
    }
    catch (error) {
        logger.log(`There was an issue sending statistics to 'raid-review' server.`);
        logger.log(error);
    }
}
//# sourceMappingURL=RaidStatistics.js.map