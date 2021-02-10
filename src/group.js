/**
 * @file Describes ADSODA group
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class Group
 * @todo use it
 */

import { NDObject } from './ndobject.js'

class Group extends NDObject {
  constructor ( objects ) {
    super('Group')
    this.objectList = []
    if (objects) this.objectList = objects
  }

  /**
   * @returns JSON face description
   */
  exportToJSON () {
    return `{ "group" : ${JSON.stringify(this.objectList)} }`
  }

  /**
   *
   * @param {*} json
   */
  static importFromJSON (json) {
    return new Group(json.group)
  }

  /**
   * @returns text face description
   */
  logDetail () {
    return `Group name : ${this.name} \n --- objects : ${
      this.objectList
    } \n `
  }

  /**
   *
   */
  emptyGroup () {
    this.objectList.length = 0
  }

  /**
   * translate the face following the given vector.<br>
   * Translation doesn't change normal vector, Just the constant term need to be changed.
   * new constant = old constant - dot(normal, vector)<br>
   * @param {*} vector the vector indicating the direction and distance to translate this halfspace.
   * @todo vérifrie que mutation nécessaire
   * @returns face this
   */
  translate (vector) {
    // TODO: add selected control
    this.objectList.forEach(obj => obj.translate(vector))
    return this
  }

  /**
   *  This method applies a matrix transformation to this Halfspace.
   *  @param {matrix} matrix the matrix of the transformation to apply.
   * @todo vérifrie que mutation nécessaire
   * @returns face this
   */
  transform (matrix) {
    // TODO: attention au centre de rotatation de chaque objet
    return this
  }

  /**
   *
   */
  addObject (obj) {
    this.objectList.push(obj)
  }

  /**
   *
   */
  removeObject (obj) {
    // TODO:
  }
}
export { Group }
