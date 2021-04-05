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
      space.suffixSolid(Solid.importFromJSON(solid))
    })
    if (json.groups) {
      ;[...json.groups].forEach(agroup => {
        const group = Group.importFromJSON(agroup, space)
        space.suffixGroup(group)
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
    this.groups.set(grp.uuid, grp)
  }

  /**
   *
   * @param {*} solid
   */
  suffixSolid (solid) {
    this.solids.set(solid.uuid, solid)
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
   * TODO:
   */
  clearGroups () {
    this.Groups.clear()
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
  /*
  eliminateEmptySolids () {
    const solids = [...this.solids].filter(solid => solid.isNonEmptySolid())
    this.solids = solids
  }
  */

  trigSolid (uuid) {
    let foundInGroup = false
    this.groups.forEach(grp => {
      if (grp.objectList.has(uuid)) {
        foundInGroup = true
        console.log('found in group')
        grp.selected = !grp.selected
        grp.objectList.forEach(solUuid => {
          const solid = this.solids.get(solUuid)
          console.log('add solid', solUuid, solid )
          solid.selected = !solid.selected
        })
      }
    })
    if (!foundInGroup) {
      const solid = this.solids.get(uuid)
      if (solid) {
        console.log('add solid', uuid, solid )
        solid.selected = !solid.selected
      }
    }
  }

  /**
   *
   * @param {*} matrix
   * @param {*} force
   */
  transform (matrix, center = true, force = false) {
    // if (this.groups.size === 0) {
    let allSelected = true
    let done = false
    this.solids.forEach(solid => {
      if (solid.selected) { allSelected = false }
    })
    this.groups.forEach(grp => {
      if (grp.selected || allSelected) {
        done = true
        const centerptg = center ? grp.middleOf() : [0, 0, 0, 0]
        grp.transform(matrix, centerptg, force)
      }
    })
    if (!done) {
      this.solids.forEach(solid => {
        if (allSelected || solid.selected) {
          const centerpt = center ? solid.middleOf() : [0, 0, 0, 0]
          solid.transform(matrix, centerpt, force)
        }
      })
    }
  /*  } else {
      this.groups.forEach(group => {
        const centerptg = center ? group.middleOf() : [0, 0, 0, 0]
        group.transform(matrix, centerptg, force)
      })
    }
    */
  }

  /**
   *
   * @param {*} vector
   * @param {*} force
   */
  translate (vector, force = false) {
    // if (this.groups.size === 0) {
    let allSelected = true
    this.solids.forEach(solid => {
      if (solid.selected) { allSelected = false }
    })
    this.solids.forEach(solid => {
      if (allSelected || solid.selected) {
        solid.translate(vector, force)
      }
    })
  }

  /**
   *
   * @param {*} axe for the moment, just the index of axe
   * @returns return an array of solids in which hidden parts are removed
   */
  removeHiddenSolids (axe) {
    const _tsolids = [...this.solids]
    const listOfSolids = _tsolids.map(solid => [solid.clone()])
    for (let ind = 0; ind < _tsolids.length; ind++) {
      const tempSol = _tsolids[ind]
      for (let i = 0; i < listOfSolids.length; i++) {
        if (i !== ind) {
          const tempLOS = listOfSolids[i].clone()
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
   * create the name of the projected space
   * @param {*} axe
   * @return text
   */
  axeCutName (axe) {
    return `${this.name} cut axis ${axe}`
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
   * project solids from space following axe
   * @param {*} axe for the moment, just the index of axe
   * @returns array of solids
   */
  axeCutSolids (axe) {
    // const filteredSolids = this.removeHidden
    //  ? this.removeHiddenSolids(axe)
    //  : [...this.solids]
    const cuts = []
    this.solids.forEach((val, key) => cuts.push(val.axeCut(axe)))
    const solids = cuts.reduce((solflat, item) => solflat.concat(item), [])
      .filter(solid => solid.isNonEmptySolid())
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
   * @param {*} axe for the moment, just the index of axe
   * @returns space
   */
  axeCut (axe) {
    // if (REMOVE_HIDDEN)
    const space = new Space(this.dimension - 1)
    space.name = this.axeCutName(axe)
    // TODO il faut que project solids utilise filteredSolids
    const solidarray = this.axeCutSolids(axe)
    solidarray.forEach(solid => space.suffixSolid(solid))
    return space
  }

  /**
   * Project space following axe
   * @param {*} hyperplane for the moment, just the index of axe
   * @returns space
   */
  sliceProject (hyperplane) { }

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
