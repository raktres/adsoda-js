import { createSolidFromHalfSpaces } from "../src/solid";
import { Space } from "../src/space";
import { Solid } from "../src/solid";

let sfb = Solid.createSolidFromHalfSpaces([
    [-1, -6, 78],
    [-3, 1, 25],
    [2, 6, -70],
    [2, -1, 0]
]);
sfb.name = "sfb";

let sfr = Solid.createSolidFromHalfSpaces([
    [3, -2, 11],
    [-4, -3, 42],
    [-3, -1, 24],
    [4, 6, -46]
]);
sfr.name = "sfr";

let sfg = Solid.createSolidFromHalfSpaces([
    [1, -2, 0],
    [-1, 0, 14],
    [-1, 3, 8],
    [4, 1, -45]
]);
sfg.name = "sfg";

describe("space test", () => {
    const space1 = new Space(2);
    test("test add solids", () => {
        space1.suffixSolid(sfb);
        space1.suffixSolid(sfr);
        expect([...space1.solids].length).toEqual(2);
        space1.suffixSolid(sfr);
        expect([...space1.solids].length).toEqual(2);
        space1.suffixSolid(sfg);
        expect([...space1.solids].length).toEqual(3);
    });

    test("space project", () => {
        space1.ensureSolids();
        const spaceP0 = space1.project(0);
        expect(spaceP0.dimension).toEqual(1);
        spaceP0.ensureSolids();
        expect([...spaceP0.solids].length).toEqual(3);

        const spaceP2 = space1.project(1);
        spaceP2.ensureSolids();
        expect(spaceP2.dimension).toEqual(1);
        expect([...spaceP2.solids].length).toEqual(3);
    });
    test("space to JSON", () => {
        space1.ensureSolids();
        const txt = space1.exportToJSON();
        console.log(txt);
        expect(txt.length).toBeGreaterThan(1);
    });
    test("test JSON", () => {
        const jsontxt = '{ "name" : "space" , "dimension" : 2 ,  "solids" : [ { "name" : "sfb" , "dimension" : 2 ,   "color" : "000000" , "faces" : [ { "face" : [-1,-6,78] },{ "face" : [-3,1,25] },{ "face" : [2,6,-70] },{ "face" : [2,-1,0] }]},{ "name" : "sfr" , "dimension" : 2 ,        "color" : "000000" , "faces" : [ { "face" : [3,-2,11] },{ "face" : [-4,-3,42] },{ "face" : [-3,-1,24] },{ "face" : [4,6,-46] }]},{ "name" : "sfg" , "dimension" : 2 ,        "color" : "000000" , "faces" : [ { "face" : [1,-2,0] },{ "face" : [-1,0,14] },{ "face" : [-1,3,8] },{ "face" : [4,1,-45] }]}]}';
        const space = Space.importFromJSON(JSON.parse(jsontxt)) ;
        expect(space.dimension).toEqual(2);
        expect([...space.solids].length).toEqual(3);
    });

});
