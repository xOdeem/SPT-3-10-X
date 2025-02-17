"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.calculateTotalDistance = calculateTotalDistance;
const lodash_1 = __importDefault(require("lodash"));
function calculateDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const dz = point2.z - point1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
function calculateTotalDistance(positions_grouped, logger) {
    const positions = lodash_1.default.valuesIn(positions_grouped);
    const distances = [];
    for (let i = 0; i < positions.length; i++) {
        const playerPositions = positions[i];
        let previousPoint = null;
        let totalDistance = 0;
        for (let j = 0; j < playerPositions.length; j++) {
            const position = playerPositions[j];
            if (previousPoint) {
                totalDistance += calculateDistance(previousPoint, position);
            }
            previousPoint = position;
        }
        distances.push(totalDistance);
    }
    const combinedTotalDistance = lodash_1.default.sumBy(distances);
    logger.log(`Total distance traveled: ${combinedTotalDistance}`);
    return combinedTotalDistance;
}
//# sourceMappingURL=CalculateDistancesTravelled.js.map