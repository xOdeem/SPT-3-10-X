"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNever = assertNever;
function assertNever(value, noThrow) {
    if (noThrow) {
        return value;
    }
    throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}
//# sourceMappingURL=helpers.js.map