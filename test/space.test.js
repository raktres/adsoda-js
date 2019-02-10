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
});
