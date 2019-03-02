//import * from "./halfspace.js";
export * from "./parameters.js";
export { NDObject } from "./ndobject.js";
// export { Light } from "./light.js";
export { Space } from "./space.js";
export { Face } from "./face.js";
export { Solid } from "./solid.js";
export { cube3D, cube4D } from "./space4d.js";

//export { createSolidFromHalfSpaces} ;
//const u = [1, 2, 3, e];
//const v = [2, 3, 4, 5];

//console.log(translateHS(u, v));

// export function createSolid(halfspaces) {
//     const solid = new Solid(halfspaces[0].length - 1);
//     halfspaces.forEach(HS => solid.suffixFace(new Face(HS)));
//     solid.ensureAdjacencies();
//     return solid;
// }
