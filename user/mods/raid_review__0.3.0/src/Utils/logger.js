"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const config_json_1 = __importDefault(require("../../config.json"));
const DataSaver_1 = require("../Controllers/FileSystem/DataSaver");
const FileReader_1 = require("../Controllers/FileSystem/FileReader");
/**
 * Abstraction for `console.log`, so that we can switch logging libraries in the future
 * Also allows us to dump to log files for support purposes.
 */
class Logger {
    logfilename;
    constructor() {
        this.logfilename = null;
    }
    /**
     * Creats a new log file, and purges old ones.
     * - Called when the server is started. (See 'mod.ts')
     * - Called if the server is active, and the last raid finishes, or is timed out (See 'sessionManager.ts').
     */
    init() {
        if (config_json_1.default.enableLogFiles) {
            const existingLogs = (0, FileReader_1.ReadFolderContents)('logging', '', '', false);
            if (existingLogs.length > config_json_1.default.maximumLogFiles) {
                existingLogs.sort((a, b) => {
                    // Expects filenames to be <utc-milliseconds>_raid_review.log
                    return parseInt(a.split('_')[0]) - parseInt(b.split('_')[0]);
                });
                (0, DataSaver_1.DeleteFile)('logs', '', '', existingLogs[0]);
            }
            this.logfilename = `${new Date().getTime()}_raid_review.log`;
            this.log(`New log file created for session '${this.logfilename}', this can be found in the '/logs' directory of the mod folder.`);
        }
    }
    log(str) {
        console.log(`[RAID-REVIEW] ${str}`);
        this.appendToLogFile(str);
    }
    debug(str) {
        if (config_json_1.default.enableDebugLogs) {
            console.debug(`[RAID-REVIEW] ${str}`);
        }
        this.appendToLogFile(str);
    }
    warn(str) {
        console.warn(`[RAID-REVIEW] ${str}`);
        this.appendToLogFile(str);
    }
    error(str, dump = null) {
        console.error(`[RAID-REVIEW] ${str}`);
        if (str || dump) {
            console.error(`[RAID-REVIEW:DUMP] ${dump}`);
        }
    }
    appendToLogFile(str) {
        const dateTime = new Date().toISOString();
        const logMessage = `${dateTime} - ${str}\n`;
        (0, DataSaver_1.WriteLineToFile)(this, 'logs', '', '', this.logfilename, dateTime, logMessage);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map