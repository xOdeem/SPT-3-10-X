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
exports.ReadFileContent = ReadFileContent;
exports.ReadFolderContents = ReadFolderContents;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function ReadFileContent(parentFolder, subFolder, targetFolder, fileName) {
    let paths = [__dirname + '/../../../', 'data', parentFolder, subFolder, targetFolder, fileName];
    paths = paths.filter(path => path !== '');
    const filePath = path.join(...paths);
    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
        let content = fs.readFileSync(filePath, 'utf-8');
        if (fileName.includes('json')) {
            content = JSON.parse(content);
        }
        return content;
    }
    return null;
}
;
/**
 * Returns a file listing of the target folder.
 * @param parentFolder Default = ''
 * @param subFolder Default = ''
 * @param targetFolder Default = ''
 * @param fullPath If true, returns the full system path.
 * @returns Array of file names with or without the full path depending on 'fullPath' value.
 */
function ReadFolderContents(parentFolder = '', subFolder = '', targetFolder = '', fullPath = false) {
    const directoryListing = [];
    let paths = [__dirname + '/../../../', 'data', parentFolder, subFolder, targetFolder];
    paths = paths.filter(path => path !== '');
    const folderPath = path.join(...paths);
    const folderExists = fs.existsSync(folderPath);
    if (folderExists) {
        const files = fs.readdirSync(folderPath);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (fullPath) {
                directoryListing.push(`${folderPath}/${file}`);
            }
            else {
                directoryListing.push(file);
            }
        }
    }
    return directoryListing;
}
//# sourceMappingURL=FileReader.js.map