/**
 * @file Describes ADSODA light
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class Light
 * @extends NDObject
 * @todo use it
 */

// import { translate, projectVector } from "./halfspace.js";
import { NDObject } from "./ndobject.js";
// import * as P from "./parameters.js";

class Light extends NDObject {
    /**
     * @param {*} vector
     */
    constructor(vector) {
        super("light");
        this.direction = [...vector];
    }

    /**
     *
     */
    exportToJSON() {
        return (exp = `{ name : ${this.name} , direction : ${
            this.direction
        }, color : ${this.color} } `);
    }
}

export { Light };
