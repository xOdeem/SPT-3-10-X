"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVE_POSITIONAL_DATA_STRUCTURE = void 0;
const fs_1 = __importDefault(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
// Data Structure Versions
// 1 = '' = positions[][]
// 2 = 'V2' = { <player-id> : positions[]  }
exports.ACTIVE_POSITIONAL_DATA_STRUCTURE = 'V3';
function CompileRaidPositionalData(raid_guid, logger) {
    logger.log(`Starting - Compiling positional data (${exports.ACTIVE_POSITIONAL_DATA_STRUCTURE}) for '${raid_guid}' into '.json' format.`);
    const file_suffixes = ['positions'];
    const files = [];
    for (let i = 0; i < file_suffixes.length; i++) {
        const file_suffix = file_suffixes[i];
        const fileExists = fs_1.default.existsSync(`${__dirname}/../../../data/positions/${raid_guid}_positions`);
        if (fileExists) {
            const file_data = fs_1.default.readFileSync(`${__dirname}/../../../data/positions/${raid_guid}_positions`, 'utf-8');
            files.push({
                datapoint: file_suffix,
                data: file_data
            });
        }
        ;
    }
    if (files.length === 0) {
        logger.log(`Finished - Compiling positional data for '${raid_guid}' into '.json' format.`);
        return;
    }
    let positional_data__grouped = {}; // Output to Filesystem, needed for positional replay.
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const [keys_str, ...data_str] = file.data.split('\n');
        const keys = keys_str.replace('\n', '').split(',');
        if (keys.length === 7) {
            keys.push('health');
            keys.push('maxHealth');
        }
        const rows = data_str.filter((row) => row !== '').map(row => {
            const values = row.split(',');
            // If we process 'V2' positional data, add the missing health information.
            if (values.length === 7) {
                values.push(null);
                values.push(null);
            }
            return values;
        });
        logger.log(`Found a total of '${rows.length}' recorded positions, processing into data structure '${exports.ACTIVE_POSITIONAL_DATA_STRUCTURE}'.`);
        if (file.datapoint === 'positions') {
            let allPositions = [];
            for (let j = 0; j < rows.length; j++) {
                const row = rows[j];
                let position = {};
                for (let k = 0; k < keys.length; k++) {
                    const key = keys[k];
                    position[key] = row[k];
                    if (['time', 'x', 'y', 'z', 'dir', 'health', 'maxHealth'].includes(key)) {
                        position[key] = Number(row[k]);
                    }
                }
                allPositions.push(position);
            }
            positional_data__grouped = lodash_1.default.chain(allPositions).orderBy('time', 'asc').groupBy('profileId').value();
        }
    }
    logger.log(`Finished - Compiling positional data (${exports.ACTIVE_POSITIONAL_DATA_STRUCTURE}) for '${raid_guid}' into '.json' format.`);
    fs_1.default.writeFileSync(`${__dirname}/../../../data/positions/${raid_guid}_${exports.ACTIVE_POSITIONAL_DATA_STRUCTURE}_positions.json`, JSON.stringify(positional_data__grouped), 'utf-8');
    logger.log(`Saved file  '${raid_guid}_positions.json' to folder '<mod_folder>/data/positions'.`);
    return positional_data__grouped;
}
;
exports.default = CompileRaidPositionalData;
//# sourceMappingURL=CompileRaidPositionalData.js.map