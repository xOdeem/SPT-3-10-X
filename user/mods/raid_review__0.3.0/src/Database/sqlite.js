"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = database;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const fs_1 = require("fs");
// you would have to import / invoke this in another file
async function database(logger) {
    (0, fs_1.mkdirSync)(`${__dirname}/../../data`, { recursive: true });
    const filename = `${__dirname}/../../data/raid_review_mod.db`;
    const migrations = `${__dirname}/migrations`;
    logger.log('Database Path: ' + filename);
    logger.log('Migration Paths: ' + migrations);
    const db = await (0, sqlite_1.open)({
        filename: filename,
        driver: sqlite3_1.default.Database
    });
    await db.migrate({
        migrationsPath: migrations
    });
    return db;
}
;
//# sourceMappingURL=sqlite.js.map