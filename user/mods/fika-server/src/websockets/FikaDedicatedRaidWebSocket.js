"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FikaDedicatedRaidWebSocket = void 0;
const tsyringe_1 = require("C:/snapshot/project/node_modules/tsyringe");
const ILogger_1 = require("C:/snapshot/project/obj/models/spt/utils/ILogger");
const SaveServer_1 = require("C:/snapshot/project/obj/servers/SaveServer");
const ws_1 = require("C:/snapshot/project/node_modules/ws");
let FikaDedicatedRaidWebSocket = class FikaDedicatedRaidWebSocket {
    saveServer;
    logger;
    clientWebSockets;
    constructor(saveServer, logger) {
        this.saveServer = saveServer;
        this.logger = logger;
        this.clientWebSockets = {};
        // Keep websocket connections alive
        setInterval(() => {
            this.keepWebSocketAlive();
        }, 30000);
    }
    getSocketId() {
        return "Fika Dedicated Raid Service";
    }
    getHookUrl() {
        return "/fika/dedicatedraidservice/";
    }
    onConnection(ws, req) {
        if (req.headers.authorization === undefined) {
            ws.close();
            return;
        }
        const Authorization = Buffer.from(req.headers.authorization.split(" ")[1], "base64").toString().split(":");
        const UserSessionID = Authorization[0];
        this.logger.debug(`[${this.getSocketId()}] User is ${UserSessionID}`);
        if (!this.saveServer.getProfile(UserSessionID)) {
            this.logger.warning(`[${this.getSocketId()}] Invalid user ${UserSessionID} tried to authenticate!`);
            return;
        }
        this.clientWebSockets[UserSessionID] = ws;
        ws.on("message", (msg) => this.onMessage(UserSessionID, msg.toString()));
        ws.on("close", (code, reason) => this.onClose(ws, UserSessionID, code, reason));
    }
    // biome-ignore lint/correctness/noUnusedVariables: Currently unused, but might be implemented in the future.
    onMessage(sessionID, msg) {
        // Do nothing
    }
    // biome-ignore lint/correctness/noUnusedVariables: Currently unused, but might be implemented in the future.
    onClose(ws, sessionID, code, reason) {
        const clientWebSocket = this.clientWebSockets[sessionID];
        if (clientWebSocket === ws) {
            this.logger.debug(`[${this.getSocketId()}] Deleting client ${sessionID}`);
            delete this.clientWebSockets[sessionID];
        }
    }
    keepWebSocketAlive() {
        for (const sessionId in this.clientWebSockets) {
            const clientWebSocket = this.clientWebSockets[sessionId];
            if (clientWebSocket.readyState == ws_1.WebSocket.CLOSED) {
                delete this.clientWebSockets[sessionId];
                return;
            }
            // Send a keep alive message to the dedicated client
            clientWebSocket.send(JSON.stringify({
                type: "fikaDedicatedKeepAlive",
            }));
        }
    }
};
exports.FikaDedicatedRaidWebSocket = FikaDedicatedRaidWebSocket;
exports.FikaDedicatedRaidWebSocket = FikaDedicatedRaidWebSocket = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)("SaveServer")),
    __param(1, (0, tsyringe_1.inject)("WinstonLogger")),
    __metadata("design:paramtypes", [typeof (_a = typeof SaveServer_1.SaveServer !== "undefined" && SaveServer_1.SaveServer) === "function" ? _a : Object, typeof (_b = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _b : Object])
], FikaDedicatedRaidWebSocket);
//# sourceMappingURL=FikaDedicatedRaidWebSocket.js.map