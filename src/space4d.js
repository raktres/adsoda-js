//import * from "./halfspace.js";
import { Space } from "./space.js";
//export {default as Solid, createSolidFromHalfSpaces } from "./solid.js";
import { Solid } from "./solid.js";

export function cube3D(min, max) {
    return new Solid(3, [
        [-1, 0, 0, max],
        [1, 0, 0, -min],
        [0, -1, 0, max],
        [0, 1, 0, -min],
        [0, 0, -1, max],
        [0, 0, 1, -min]
    ]);
}

export function cube4D(min, max) {
    return new Solid(3, [
        [-1, 0, 0, 0, max],
        [1, 0, 0, 0, -min],
        [0, -1, 0, 0, max],
        [0, 1, 0, 0, -min],
        [0, 0, -1, 0, max],
        [0, 0, 1, 0, -min],
        [0, 0, 0, -1, max],
        [0, 0, 0, 1, -min]
    ]);
}
