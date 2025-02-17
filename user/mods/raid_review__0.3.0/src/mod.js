"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const node_cron_1 = __importDefault(require("node-cron"));
const config_json_1 = __importDefault(require("../config.json"));
const Express_1 = __importDefault(require("./Server/Express"));
const sqlite_1 = require("./Database/sqlite");
const PositionsMigration_1 = require("./Controllers/PositionalData/PositionsMigration");
const CheckForMissingMainPlayer_1 = require("./Controllers/DataIntegrity/CheckForMissingMainPlayer");
const TheGarbageCollector_1 = require("./Controllers/DataIntegrity/TheGarbageCollector");
const RaidStatistics_1 = require("./Controllers/Telemetry/RaidStatistics");
const CompileRaidPositionalData_1 = __importDefault(require("./Controllers/PositionalData/CompileRaidPositionalData"));
const packetHandler_1 = require("./Controllers/PacketHandler/packetHandler");
const sessionManager_1 = require("./Controllers/StateManagers/sessionManager");
const modDetection_1 = require("./Controllers/Integrations/modDetection");
const constant_1 = require("./constant");
const logger_1 = require("./Utils/logger");
class Mod {
    saveServer;
    profileHelper;
    intl;
    logger;
    wss;
    database;
    modDetector;
    sessionManager;
    raids_to_process;
    constructor() {
        this.saveServer = null;
        this.wss = null;
        this.database = null;
        this.raids_to_process = [];
        this.logger = new logger_1.Logger();
        this.logger.init();
        this.sessionManager = new sessionManager_1.SessionManager(this.logger);
    }
    preSptLoad(container) {
        const staticRouterModService = container.resolve('StaticRouterModService');
        staticRouterModService.registerStaticRouter('GetPlayerInfo', [
            {
                url: '/client/game/start',
                action: async (_url, __info, sessionId, output) => {
                    const profile = this.profileHelper.getFullProfile(sessionId);
                    this.sessionManager.addProfile(profile.info.id, {
                        profile,
                        raidId: null,
                        timeout: 0,
                    });
                    // Print 
                    this.logger.debug(`[ROUTE:/CLIENT/GAME/START] ADDED_PROFILE: ${profile.info.id}`);
                    this.logger.debug(`[ROUTE:/CLIENT/GAME/START] ACTIVE_PROFILES: ` + Array.from(this.sessionManager.getProfiles().entries()).map(p => profile.info.id).join(', '));
                    return output;
                },
            },
            {
                url: '/client/game/keepalive',
                action: async (_url, __info, sessionId, output) => {
                    this.sessionManager.pingProfile(sessionId);
                    return output;
                },
            }
        ], 'aki');
    }
    async postSptLoad(container) {
        this.profileHelper = container.resolve('ProfileHelper');
        this.intl = container.resolve('LocaleService');
        // Database connection
        this.database = await (0, sqlite_1.database)(this.logger);
        this.logger.log(`Database Connected`);
        // Get Installed Mods
        this.modDetector = new modDetection_1.ModDetector(this.logger);
        // Data Position Migration
        // @ekky @ 2024-06-18: Added this for the move from v0.0.3 to v0.0.4
        await (0, PositionsMigration_1.MigratePositionsStructure)(this.database, this.logger);
        // Missing Player Fix
        // @ekky @ 2024-06-19: Added this to help fix this 'Issue # 25'
        const profileHelper = container.resolve('ProfileHelper');
        const profiles = profileHelper.getProfiles();
        await (0, CheckForMissingMainPlayer_1.CheckForMissingMainPlayer)(this.database, this.logger, profiles);
        // Storage Saving Helpers
        await (0, TheGarbageCollector_1.GarbageCollectOldRaids)(this.database, this.logger);
        await (0, TheGarbageCollector_1.GarbageCollectUnfinishedRaids)(this.database, this.logger);
        if (config_json_1.default.autoDeleteCronJob) {
            node_cron_1.default.schedule('0 */1 * * *', async () => {
                await (0, TheGarbageCollector_1.GarbageCollectOldRaids)(this.database, this.logger);
                await (0, TheGarbageCollector_1.GarbageCollectUnfinishedRaids)(this.database, this.logger);
            });
        }
        // Automatic Processor
        const post_raid_processing = node_cron_1.default.schedule('*/1 * * * *', async () => {
            if (this.raids_to_process.length > 0) {
                for (let i = 0; i < this.raids_to_process.length; i++) {
                    const raidIdToProcess = this.raids_to_process[i];
                    let positional_data = (0, CompileRaidPositionalData_1.default)(raidIdToProcess, this.logger);
                    let telemetryEnabled = config_json_1.default.telemetry;
                    if (telemetryEnabled) {
                        this.logger.log(`Telemetry is enabled.`);
                        await (0, RaidStatistics_1.sendStatistics)(this.database, this.logger, raidIdToProcess, positional_data);
                    }
                    else {
                        this.logger.log(`Telemetry is disabled.`);
                    }
                }
                this.raids_to_process = [];
                this.logger.log(`Disabled Post Processing: Post raid processing completed.`);
            }
            else {
                post_raid_processing.stop();
            }
        }, { scheduled: false });
        post_raid_processing.start();
        this.saveServer = container.resolve('SaveServer');
        this.logger.log(`SPT Server Connected.`);
        this.wss = new ws_1.WebSocketServer(constant_1.WebSocketConfig);
        this.wss.on('connection', async (ws) => {
            ws.on('error', packetHandler_1.errorPacketHandler);
            ws.on('message', (data) => (0, packetHandler_1.messagePacketHandler)(data, this.database, this.sessionManager, this.modDetector, this.logger, profiles, post_raid_processing));
        });
        this.logger.log(`Websocket Server Listening on 'ws://127.0.0.1:${config_json_1.default.web_socket_port}'.`);
        (0, Express_1.default)(this.saveServer, this.profileHelper, this.database, this.intl, this.logger);
    }
}
module.exports = { mod: new Mod() };
//# sourceMappingURL=mod.js.map