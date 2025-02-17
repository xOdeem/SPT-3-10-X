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
exports.WriteLineToFile = WriteLineToFile;
exports.CreateFolder = CreateFolder;
exports.DeleteFile = DeleteFile;
exports.RenameFile = RenameFile;
exports.ReadFile = ReadFile;
exports.FileExists = FileExists;
const fs = __importStar(require("fs"));
function CreateFolder(logger, parentFolder, subFolder = '', targetFolder = '') {
    let paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder];
    let finalPath = paths.filter(path => path !== '').join('/');
    if (!fs.existsSync(finalPath)) {
        fs.mkdirSync(finalPath, { recursive: true });
        logger.log(`Folder created: ${finalPath}`);
    }
}
function CreateFile(logger, parentFolder, subFolder = '', targetFolder, fileName, keys) {
    CreateFolder(logger, parentFolder);
    CreateFolder(logger, parentFolder, subFolder);
    CreateFolder(logger, parentFolder, subFolder, targetFolder);
    let paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder, `${fileName}`];
    let finalPath = paths.filter(path => path !== '').join('/');
    if (!fs.existsSync(finalPath)) {
        fs.writeFileSync(finalPath, '', 'utf-8');
        fs.appendFileSync(finalPath, keys, 'utf-8');
        logger.log(`File created: ${finalPath}`);
    }
}
function WriteLineToFile(logger, parentFolder, subFolder = '', targetFolder = '', fileName, keys, value) {
    CreateFile(logger, parentFolder, subFolder, targetFolder, fileName, keys);
    let paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder, `${fileName}`];
    let finalPath = paths.filter(path => path !== '').join('/');
    fs.appendFileSync(finalPath, value, 'utf-8');
}
function DeleteFile(parentFolder, subFolder = '', targetFolder = '', fileName) {
    let paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder, `${fileName}`];
    let finalPath = paths.filter(path => path !== '').join('/');
    let exists = fs.existsSync(finalPath);
    if (exists) {
        fs.rmSync(finalPath);
    }
}
function RenameFile(logger, parentFolder, subFolder = '', targetFolder = '', fileName, newFilename) {
    try {
        let paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder, `${fileName}`];
        let finalPath = paths.filter(path => path !== '').join('/');
        let rename_paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder, `${newFilename}`];
        let renameFinalPath = rename_paths.filter(path => path !== '').join('/');
        let exists = fs.existsSync(finalPath);
        if (exists) {
            fs.renameSync(finalPath, renameFinalPath);
        }
    }
    catch (error) {
        logger.error(`[ERR:RENAME] `, error);
    }
}
function ReadFile(logger, parentFolder, subFolder = '', targetFolder = '', fileName) {
    try {
        let paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder, `${fileName}`];
        let finalPath = paths.filter(path => path !== '').join('/');
        if (fs.existsSync(finalPath)) {
            return fs.readFileSync(finalPath, 'utf-8');
        }
        return '';
    }
    catch (error) {
        logger.error(`[ERR:READ]`, error);
        return '';
    }
}
function FileExists(logger, parentFolder, subFolder = '', targetFolder = '', fileName) {
    try {
        let paths = [__dirname, '../../..', 'data', parentFolder, subFolder, targetFolder, `${fileName}`];
        let finalPath = paths.filter(path => path !== '').join('/');
        let exists = fs.existsSync(finalPath);
        return exists;
    }
    catch (error) {
        logger.error(`[ERR:EXISTS]`, error);
        return false;
    }
}
//# sourceMappingURL=DataSaver.js.map