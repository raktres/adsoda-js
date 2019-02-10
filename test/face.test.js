import { Face } from "../src/face.js";

describe("Face test", () => {
    test("flipFace", () => {
        let face = new Face([1, 2, 3]);

        face.flip();
        expect([...face.equ]).toEqual([-1, -2, -3]);
    });
    test("faceOrientation 1", () => {
        let face = new Face([1, 2, 3]);

        const x = face.orientation(0);
        expect(x).toEqual(1);
    });
    test("faceOrientation 2", () => {
        let face = new Face([1, 2, -3]);
        const x = face.orientation(2);
        expect(x).toEqual(-1);
    });

    test("isBackFace 1", () => {
        let face = new Face([0, 2, -3]);

        const x = face.isBackFace(0);
        expect(x).toBeTruthy();
        const y = face.isBackFace(2);
        expect(y).toBeTruthy();
        const z = face.isBackFace(1);
        expect(z).toBeFalsy();
    });

    test("suffixTouchingCorners", () => {
        let face = new Face([1, 2, -3]);

        face.suffixTouchingCorners(1);
        face.suffixTouchingCorners(2);
        expect([...face.touchingCorners]).toEqual([1, 2]);
    });

    
    test("transform", () => {
        let face = new Face([1, 0, 3]);
        face.transform([[0,1],[1,0]]);
        expect(face.equ[0]).toEqual(0);
        expect(face.equ[1]).toEqual(1);
        expect(face.equ[2]).toEqual(3);
    });
    test("translate", () => {
        let face = new Face([1, 2, 3]);
        face.translate([1,1]);
        expect(face.equ[0]).toEqual(1);
        expect(face.equ[1]).toEqual(2);
        expect(face.equ[2]).toEqual(0);
    });
    test("is real face", () => {
        let face = new Face([1, 2, -3]);

        face.suffixTouchingCorners(1);
        expect(face.isRealFace()).toBeFalsy();
        face.suffixTouchingCorners(3);
        expect(face.isRealFace()).toBeTruthy();
    });
    test("order face pointst", () => {
        let face = new Face([0, 0, 1, 1]);
        face.touchingCorners = [[0, 1, 0], [1, 1, 0], [1, 0, 0], [0, 0, 0]];
        const ord = face.orderedCorners();
        let fc = 0;
    });
});
