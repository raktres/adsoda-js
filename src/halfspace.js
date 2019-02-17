import * as math from "mathjs";
/**
 * @file Describes ADSODA halfspace
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @module halfspace
 * */

import moize from "moize";
import * as P from "./parameters";

//|~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//| Halfspace.cp
//|
//| This is the implementation of the Halfspace class.  An Halfspace is half of an n-space.
//| it is described by the equation of the bounding hyperplane.  A point is considered
//| to be inside the halfspace if the left side of the equation is greater than the
//| right side.  The first n coefficients can also be viewed as the normal vector.
//|_______________________________________________________________________________________

/**
 *
 * @param {*} matrix
 * @returns solution
 */
//export function echelonBase(matrix) {
export function echelon(matrix) {
    const nbrows = matrix.length;
    const nbcolumns = matrix[0].length;
    let outmatrix = matrix.map(row => [...row]);

    let lead = 0;
    for (let k = 0; k < nbrows; k++) {
        if (nbcolumns <= lead) return outmatrix;

        var i = k;
        while (outmatrix[i][lead] == 0) {
            // abs P_min ?
            i++;
            if (nbrows === i) {
                i = k;
                lead++;
                if (nbcolumns === lead) return outmatrix;
            }
        }
        let irow = outmatrix[i],
            krow = outmatrix[k];
        (outmatrix[i] = krow), (outmatrix[k] = irow);

        let val = outmatrix[k][lead];
        for (let j = 0; j < nbcolumns; j++) {
            outmatrix[k][j] /= val;
        }

        for (let l = 0; l < nbrows; l++) {
            if (l === k) continue;
            val = outmatrix[l][lead];
            for (var j = 0; j < nbcolumns; j++) {
                outmatrix[l][j] -= val * outmatrix[k][j];
            }
        }
        lead++;
    }

    return outmatrix;
}

//export const echelon = moize(echelonBase);

/**
 *
 * @param {*} matrix
 * @returns matrix
 */
export function nonZeroRows(matrix) {
    return matrix.filter(
        //  row => !row.every(val => Math.abs(val) < P.VERY_SMALL_NUM)
        row =>
            !row.every(val => val < P.VERY_SMALL_NUM && val > -P.VERY_SMALL_NUM)
    );
}

/**
 *
 * @param {*} matrix
 * @returns vector solution of the system
 */
export function solution(matrix) {
    const mat1 = echelon([...matrix]);
    const mat2 = nonZeroRows(mat1);
    const last = math.transpose(mat2.map(vector => vector.slice(-1)));
    return math.multiply(last[0], -1);
}

/**
 * Get constant value of the halfspace
 */
export function getConstant(halfspace) {
    return halfspace[halfspace.length - 1];
}

/**
 *
 * @param {*} halfspace
 * @param {*} i
 */
export function getCoordinate(halfspace, i) {
    return halfspace[i];
}

/**
 *
 * @param {*} u
 * @param {*} x
 */
export function constantAdd(u, x) {
    return [...u.slice(0, -1), getConstant(u) - x];
}

/**
 *
 * @param {*} halfspace
 * @param {*} point
 */
export function positionPoint(halfspace, point) {
    return math.dot(halfspace, [...point, 1]);
}

/**
 *
 * @param {*} vector
 * @param {*} axe
 */
export function projectVector(vector, axe) {
    return [...vector.slice(0, axe), ...vector.slice(axe + 1, vector.length)];
}

/**
 *
 * @param {*} hyperplanes
 * @returns the intersection of hyperplanes, false if no solution found
 * @todo verify that the left part of the matrix is an identity matrix
 */
export function intersectHyperplanes(hyperplanes) {
    const dimension = hyperplanes[0].length - 1;
    const result = solution(hyperplanes);

    if (result.length == dimension) {
        return result;
    } else {
        return false;
    }
}

/**
 * return every compositions of elements from array wich size is
 * between a and b
 * @param {*} array
 * @param {*} a
 * @param {*} b
 * @returns array of compositions
 * @todo memoize
 */
export function amongIndex(l, a, b) {
    let extract = [[]];
    let ref = [];
    for (let i = 0; i < l; i++) {
        ref[i] = i;
    }
    //const range = (start,end) => new Array(end - start +1).fill(undefined).map((value,index)=>index+start);
    for (const i in ref) {
        for (const j in extract) {
            extract.push(extract[j].concat(ref[i]));
        }
    }

    return extract.filter(sub => sub.length >= a && sub.length <= b);
}

/**
 *
 */
export const moizeAmongIndex = moize(amongIndex);

/**
 *
 * @param {*} corner1
 * @param {*} corner2
 */
export function isCornerEqual(corner1, corner2) {
    if (corner1 instanceof Array && corner2 instanceof Array) {
        for (let i = 0; i < corner1.length; i++) {
            if (Math.abs(corner1[i] - corner2[i]) > P.VERY_SMALL_NUM) {
                return false;
            }
        }
        return true;
    } else {
        // return corner1 == corner2;
        return Math.abs(corner1 - corner2) < P.VERY_SMALL_NUM;
    }
}
