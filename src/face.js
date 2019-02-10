import {
    constantAdd,
    projectVector,
    positionPoint,
    intersectHyperplanes,
    isCornerEqual,
    getCoordinate,
    getConstant,
    moizeAmongIndex
} from "./halfspace.js";
import cloneDeep from "lodash/cloneDeep";
import * as math from "mathjs";
import { NDObject } from "./ndobject.js";
import * as P from "./parameters";

let replacer = function (key, value) {
    if(Array.isArray(value) ){
        return JSON.stringify(value);
    }
    return value ;
};


/**
 * create a face
 * @class Face
 */

class Face extends NDObject {
    /**
     *
     * @param {*} vector
     */
    constructor(vector) {
        super("Face");
        this.equ = [...vector].map(x => parseFloat(x));
        this.touchingCorners = [];
        this.adjacentFaces = [];
        this.dim = this.equ.length - 1 ;
    }

    /**
     *
     */
    toJSON() {
        // return (exp = `{ name : ${this.name} , halfspace : ${this.equ}, color : ${this.color} } `);
        const tmp = "toto" ; //JSON.stringify(this.equ);
        return { name : this.name  , halfspace : tmp , color : this.color }
    }

    /**
     * 
     * @param {*} json 
     */
    static importFromJSON(json){
        let obj = JSON.parse()
        let tmp = new Face()

    }

    /**
     *
     */
    logDetail() {
        return `Face name : ${this.name} \n --- halfspace : ${
            this.equ
        } \n --- touching corners ${JSON.stringify(
            this.touchingCorners
        )} \n --- nb of halfspaces : ${this.adjacentFaces.length} `;
    }

    /**
     *
     */
    eraseTouchingCorners() {
        this.touchingCorners = [];
    }

    /**
     *
     */
    eraseAdjacentFaces() {
        this.adjacentFaces = [];
        return this;
    }

    /**
     * translate the face following the given vector.
     * Translation doesn't change normal vector, Just the constant term need to be changed.
     * new constant = old constant - dot(normal, vector)
     * @param {*} vector
     * @todo vérifrie que mutation nécessaire
     */
    translate(vector) {
        const dot = math.dot([...this.equ].slice(0, -1), vector) ;
        this.equ = constantAdd(this.equ, dot);
        return this;
    }

    /**
     * @todo vérifrie que mutation nécessaire
     */
    transform(matrix) {
        //get non 0 coordinate
        const coordindex = [...this.equ].findIndex(x => x!= 0) ; //TODO vérifier si utilisaton not small_value
        const intercept = - getConstant(this.equ) / getCoordinate(this.equ,coordindex) ;
        const coords = math.multiply(matrix,[...this.equ].slice(0, -1));
        let sum = 0 ;
        for(let i = 0; i< coords.length ; i++){
            sum += matrix[i][coordindex] * intercept * [...coords][i] ;
        }
        this.equ = [...coords,-sum];
        return this;
    }

    /**
     *
     * @param {*} axe
     */
    isBackFace(axe) {
        return this.orientation(axe) <= 0;
    }

    /**
     *
     * @param {*} axe
     */
    orientation(axe) {
        return Math.sign(this.equ[axe]);
    }

    /**
     *
     * @param {*} point
     * @param {*} axe
     */
    validForOrder(point, axe) {
        return !this.pointInsideFace(point) && this.orientation(axe) != 0;
    }

    /**
     * @todo évaluer l'impact de l'utilisation  de ...
     */
    flip() {
        this.equ = [...this.equ].map(coord => -coord);
    }

    /**
     *
     * @param {*} corner
     * @todo rationaliser avec suffixCorner
     */
    suffixTouchingCorners(corner) {
        const exist = this.touchingCorners.find(corn =>
            isCornerEqual(corn, corner)
        );
        if (!exist) {
            this.touchingCorners = [...this.touchingCorners, corner];
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @param {*} face
     */
    suffixAdjacentFaces(face) {
        if (this != face) {
            //TODO vérifier que face n'est pas déja dans la liste
            //utilisation de set ?
            this.adjacentFaces = [...this.adjacentFaces, face];
        }
    }

    /**
     *
     */
    // get projectDimension() {
    //     return this.dim-1;
    // }

    /**
     *
     */
    isRealFace() {
        return [...this.touchingCorners].length >= this.dim;
    }

    /**
     *
     * @param {*} point
     * @todo rename containsPoint
     */
    // inclue la frontière
    isPointInsideOrOnFace(point) {
        return positionPoint(this.equ, point) > -P.VERY_SMALL_NUM;
    }

    /**
     *
     * @param {*} point
     */
    isPointInsideFace(point) {
        return positionPoint(this.equ, point) > P.VERY_SMALL_NUM;
    }

    /**
     *
     * @param {*} axe
     */
    pvFactor(axe) {
        return this.equ[axe];
    }

    /**
     *
     * @param {*} adjaFace
     * @param {*} axe
     */
    intersectionsIntoFace(adjaFace, axe) {
        const aF = adjaFace.pvFactor(axe);
        const tF = this.pvFactor(axe);
        const aEq = [...adjaFace.equ].map(x => x * tF);
        const tEq = [...this.equ].map(x => x * aF);
        let diffEq = math.subtract(tEq, aEq);
        
        const aTC = [...adjaFace.touchingCorners];
        const tTC = [...this.touchingCorners];
        const outPoint = tTC.find(point => !aTC.find(pt => pt == point));
        if (!outPoint) return false;

        const outPointProj = projectVector(outPoint, axe);
        let diffEqProj = projectVector(diffEq, axe);

        
        if (positionPoint(diffEqProj, outPointProj) > P.VERY_SMALL_NUM) {
            diffEqProj = math.unaryMinus(diffEqProj);
        }
        
        const nFace = new Face(diffEqProj);
        nFace.name = `proj de ${this.equ} selon ${axe} `;
        
        return nFace;
        //TODO return false si pas bon
    }

    /**
     * @todo remove use of clonedeep
     */
    intersectionsIntoFaces() {
        const tface = cloneDeep(this);
        const faces = [...face.adjacentFaces].map[
            _face => _face.intersectionIntoFace() // pas bon, manque tface
        ].filter(fac => fac);
        return [...faces];
    }

    /**
     *
     * @param {*} adjaFace
     * @param {*} axe
     */
    intersectionIntoSilhouetteFace(adjaFace, axe) {
        const aF = adjaFace.pvFactor(axe);
        const tF = this.pvFactor(axe);
        const aEq = [...adjaFace.equ].map(x => x * tF);
        const tEq = [...this.equ].map(x => x * aF);


        let diffEq = math.subtract(tEq, aEq);

        const aTC = [...adjaFace.touchingCorners];
        const tTC = [...this.touchingCorners];

        //looking for a point in solid, but not on main face
        //for exemple, a touching corner of the adjacent face
        //not common with main face
        //const outPoint = aTC[0];
        const outPoint = aTC.find(point => !tTC.find(pt => pt == point));
        if (!outPoint) return false;

        const nFace = new Face(diffEq);
        //flip the face if point is not inside
        if (!nFace.isPointInsideFace(outPoint)) {
            nFace.flip();
        }

        nFace.name = `proj de ${this.equ} selon ${axe} `;
        return nFace;
    }

    /**
     *
     * @param {*} axe
     */
    silhouette(axe) {
        if (this.isBackFace(axe)) return false;

        const newFace = new Face(this.equ);
        //cloneFace.touchingCorners
        newFace.touchingCorners = [...this.touchingCorners];

        //Just keep backface to get visible edge ;
        const adjaFaces = [
            ...this.adjacentFaces.filter(face => face.isBackFace(axe))
        ];

        // if all adjacent faces are front need to keep.
        // TODO verify if useful
        if (adjaFaces.length == 0) return false;

        let silFaces = [];

        for (const aFace of adjaFaces) {
            const nface = newFace.intersectionIntoSilhouetteFace(aFace, axe);
            if (nface) {
                silFaces = [...silFaces, nface];
            }
        }
        return [...silFaces];
    }

    /**
     *
     *
     */
    orderedCorners() {
        const corners = [...this.touchingCorners]; //[...this.corners];
        const ci = corners[0];
        const cf = corners[corners.length - 1];
        //face reference
        const vref = math.subtract(ci, corners[1]);
        return corners
            .map(corner => [
                order3D(corner, this.equ.slice(0, -1), ci, vref),
                corner
            ])
            .sort(function(a, b) {
                return a[0] - b[0];
            })
            .map(el => el[1]);
    }
    
    /**
     *
     * @param {*} faces
     * @param {*} point
     */
    static isPointInsideFaces(faces, point) {
        return faces.every(face => face.isPointInsideFace(point));
    }

    /**
     *
     * @param {*} faces
     */
    static facesIntersection(faces) {
        const hyps = faces.map(face => [...face.equ]);
        return intersectHyperplanes(hyps);
    }

    /**
     *
     * @param {*} faces
     * @param {*} facesrefs
     */
    static facesRefIntersection(faces,refs) {
        const hyps = refs.map(ref => [...faces[ref].equ]);
        return intersectHyperplanes(hyps);
    }

    /**
    * 
    * @param {*} faces 
    * @param {*} refs 
    * @param {*} corner 
    */
    static updateAdjacentFacesRefs(faces, refs, corner) {
        refs.forEach(ref => faces[ref].suffixTouchingCorners(corner));

        const grouprefs = moizeAmongIndex(refs.length,2,2);

        for (const groupref of grouprefs) {
            faces[refs[groupref[0]]].suffixAdjacentFaces(faces[refs[groupref[1]]]);
            faces[refs[groupref[1]]].suffixAdjacentFaces(faces[refs[groupref[0]]]);
        }
        // intersectHyperplanes
    }
}

/**
 * 
 * @param {*} point1 
 * @param {*} halfspace 
 * @param {*} pointref 
 * @param {*} vectorref 
 */
function order3D(point1, halfspace, pointref, vectorref) {
    const v1 = math.subtract(point1, pointref);
    const crossP = math.cross(vectorref, v1);
    const norm = math.norm(crossP);
    const dotP = math.dot(vectorref, v1);
    const theta = math.atan2(norm, dotP);
    const sign = math.dot(crossP, halfspace);
    if (sign < 0) {
        return -theta;
    } else {
        return theta;
    }
}
export { Face };
