//const translate = require('./halfspace.js');

import {
    translateHS,
    positionPoint,
    projectVector,
    intersectHyperplanes,
    echelon,
    nonZeroRows,
    getConstant,
    getCoordinate,
    among,
    amongIndex,
    moizeAmongIndex,
    solution,
    constantAdd
} from "../src/halfspace.js";
import * as P from "../src/parameters.js";

const a = [1, 2, 3];
const b = [2, 3, 4];

describe("Tests of halfspace", () => {
    beforeEach(() => {
        //do something
    });

    //TODO
    test("project", () => {
        const c = projectVector(a, 0);
        expect(c).toEqual([2, 3]);
    });

    test("constant add", () => {
        const c = [1, 2, 3, 4];
        const d = constantAdd(c, 4);
        expect(d).toEqual([1, 2, 3, 0]);
    });

    test("get constant ", () => {
        const c = [1, 2, 3, 4];
        const d = getConstant(c);
        expect(d).toEqual(4);
    });

    test("get coordinate ", () => {
        const c = [1, 2, 3, 4];
        const d = getCoordinate(c, 2);
        expect(d).toEqual(3);
    });

    /* test("project false", () => {
        const c = projectVector(a, 4);
        expect(c).toBeFalsy();
    }); */

    test("amongIndex", () => {
        const array2 = JSON.parse(amongIndex(3, 2, 2));
        expect(array2.length).toEqual(3);
        const array13 = JSON.parse(amongIndex(3, 1, 3));
        expect(array13.length).toEqual(7);
    });
    test("amongIndex Moize", () => {
        let array2 = JSON.parse(moizeAmongIndex(3, 2, 2));
        expect(array2.length).toEqual(3);
        const array13 = JSON.parse(moizeAmongIndex(3, 1, 3));
        expect(array13.length).toEqual(7);
        array2 = JSON.parse(moizeAmongIndex(3, 2, 2));
        expect(array2.length).toEqual(3);
        array2 = JSON.parse(moizeAmongIndex(3, 2, 2));
        expect(array2.length).toEqual(3);
        array2 = JSON.parse(moizeAmongIndex(3, 2, 2));
        expect(array2.length).toEqual(3);
    });
    //

    test("nonZeroRows", () => {
        const matrix = [
            [1, 2, -1, -4],
            [0, 0, 0, 0],
            [-2, 0, -3, 22],
            [0, 0, 0, 22],
            [0 + P.VERY_SMALL_NUM / 10, 0 - P.VERY_SMALL_NUM / 10, 0, 0]
        ];

        //console.log("init"+JSON.stringify(matrix));
        const fil = nonZeroRows(matrix);
        //console.log(fil);
        expect(fil.length).toEqual(3);
    });

    test("echelon", () => {
        const matrix = [[1, 2, -1, -4], [2, 3, -1, -11], [-2, 0, -3, 22]];

        //console.log("init"+JSON.stringify(matrix));
        const ech = echelon(matrix);
        //console.log(ech);
        expect(ech[0][3]).toEqual(-8);
        expect(ech[1][3]).toEqual(1);
        expect(ech[2][3]).toEqual(-2);
    });
    //
    //
    test("solution", () => {
        const matrix = [
            [1, 2, -1, -4],
            [2, 3, -1, -11],
            [-2, 0, -3, 22],
            [-4, 0, -6, 44],
            [2, 4, -2, -8]
        ];

        //console.log("init"+JSON.stringify(matrix));
        const ech = solution(matrix);
        //console.log(ech);
        expect(ech[0]).toEqual(8);
        expect(ech[1]).toEqual(-1);
        expect(ech[2]).toEqual(2);
    });

    test("Solution 2D", () => {
        const matrix = [[1, -1, 3], [1, 1, -5]];
        expect(intersectHyperplanes(matrix)).toEqual([1, 4]);
        const matrix1 = [[1, -1, 3], [-1, 0, 6]];
        expect(intersectHyperplanes(matrix1)).toEqual([6, 9]);
        const matrix2 = [[1, 1, -5], [0, 1, -1]];
        expect(intersectHyperplanes(matrix2)).toEqual([4, 1]);
    });

    test("Position test 1", () => {
        const halfspace = [1, -1, 3];
        expect(positionPoint(halfspace, [6, 9])).toEqual(0);
        expect(positionPoint(halfspace, [0, 0])).toBeGreaterThan(0);
        expect(positionPoint(halfspace, [0, 10])).toBeLessThan(0);
    });
});
