import { translate, projectVector } from "./halfspace.js";
import { NDObject } from "./ndobject.js";
import * as P from "./parameters.js";

class Light extends NDObject {
    constructor(vector) {
        super("light");
        this.direction = [...vector];
    }

    /**
     *
     */
    exportToJSON() {
        return (exp = `{ name : ${this.name} , direction : ${this.direction}, color : ${this.color} } `);
    }

}

export { Light };
