"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EBodyPartColliderType = exports.EPlayerSide = exports.ExitStatus = void 0;
require("express");
// Client Side Class Mirrors
var ExitStatus;
(function (ExitStatus) {
    ExitStatus[ExitStatus["Survived"] = 0] = "Survived";
    ExitStatus[ExitStatus["Killed"] = 1] = "Killed";
    ExitStatus[ExitStatus["Left"] = 2] = "Left";
    ExitStatus[ExitStatus["Runner"] = 3] = "Runner";
    ExitStatus[ExitStatus["MissingInAction"] = 4] = "MissingInAction";
})(ExitStatus || (exports.ExitStatus = ExitStatus = {}));
var EPlayerSide;
(function (EPlayerSide) {
    EPlayerSide[EPlayerSide["Usec"] = 1] = "Usec";
    EPlayerSide[EPlayerSide["Bear"] = 2] = "Bear";
    EPlayerSide[EPlayerSide["Savage"] = 4] = "Savage";
})(EPlayerSide || (exports.EPlayerSide = EPlayerSide = {}));
var EBodyPartColliderType;
(function (EBodyPartColliderType) {
    EBodyPartColliderType[EBodyPartColliderType["None"] = -1] = "None";
    EBodyPartColliderType[EBodyPartColliderType["Head"] = 0] = "Head";
    EBodyPartColliderType[EBodyPartColliderType["Ribcage"] = 1] = "Ribcage";
    EBodyPartColliderType[EBodyPartColliderType["Stomach"] = 2] = "Stomach";
    EBodyPartColliderType[EBodyPartColliderType["Pelvis"] = 3] = "Pelvis";
    EBodyPartColliderType[EBodyPartColliderType["LeftUpperArm"] = 4] = "LeftUpperArm";
    EBodyPartColliderType[EBodyPartColliderType["LeftForearm"] = 5] = "LeftForearm";
    EBodyPartColliderType[EBodyPartColliderType["RightUpperArm"] = 6] = "RightUpperArm";
    EBodyPartColliderType[EBodyPartColliderType["RightForearm"] = 7] = "RightForearm";
    EBodyPartColliderType[EBodyPartColliderType["LeftThigh"] = 8] = "LeftThigh";
    EBodyPartColliderType[EBodyPartColliderType["LeftCalf"] = 9] = "LeftCalf";
    EBodyPartColliderType[EBodyPartColliderType["RightThigh"] = 10] = "RightThigh";
    EBodyPartColliderType[EBodyPartColliderType["RightCalf"] = 1] = "RightCalf";
})(EBodyPartColliderType || (exports.EBodyPartColliderType = EBodyPartColliderType = {}));
//# sourceMappingURL=types.d.js.map