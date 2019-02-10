/**
 * @file Describes ADSODA solids
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 *
 */

import { NDObject } from "./ndobject.js";
import { Face } from "./face.js";
import cloneDeep from "lodash/cloneDeep";
import {  projectVector, isCornerEqual, moizeAmongIndex } from "./halfspace.js";
import * as P from "./parameters.js";

/**
 * Creates a new solid.
 * @class Solid
 */

class Solid extends NDObject {
    /*
     * @class Solid
     * @constructor solid
     * @param {string} dimension nb of dimensions of the solid
     */

    constructor(dim, halfspaces = false) {
        super("solid");
        this.dimension = dim;
        this.faces = [];
        this.corners = [];
        this.silhouettes = [];
        this.adjacenciesValid = false;
        if (halfspaces) {
            const _t = this;

            let halffiltered = [];

            for (const half of halfspaces) {
                const halffil = [...half].map(x=> parseFloat(x));
                const exist = [...halffiltered].find(halff =>
                    isCornerEqual(halff, halffil)
                );
                if (!exist) {
                    halffiltered = [...halffiltered, halffil];
                } else {
                }
            }
            halffiltered.forEach(HS => _t.suffixFace(new Face(HS)));
            this.ensureAdjacencies();
        }
    }
    /**
     *
     */

    exportToJSON() {
        //let json = `{ name : "${this.name}" , dimension : ${this.dimension} , color : "${this.color}" , faces : { `;
        //this.faces.forEach( face =>
        //    json += face.exportToJSON() 
        //);
        //json += "}}";
        let json = JSON.stringify(this, ['name','dimension','color','faces'])
        return json; 
    }

    static importFromJSON(json){
        let obj = JSON.parse()
        let tmp = new Face()

    }

    /**
     * printable summary
     * */
    logSummary() {
        return `Solid name : ${this.name} | dim : ${
            this.dimension
        } \n --- nb of faces : ${this.faces.length} \n --- nb of corners ${
            this.corners.length
        } corners : ${JSON.stringify(this.corners)}      
        \n --- nb of silhouettes : ${
            this.silhouettes.length
        } \n --- adjacencies valid ? : ${this.adjacenciesValid} `;
    }

    /**
     *
     */
    logDetail() {
        return `Solid name : ${this.name} 
         \n --- corners ${JSON.stringify(this.corners)} \n --- nb of faces : ${
            this.faces.length
        } `;
    }

    /**
     *
     * @param {*} face
     */
    suffixFace(face) {
        this.faces = [...this.faces, face];
    }
    /**
     *
     * @param {*} corner
     */
    suffixCorner(corner) {
        if (!this.corners.find(corn => isCornerEqual(corn, corner))) {
            this.corners = [...this.corners, corner];
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     */
    eraseCorners() {
        this.corners = [];
    }

    /**
     *
     */
    eraseOldAdjacencies() {
        this.eraseCorners();
        for (const face of this.faces) {
            face.eraseTouchingCorners();
            face.eraseAdjacentFaces();
        }
    }

    /**
     *
     */
    eraseSilhouettes() {
        this.silhouettes = [];
    }
    /**
     *
     */
    filterRealFaces() {
        this.faces = [...this.faces].filter(face => face.isRealFace());
    }

    /**
     *
     * @param {*} point
     * @todo utiliser isPointInsideFaces
     */
    isPointInsideSolid(point) {
        return [...this.faces].every(face => face.isPointInsideFace(point));
    }

    //TODO faire une vérification qu'un point est dans un groupe de solids
    /**
     *
     * @param {*} point
     */
    isPointInsideOrOnSolid(point) {
        return [...this.faces].every(face => face.isPointInsideOrOnFace(point));
    }

    /**
     * @todo utile de tout écraser à chaque fois ?
     */
    unvalidSolid() {
        this.adjacenciesValid = false;
       // this.eraseOldAdjacencies();
        this.eraseSilhouettes();
    }

    /**
     *
     * @param {*} face
     */
    addFace(face) {
        this.suffixFace(face);
        this.unvalidSolid();
    }

    /**
     *
     * @param {*} halfspace
     */
    cutWith(halfspace) {
        this.addFace(new Face(halfspace));
    }

    /**
     * mutata this
     * @param {*} face
     * @return the other part
     */
    sliceWith(face) {
        //Attention mutation de this et retour d'un nouveau solide
        //vérifier que c'est bon
        const equ = [...face.equ];
        const solid1 = cloneDeep(this);
        solid1.name = this.name + "/outer/";

        const flip_equ = equ.map(coord => -coord);
        this.name = this.name + "/inner/";
        solid1.cutWith(flip_equ);

        this.cutWith(equ);
        return solid1;
    }

    /**
     *
     */
    isNonEmptySolid() {
        this.ensureAdjacencies();
        return this.dimension < this.corners.length;
    }

    /**
     *
     * @param {*} corner
     */
    isCornerAdded(corner) {
        if (!this.isPointInsideOrOnSolid(corner)) {
            return false;
        }
        this.suffixCorner(corner);
        return true;
    }

    /**
     *
     * @param {*} faces
     * @param {*} corner
     */
    processCorner(facesref, corner) {
        if (this.isCornerAdded(corner)) {
            Face.updateAdjacentFacesRefs(this.faces, facesref, corner);
            //Face.updateAdjacentFaces(faces, corner);
        } else {
        }
    }

    /**
     *
     * @param {*} facesref
     */
    computeIntersection(facesref) {
        const intersection = Face.facesRefIntersection(this.faces,facesref);
        if (intersection) {
            this.processCorner(facesref, intersection);
        }
    }
   /*  computeIntersection(faces) {
        const intersection = Face.facesIntersection(faces);
        if (intersection) {
            this.processCorner(faces, intersection);
        }
    } */

    /**
     *
     */
    computeAdjacencies() {
        const groupsFaces = moizeAmongIndex(
            this.faces.length,
            this.dimension,
            P.MAX_FACE_PER_CORNER
        );
        groupsFaces.forEach(group => this.computeIntersection(group));
    }

    /**
     *
     */
    findAdjacencies() {
        this.eraseOldAdjacencies();
        this.computeAdjacencies();
        this.filterRealFaces(); 
        this.adjacenciesValid = true;
    }

    /**
     *
     */
    ensureAdjacencies() {
        if (!this.adjacenciesValid) {
            this.findAdjacencies();
        } else {
        }
    }

    /**
     *
     */
    ensureSilhouettes() {
        if(this.silhouettes.length==0) {
        for (let i = 0; i < this.dimension; i++) {
            this.silhouettes[i] = this.createSilhouette(i);
        }
    }
    }

    /**
     *
     * @param {*} axe
     */
    createSilhouette(axe) {
        const sFaces = [...this.faces];
        let sil = [];
        for (const face of sFaces) {
            const tmp = face.silhouette(axe);
            if (tmp) {
                sil = [...sil, ...tmp];
            }
        }
        return [...sil];
    }

    /**
     *
     * @param {*} axe
     */
    getSilhouette(axe) {
        return this.silhouettes[axe];
    }

    /**
     *
     */
    propagateSelection() {
        const sel = this.selected;
        this.faces.forEach(face => (face.selected = sel));
    }

    /**
     *
     * @param {*} axe
     * @todo for the moment, project the silhouette, need to project differents faces
     * @todo vérifier que clonedeep est utile
     */
    project(axe) {
        //TODO ajouter lights et ambient
        const projSol = cloneDeep(this);
        projSol.selected = this.selected;
        projSol.propagateSelection();
        projSol.name = "projection " + projSol.name;
        projSol.ensureAdjacencies();
        projSol.ensureSilhouettes();
        const halfspaces = [...projSol.silhouettes[axe]].map(face =>
            Solid.silProject(face, axe)
        );
        const dim = projSol.dimension - 1;
        let solid = new Solid(dim, halfspaces);
        //TODO color of projection is function of lights
        solid.color = projSol.color ;
        solid.name = projSol.name+"|P"+axe+"|" ;
        return [solid];
    }

    /**
     *
     * @param {*} vector
     */
    translate(vector, force = false) {
       // if (!this.selected && !force ) return this;
        vector = [...vector].map(x=>parseFloat(x));
        this.faces = [...this.faces].map(face => face.translate(vector));
        this.unvalidSolid();
        return this;
    }

    /**
     *
     * @param {*} matrix
     */
    transform(matrix, center, force = false) {
       // if (!this.selected && !force ) return this;

        let centerl = [...center].map(x=>-parseFloat(x));
        this.faces = [...this.faces].map(face => face.translate(centerl));



        this.faces = [...this.faces].map(face => face.transform(matrix));
        
        centerl = [...center].map(x=>parseFloat(x));
        this.faces = [...this.faces].map(face => face.translate(centerl));
      
        this.unvalidSolid();
        return this;
    }

    /**
     *
     * @param {*} solid
     * @param {*} axe
     */
    findCornerInSilhouette(solid, axe) {
        const sil = solid.silhouettes[axe];
        return [...this.corners].find(corner =>
            Face.isPointInsideFaces(sil, corner)
        );
    }

    /* validFaceForOrder(point,axe){ //TODO déplacer dans face
    const p1 = !this.pointInsideFace(point) ;
    const p2 = this.faceOrientation(axe)  0 ;
    return p1 && p2 ;
    } */
    /**
     *
     * @param {*} solid
     * @param {*} point
     * @param {*} axe
     * @todo values behind and infront
     */
    checkOrientation(point, axe) {
        //const faces = [...cloneDeep(this.faces)];
        for (const face of [...this.faces]) {
            if (!face.isPointInsideFace(point)) {
                if (face.isBackFace(axe)) {
                    return -1;
                } else {
                    return 1;
                }
            }
        }
        return false;
    }

    /**
     *
     * @param {*} solid
     * @param {*} axe
     * @todo return false ou 0 ?
     */
    isInFront(solid, axe) {
        const corner = this.findCornerInSilhouette(solid, axe);
        if (corner) {
            return solid.checkOrientation(corner, axe);
        } else {
            return false;
        }
    }

    /**
     *
     * @param {*} solid
     * @param {*} axe
     * @returns 1 if infront -1 if behind and false if disjoint
     * @todo rename isInFront
     */
    order(solid, axe) {
        const res1 = this.isInFront(solid, axe);
        if (res1) {
            return res1;
        }
        return solid.isInFront(this, axe);
    }

    /**
     *
     * @param {*} solid
     * @returns bool
     * @todo il faudrait aussi vérifier que c2.every()
     */
    isEqual(solid) {
        // TODO test
        const c1 = [...this.corners];
        const c2 = [...solid.corners];
        return c1.every(corner => c2.find(c => c == corner));
    }

    /**
     * subtract this to the solid in parameter
     * @param {*} zzzz
     * @returns an array of solids representing the substraction
     * @todo vérifier s'il ne faut pas une fonction qui soustrait des solides
     * @todo évaluer l'impact du clone de faces
     */
    subtract(faces) {
        const newsolid = cloneDeep(this);
        newsolid.ensureAdjacencies();
        //TODO supprimer
        const clonefaces = faces; // cloneDeep(faces);
        const subsolids = clonefaces
            .reduce((subsolids, face) => {
                return [...subsolids, newsolid.sliceWith(face)];
            }, [])
            .filter(solid => solid.isNonEmptySolid());

        //TODO pas sur utile de recalculer les éléments
        for (const solidei of subsolids) {
            solidei.unvalidSolid(); // adjacenciesValid = false;
            solidei.ensureAdjacencies();
            solidei.ensureSilhouettes();
        }
        return subsolids;
    }

    /**

/**
 * 
 * @param {*} solid 
 * @todo verifier s'il ne faut pas retourner solid
 */
    clipWith(solid, axe) {
        if (this.isEqual(solid)) return solid;
        if (this.order(solid, axe) == -1) return solid;
        //TODO verify with need to clip the other
        const tempsub = solid.subtract(this.getSilhouette(axe));

        return tempsub;
    }

    /**
     *
     * @param {*} solids
     * @param {*} exclude
     */
    solidsSilhouetteSubtract(solids, axe) {
        const soli = solids.map(sol => cloneDeep(sol));
        let res = [];
        for (let i = 0; i < solids.length; i++) {
            res = res.concat(this.clipWith(soli[i], axe));
        }
        return res;
    }

    /**
     * @todo write
     */
    middleOf() {
        //const maxCorner = [] ;
        //const minCorner = [] ;
        const corners = [] ;
        for(let i =0 ; i< this.dimension; i++) {
            const vals = [...this.corners].map(corner => corner[i]);
            const maxCorner = Math.max(...vals) ;
            const minCorner = Math.min(...vals) ;
           // [...this.corners].forEach( corner => {
           //     maxCorner[i] = Math.max(maxCorner[i],corner[i]);
           //     minCorner[i] = Math.max(minCorner[i],corner[i]);
           // });
           corners[i] = (maxCorner + minCorner) / 2 ;
        }
        return corners ;


    }


    /**
     *
     * @param {*} face
     * @todo simplif
     */
    static initSolidFromFace(face) {
        const solid = new Solid(face.equ.length - 1);
        // const equ = [...face.equ] ;
        solid.suffixFace(face);
        solid.selected = face.selected;
        return solid;
    }

    // /**
    //  *
    //  * @param {*} face
    //  * @param {*} axe
    //  * @todo pour l'instant project une silhouette
    //  */
    // static faceProject(face, axe) {
    //     //if (face.isBackFace()) {     return false; }
    //     const newSolid = initSolidFromFace(face);
    //     //const nfaces = [...face.intersectionsIntoFaces()];
    //     return newSolid;
    // }

    /**
     *
     * @param {*} halfspaces
     */
    static createSolidFromHalfSpaces(halfspaces) {
        const solid = new Solid(halfspaces[0].length - 1);
        halfspaces.forEach(HS => solid.suffixFace(new Face(HS)));
        solid.ensureAdjacencies();
        return solid;
    }

    //TMP !!!!
    static silProject(face, axe) {
        //if (face.isBackFace()) {  return false }
        //const newface = cloneDeep(face);
        //newface.equ=projectVector(newface.equ,axe);
        //newface.dim = newface.dim - 1 ;
        //const nfaces = [...face.intersectionsIntoFaces()];
        return [...projectVector(face.equ, axe)];
    }
}

export { Solid };
