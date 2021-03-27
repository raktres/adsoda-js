/**
 * @file Describes ADSODA space
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class Space
 */

import { Solid } from './solid.js'
import { Face } from './face.js'
import { Group } from './group.js'

class Space {
  /**
   * @constructor Space
   * @param {*} dim
   */
  constructor (dim, space) {
    // super("space")
    this.name = space || 'space'
    this.idx = 0
    this.dimension = dim
    this.solids = new Map()
    // this.ambientColor = false
    // this.lights = []
    this.groups = new Map()
    this.projection = []
    this.removeHidden = false
  }

  newOjectId () {
    const id = 'object' + this.idx
    this.idx += 1
    return id
  }

  /**
   * @returns JSON
   */
  exportToJSON () {
    let json = `{ "spacename" : "${this.name}" , "dimension" : ${this.dimension} ,  "solids" : [ `
    this.solids.forEach(solid => {
      json += solid.exportToJSON() + ',' // ).join(',')
    })
    json += '], "groups" : ['
    // json += [...this.groups].map(group => group.exportToJSON()).join(',')
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
      // console.log('solid', solid)
      space.suffixSolid(Solid.importFromJSON(solid))
    })
    if (json.groups) {
      ;[...json.groups].forEach(group => {
      // console.log('import group', group)
        space.suffixGroup(Group.importFromJSON(group, space))
      })
    }
    // space.groups
    // TODO: ajouter groups
    return space
  }

  logDetail () {}

  /**
   *
   * @param {*} solid
   */
  suffixGroup (grp) {
    const id = grp.id === 0 ? this.newOjectId() : grp.id
    // console.log("suffix group ", grp.id)
    // console.log("solid id", id)
    this.groups.set(id, grp)
  }

  /**
   *
   * @param {*} solid
   */
  suffixSolid (solid) {
    const id = solid.id === 0 ? this.newOjectId() : solid.id
    this.solids.set(id, solid)
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
    this.solids.clear() // clear()
  }

  /**
   * TODO:
   */
  /*
  clearGroups () {
    this.Groups.length = 0 // clear()
  }
*/
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
  /*
  eliminateEmptySolids () {
    const solids = [...this.solids].filter(solid => solid.isNonEmptySolid())
    this.solids = solids
  }
  */

  /**
   *
   * @param {*} matrix
   * @param {*} force
   */
  transform (matrix, force = false) {
    if (this.groups.size === 0) {
      this.solids.forEach(solid => {
        const center = solid.middleOf()
        solid.transform(matrix, center, force)
      })
    } else {
      this.groups.forEach(group =>
        group.transform(matrix)
      )
    }
  }

  /**
   *
   * @param {*} vector
   * @param {*} force
   */
  translate (vector, force = false) {
    if (this.groups.size === 0) {
      this.solids.forEach(solid => {
        solid.translate(vector, force)
      })
    } else {
      this.groups.forEach(group => {
        group.translate(vector)
      })
    }
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
    // const filteredSolids = this.removeHidden
    //  ? this.removeHiddenSolids(axe)
    //  : [...this.solids]
    const projs = []
    this.solids.forEach((val, key) => projs.push(val.project(axe)))
    const solids = projs.reduce((solflat, item) => solflat.concat(item), [])
      .filter(solid => solid.isNonEmptySolid())
    return solids
  }

  /**
   *
   * @param {*} hyperplane
   */
  sliceProjectSolids (hyperplane) {
    const projs = this.solids.forEach((val, key) => val.sliceProject(hyperplane))
    const solids = projs.reduce((solflat, item) => solflat.concat(item), [])
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
    solidarray.forEach(solid => space.suffixSolid(solid))
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
