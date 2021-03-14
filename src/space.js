/**
 * @file Describes ADSODA space
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class Space
 */

import { Solid } from './solid.js'
import { Face } from './face.js'

class Space {
  /**
   * @constructor Space
   * @param {*} dim
   */
  constructor (dim, space) {
    // super("space")
    this.name = space || 'space'
    this.dimension = dim
    this.solids = new Set()
    // this.ambientColor = false
    // this.lights = []
    this.projection = []
    this.removeHidden = false
  }

  /**
   * @returns JSON
   */
  exportToJSON () {
    let json = `{ "spacename" : "${this.name}" , "dimension" : ${this.dimension} ,  "solids" : [ `
    json += [...this.solids].map(solid => solid.exportToJSON()).join(',')
    json += ']} '
    return json
  }

  /**
   * create a face from a json
   * @param {JSON}
   * @todo add group
   */
  static importFromJSON (json) {
    const space = new Space(parseInt(json.dimension), json.spacename)
    ;[...json.solids].forEach(solid => {
      space.suffixSolid(Solid.importFromJSON(solid))
    })
    return space
  }

  logDetail () {}

  /**
   *
   * @param {*} solid
   */
  suffixSolid (solid) {
    this.solids.add(solid)
  }

  /**
   *
   * @param {*} light
   */
  // suffixLight(light) {}

  /**
   *
   */
  clearSolids () {
    this.solids.clear()
  }

  /**
   * @todo confirmer que affectation pas utile
   */
  ensureSolids () {
    this.solids.forEach(solid => {
      solid.ensureFaces()
      solid.ensureSilhouettes()
    })
  }

  /**
   *
   */
  eliminateEmptySolids () {
    const solids = [...this.solids].filter(solid => solid.isNonEmptySolid())
    this.solids = solids
  }

  /**
   *
   * @param {*} matrix
   * @param {*} force
   */
  transform (matrix, force = false) {
    [...this.solids].forEach(solid => {
      const center = solid.middleOf()
      solid.transform(matrix, center, force)
    })
  }

  /**
   *
   * @param {*} vector
   * @param {*} force
   */
  translate (vector, force = false) {
    [...this.solids].forEach(solid => solid.translate(vector, force))
  }

  /**
   *
   * @param {*} axe for the moment, just the index of axe
   * @returns return an array of solids in which hidden parts are removed
   */
  removeHiddenSolids (axe) {
    const _tsolids = [...this.solids]
    const listOfSolids = _tsolids.map(solid => [solid.clone()]) // clonedeep
    for (let ind = 0; ind < _tsolids.length; ind++) {
      const tempSol = _tsolids[ind]
      for (let i = 0; i < listOfSolids.length; i++) {
        if (i !== ind) {
          const tempLOS = listOfSolids[i].clone() // clonedeep
          const tempList = tempSol.solidsSilhouetteSubtract(tempLOS, axe)
          listOfSolids[i] = tempList
        }
      }
      // listOfSolids = listOfSolids.map(solsOfList=>this.solids[ind].solidsSilhouetteSubtract(solsOfList,axe,ind))
    }
    const flatList = listOfSolids
      .reduce((flatList, item) => flatList.concat(item), [])
      .filter(solid => solid.isNonEmptySolid())
    return flatList
  }

  /**
   * create the name of the projected space
   * @param {*} axe
   * @return text
   */
  projectName (axe) {
    return `${this.name} projection axis ${axe}`
  }

  /**
   *
   * @param {*} axe
   * @returns array of lights
   */
  // projectLights(axe) {  return [...this.lights]     }

  /**
   * project solids from space following axe
   * @param {*} axe for the moment, just the index of axe
   * @returns array of solids
   */
  projectSolids (axe) {
    const filteredSolids = this.removeHidden
      ? this.removeHiddenSolids(axe)
      : [...this.solids]
    const solids = filteredSolids
      .map(solid => solid.project(axe))
      .reduce((solflat, item) => solflat.concat(item), [])
      .filter(solid => solid.isNonEmptySolid())
    return solids
  }

  /**
   *
   * @param {*} hyperplane
   */
  sliceProjectSolids (hyperplane) {
    // const filteredSolids = [...this.solids]
    const solids = [...this.solids]
      .map(solid => solid.sliceProject(hyperplane))
      .reduce((solflat, item) => solflat.concat(item), [])
    // .filter(solid => solid.isNonEmptySolid())
    return solids
  }

  /**
   * Project space following axe
   * @param {*} axe for the moment, just the index of axe
   * @returns space
   */
  project (axe) {
    // if (REMOVE_HIDDEN)
    const space = new Space(this.dimension - 1)
    space.name = this.projectName(axe)
    // TODO il faut que project solids utilise filteredSolids
    const solidarray = this.projectSolids(axe)
    solidarray.forEach(solid => space.solids.add(solid))
    return space
  }

  /**
   * Project space following axe
   * @param {*} hyperplane for the moment, just the index of axe
   * @returns space
   */
  sliceProject (hyperplane) {
    // if (REMOVE_HIDDEN)
    const space = new Space(this.dimension - 1)
    space.name = this.projectName('slice'.hyperplane)
    // TODO il faut que project solids utilise filteredSolids
    const solidarray = this.sliceProjectSolids(hyperplane)
    solidarray.forEach(solid => space.solids.add(solid))
    return space
  }

  /**
   * @todo write
   */
  middleOf () {}

  /**
   * @todo write
   */
  deleteSelectedSolids () {}

  /**
   *
   * @param {*} halfspaces
   * @returns solid
   */
  createSolid (halfspaces) {
    const solid = new Solid(this.dimension)
    halfspaces.forEach(HS => solid.suffixFace(new Face(HS)))
    solid.ensureFaces()
    this.suffixSolid(solid)
    return solid
  }
}

export { Space }
