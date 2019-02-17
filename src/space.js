/**
 * @file Describes ADSODA space
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class Space
 * @requires lodash/cloneDeep
 */

import { NDObject } from "./ndobject.js";
import { Solid } from "./solid.js";
import { Face } from "./face.js";
import { Light } from "./light.js";
import cloneDeep from "lodash/cloneDeep";
import * as P from "./parameters";

class Space {
    /**
     * @constructor Space
     * @param {*} dim
     */
    constructor(dim, space) {
        //super("space");
        this.name = space || "space";
        this.dimension = dim;
        this.solids = new Set();
        this.ambientColor = false;
        this.lights = [];
        this.projection = [];
        this.removeHidden = false;
    }

    /**
     * @returns JSON
     */
    exportToJSON() {
        let json = `{ name : ${this.name} , dimension : ${
            this.dimension
        } , ambientColor : ${this.ambientColor} , solids : { `;
        this.solids.forEach(face => (json += solids.exportToJSON()));
        json += "}, lights :{ ";
        this.lights.forEach(light => (json += light.exportToJSON()));
        json += "}} ";

        return json;
    }

    logDetail() {}

    /**
     *
     * @param {*} solid
     */
    suffixSolid(solid) {
        this.solids.add(solid); // pusch
    }

    /**
     *
     * @param {*} light
     */
    suffixLight(light) {}

    /**
     *
     */
    clearSolids() {
        this.solids.clear();
        //this.solids = [] ;
    }

    /**
     * @todo confirmer que affectation pas utile
     */
    ensureSolids() {
        //const solids =
        this.solids.forEach(solid => solid.ensureAdjacencies());
        this.solids.forEach(solid => solid.ensureSilhouettes());
        //this.solids = solids;
    }

    /**
     *
     */
    eliminateEmptySolids() {
        const solids = [...this.solids].filter(solid =>
            solid.isNonEmptySolid()
        );
        this.solids = solids;
    }

    /**
     *
     * @param {*} matrix
     * @param {*} force
     */
    transform(matrix, force = false) {
        // const solids =
        [...this.solids].forEach(solid => {
            //console.log(solid.logDetail());
            const center = solid.middleOf();
            solid.transform(matrix, center, force);
        });
        // this.solids = solids;
    }

    /**
     *
     * @param {*} vector
     * @param {*} force
     */
    translate(vector, force = false) {
        [...this.solids].forEach(solid => solid.translate(vector, force));
    }

    /**
     *
     * @param {*} axe for the moment, just the index of axe
     * @returns return an array of solids in which hidden parts are removed
     */
    removeHiddenSolids(axe) {
        const _tsolids = [...this.solids];
        let listOfSolids = _tsolids.map(solid => [cloneDeep(solid)]);
        for (let ind = 0; ind < _tsolids.length; ind++) {
            const tempSol = _tsolids[ind];
            for (let i = 0; i < listOfSolids.length; i++) {
                if (i != ind) {
                    const tempLOS = cloneDeep(listOfSolids[i]);
                    const tempList = tempSol.solidsSilhouetteSubtract(
                        tempLOS,
                        axe
                    );
                    listOfSolids[i] = tempList;
                }
            }
            //listOfSolids = listOfSolids.map(solsOfList=>this.solids[ind].solidsSilhouetteSubtract(solsOfList,axe,ind));
        }
        const flatList = listOfSolids
            .reduce((flatList, item) => flatList.concat(item), [])
            .filter(solid => solid.isNonEmptySolid());
        return flatList;
    }

    /**
     * create the name of the projected space
     * @param {*} axe
     * @return text
     */
    projectName(axe) {
        return `${this.name} projection axis ${axe}`;
    }

    /**
     *
     * @param {*} axe
     * @returns array of lights
     */
    projectLights(axe) {
        return [...this.lights];
    }

    /**
     * project solids from space following axe
     * @param {*} axe for the moment, just the index of axe
     * @returns array of solids
     */
    projectSolids(axe) {
        const filteredSolids = this.removeHidden
            ? this.removeHiddenSolids(axe)
            : [...this.solids];
        const solids = filteredSolids
            .map(solid => solid.project(axe))
            .reduce((solflat, item) => solflat.concat(item), [])
            .filter(solid => solid.isNonEmptySolid());
        return solids;
    }

    /**
     *
     * @param {*} hyperplane
     */
    sliceProjectSolids(hyperplane) {
        const filteredSolids = [...this.solids];
        const solids = filteredSolids
            .map(solid => solid.sliceProject(hyperplane))
            .reduce((solflat, item) => solflat.concat(item), [])
            .filter(solid => solid.isNonEmptySolid());
        return solids;
    }

    /**
     * Project space following axe
     * @param {*} axe for the moment, just the index of axe
     * @returns space
     */
    project(axe) {
        //if (REMOVE_HIDDEN)
        let space = new Space(this.dimension - 1);
        space.ambientColor = cloneDeep(this.ambientColor);
        space.name = this.projectName(axe);
        space.lights = this.projectLights(axe);
        //TODO il faut que project solids utilise filteredSolids
        const solidarray = this.projectSolids(axe);
        solidarray.forEach(solid => space.solids.add(solid));
        return space;
    }

    /**
     * Project space following axe
     * @param {*} hyperplane for the moment, just the index of axe
     * @returns space
     */
    sliceProject(hyperplane) {
        //if (REMOVE_HIDDEN)
        let space = new Space(this.dimension - 1);
        // space.ambientColor = cloneDeep(this.ambientColor);
        space.name = this.projectName("slice".hyperplane);
        // space.lights = this.projectLights(axe);
        //TODO il faut que project solids utilise filteredSolids
        const solidarray = this.sliceProjectSolids(hyperplane);
        solidarray.forEach(solid => space.solids.add(solid));
        return space;
    }
    /**
     * @todo write
     */
    middleOf() {}

    /**
     * @todo write
     */
    deleteSelectedSolids() {}

    /**
     *
     * @param {*} halfspaces
     * @returns solid
     */
    createSolid(halfspaces) {
        const solid = new Solid(this.dimension);
        halfspaces.forEach(HS => solid.suffixFace(new Face(HS)));
        solid.ensureAdjacencies();
        this.suffixSolid(solid);
        return solid;
    }
}

export { Space };
