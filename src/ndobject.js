/**
 * @file Describes ADSODA object
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class NDObject
 */

import { translate, projectVector } from "./halfspace.js";

class NDObject {
    /**
     *
     * @param {*} name
     * @param {*} color
     */
    constructor(name, color) {
        this.name = name || "nDobject";
        this.id = 0;
        this.color = color || "000000";
        this.selected = false; //TODO vérifier
    }
}

export { NDObject };
