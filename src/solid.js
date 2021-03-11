/**
 * @file Describes ADSODA solids
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class Solid
 * @extends NDObject
 */

import { NDObject } from './ndobject.js'
import { Face } from './face.js'
// import cloneDeep from "lodash/cloneDeep"
import {
  projectVector,
  isCornerEqual,
  moizeAmongIndex,
  amongIndex,
  findnormal,
  positionPoint
  // constantAdd
} from './halfspace.js'
import * as P from './parameters.js'

function uniqBy(a, key) {
  var seen = {}
  return a.filter(function(item) {
      var k = key(item) 
      return seen.hasOwnProperty(k) ? false : (seen[k] = true)
  })
}

class Solid extends NDObject {
  /*
   * @constructor solid
   * @param {string} dimension nb of dimensions of the solid
   */
  constructor (dim, halfspaces = false) {
    super('solid')
    this.dimension = dim
    this.faces = []
    this.corners = []
    this.silhouettes = []
    this.adjacenciesValid = false
    // TODO: verifi à quoi ça sert
    if (halfspaces) {
      const _t = this

      let halffiltered = uniqBy(halfspaces, JSON.stringify)
      // []
/*
      for (const half of halfspaces) {
        const halffil = half.map(x => parseFloat(x))
        const exist = [...halffiltered].find(halff =>
          isCornerEqual(halff, halffil)
        )
        if (!exist) {
          halffiltered = [...halffiltered, halffil]
        } else {
          //
        }
      }
  */    
      halffiltered.forEach(HS => _t.suffixFace(new Face(HS)))
      this.ensureAdjacencies()
      // const th = this
      console.log("half bef",halffiltered)
      /*
      halffiltered = halffiltered.map(hype => {
        const posit = _t.corners.map(pt => positionPoint(hype,pt))
        if (posit.every(x => x >= 0)) { return hype }
        // else if (posit.every(x => x <= 0)) { return hype.map(coord => -coord) }
        else { return false }
      }).filter(Boolean)
    
      console.log("half aft",halffiltered)
      _t.faces.length = 0
      halffiltered.forEach(HS => _t.suffixFace(new Face(HS)))
      this.adjacenciesValid = false
      this.ensureAdjacencies()
      */
      
    }
  }

  clone () {
    // const half =
    const newSolid = new Solid(
      this.dimension,
      [...this.faces].map(f => f.equ.slice())
    )
    newSolid.color = this.color
    newSolid.name = this.name
    return newSolid
  }

  /**
   * @returns JSON
   */
  exportToJSON () {
    let json = `{ "solidname" : "${this.name}" , "dimension" : ${this.dimension} ,
         "color" : "${this.color}" , "faces" : [ `
    json += [...this.faces].map(face => face.exportToJSON()).join(',')
    json += ']}'
    // let json = JSON.stringify(this, [
    //    "name",
    //    "dimension",
    //    "faces"
    // ])
    return json
  }

  /**
   * create a face from a json
   * @param {JSON} JSON (not a string)
   */
  static importFromJSON (json) {
    const sol = new Solid(parseInt(json.dimension))
    sol.name = json.solidname
    sol.color = json.color;
    [...json.faces].forEach(fac => {
      sol.addFace(Face.importFromJSON(fac))
    })
    return sol
  }

  /**
   * printable summary
   * */
  logSummary () {
    return `Solid name : ${this.name} | dim : ${
      this.dimension
    } \n --- nb of faces : ${this.faces.length} \n --- nb of corners ${
      this.corners.length
    } corners : ${JSON.stringify(this.corners)}      
        \n --- nb of silhouettes : ${
          this.silhouettes.length
        } \n --- adjacencies valid ? : ${this.adjacenciesValid} `
  }

  /**
   * @returns txt
   */
  logDetail () {
    return `Solid name : ${this.name} 
         \n --- corners ${JSON.stringify(this.corners)} \n --- nb of faces : ${
      this.faces.length
    } `
  }

  /**
   *
   * @param {*} face
   */
  suffixFace (face) {
    this.faces = [...this.faces, face]
  }

  /**
   *
   * @param {*} corner
   * @return boolean true if corner added
   */
  suffixCorner (corner) {
    if (!this.corners.find(corn => isCornerEqual(corn, corner))) {
      this.corners = [...this.corners, corner]
      return true
    } else {
      return false
    }
  }

  /**
   * erase corners
   */
  eraseCorners () {
    this.corners.length = 0
  }

  /**
   * clear adajcent faces
   */
  eraseOldAdjacencies () {
    this.eraseCorners()
    for (const face of this.faces) {
      face.eraseTouchingCorners()
      face.eraseAdjacentFaces()
    }
  }

  /**
   *
   */
  eraseSilhouettes () {
    this.silhouettes.length = 0
  }

  /**
   * @todo vérifrie si nouvelle condition de filtre est utile
   */
  filterRealFaces () {
    const _t = this
    this.faces = [...this.faces].filter(
      face =>
        face.isRealFace() &&
        ![...face.touchingCorners].every(
          corner => !_t.isPointInsideOrOnSolid(corner)
        )
    )
  }

  /**
   *
   * @param {*} point
   * @todo utiliser isPointInsideFaces
   */
  isPointInsideSolid (point) {
    return [...this.faces].every(face => face.isPointInsideFace(point))
  }

  // TODO faire une vérification qu'un point est dans un groupe de solids

  /**
   *
   * @param {*} point
   */
  isPointInsideOrOnSolid (point) {
    return [...this.faces].every(face => face.isPointInsideOrOnFace(point))
  }

  /**
   * @todo utile de tout écraser à chaque fois ?
   */
  unvalidSolid () {
    this.adjacenciesValid = false
    // this.eraseOldAdjacencies();
    this.eraseSilhouettes()
  }

  /**
   *
   * @param {*} face
   */
  addFace (face) {
    this.suffixFace(face)
    this.unvalidSolid()
  }

  /**
   *
   * @param {*} halfspace
   */
  cutWith (halfspace) {
    this.addFace(new Face(halfspace))
  }

  /**
   * mutata this
   * @param {*} face
   * @return the other part
   */
  sliceWith (face) {
    // Attention mutation de this et retour d'un nouveau solide
    // vérifier que c'est bon
    const equ = [...face.equ]
    const solid1 = this.clone() // cloneDeep(this);
    solid1.name = this.name + '/outer/'

    const flipEqu = equ.map(coord => -coord)
    this.name = this.name + '/inner/'
    solid1.cutWith(flipEqu)

    this.cutWith(equ)
    return solid1
  }

  /**
   *
   */
  isNonEmptySolid () {
    this.ensureAdjacencies()
    return this.dimension < this.corners.length
  }

  /**
   *
   * @param {*} corner
   */
  isCornerAdded (corner) {
    if (!this.isPointInsideOrOnSolid(corner)) {
      return false
    }
    this.suffixCorner(corner)
    return true
  }

  /**
   *
   * @param {*} faces
   * @param {*} corner
   */
  processCorner (facesref, corner) {
    if (this.isCornerAdded(corner)) {
      Face.updateAdjacentFacesRefs(this.faces, facesref, corner)
    } else {
      //
    }
  }

  /**
   *
   * @param {*} facesref
   */
  computeIntersection (facesref) {
    const intersection = Face.facesRefIntersection(this.faces, facesref)
    if (intersection) {
      this.processCorner(facesref, intersection)
    }
  }

  /**
   *
   */
  computeAdjacencies () {
    const groupsFaces = moizeAmongIndex(this.faces.length, this.dimension, P.MAX_FACE_PER_CORNER) 
    const n = groupsFaces.length
    for (let index = 0; index < n; index++) {
      this.computeIntersection(groupsFaces[index])
    }
    // groupsFaces.forEach(group => this.computeIntersection(group))
  }

  /**
   *
   */
  findAdjacencies () {
    this.eraseOldAdjacencies()
    this.computeAdjacencies()
    this.filterRealFaces()
    this.adjacenciesValid = true
  }

  /**
   *
   */
  ensureAdjacencies () {
    if (!this.adjacenciesValid) {
      this.findAdjacencies()
    } else {
      //
    }
  }

  /**
   *
   */
  ensureSilhouettes () {
    if (this.silhouettes.length === 0) {
      for (let i = 0 ; i < this.dimension; i++) {
        this.silhouettes[i] = this.createSilhouette(i)
      }
    }
  }

  /**
   *
   * @param {*} axe
   * @return {array} silhouettes
   * TODO: correction, ne pas ajouter la silhouette si existe déjà
   */
  createSilhouette (axe) {
    const sFaces = [...this.faces]
    let sil = []
    const seen = {}
    const n = sFaces.length
    for (let index = 0; index < n; index++) {
    // for (const face of sFaces) {
      const tmp = sFaces[index].silhouette(axe)
      if (tmp) {
        tmp.forEach( el => {
        const k = JSON.stringify(el.equ)
        if ( ! seen.hasOwnProperty(k) ){
          seen[k] = true
          sil.push(el)
        }
        })
      }
    }
    return sil
  }

  /**
   *
   * @param {*} axe
   * @returns silhouettes
   */
  getSilhouette (axe) {
    return this.silhouettes[axe]
  }

  /**
   *
   */
  propagateSelection () {
    const sel = this.selected
    this.faces.forEach(face => (face.selected = sel))
  }

  /**
   *
   * @param {*} axe
   * @todo for the moment, project the silhouette, need to project differents faces
   * @todo vérifier que clonedeep est utile
   * @return {array} solids
   */
  project (axe) {
    // TODO ajouter lights et ambient
    const projSol = this.clone()
    // projSol.selected = this.selected;
    // projSol.propagateSelection();
    projSol.name = 'projection ' + projSol.name
    projSol.ensureAdjacencies()
    projSol.ensureSilhouettes()
    let halfspaces = [...projSol.silhouettes[axe]].map(face =>
      Solid.silProject(face, axe)
    )
    // TODO: verif
    // halfspaces = uniqBy(halfspaces, JSON.stringify)
    const dim = projSol.dimension - 1
    const solid = new Solid(dim, halfspaces)
    // TODO color of projection is function of lights
    solid.color = projSol.color
    solid.name = projSol.name + '|P' + axe + '|'
    return [solid]
  }

  /**
   *
   * @param {*} hyperplane
   * @todo reprendre l'axe de projection
   */
  sliceProject (hyperplane) {
    const projSol = this.clone()
    const projFace = new Face(hyperplane)
    projSol.addFace(projFace)
    projSol.ensureAdjacencies()
    const point = projFace.touchingCorners[0]
    if (!projSol.isPointInsideOrOnSolid(point)) {
      console.log('not real face')
      return []
    }
    const sil = projFace.forceSilhouette(2)
    // TODO: verif
    let halfspaces = [...sil].map(face => Solid.silProject(face, 2))
    halfspaces = uniqBy(halfspaces, JSON.stringify)
    const dim = projSol.dimension - 1
    const solid = new Solid(dim, halfspaces)
    // TODO color of projection is function of lights
    solid.color = projSol.color
    solid.name = projSol.name + '|Pcut|'
    return [solid]
  }

  /**
   *
   * @param {*} vector
   * @returns this
   */
  translate (vector, force = false) {
    // if (!this.selected && !force ) return this;
    vector = vector.map(x => parseFloat(x))
    this.faces = [...this.faces].map(face => face.translate(vector))
    this.unvalidSolid()
    return this
  }

  /**
   *
   * @param {*} matrix
   * @returns this
   */
  transform (matrix, center, force = false) {
    // if (!this.selected && !force ) return this;
    const centerl = center.map(x => -parseFloat(x))
    this.faces = [...this.faces].map(face =>
      face
        .translate(centerl)
        .transform(matrix)
        .translate(center)
    )
    this.unvalidSolid()
    return this
  }

  /**
   *
   * @param {*} solid
   * @param {*} axe
   * @returns corner
   */
  findCornerInSilhouette (solid, axe) {
    const sil = solid.silhouettes[axe]
    return [...this.corners].find(corner =>
      Face.isPointInsideFaces(sil, corner)
    )
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
   * @returns -1 or 1 or false
   */
  checkOrientation (point, axe) {
    for (const face of [...this.faces]) {
      if (!face.isPointInsideFace(point)) {
        if (face.isBackFace(axe)) {
          return -1
        } else {
          return 1
        }
      }
    }
    return false
  }

  /**
   *
   * @param {*} solid
   * @param {*} axe
   * @todo return false ou 0 ?
   * @returns boolean
   */
  isInFront (solid, axe) {
    const corner = this.findCornerInSilhouette(solid, axe)
    if (corner) {
      return solid.checkOrientation(corner, axe)
    } else {
      return false
    }
  }

  /**
   *
   * @param {*} solid
   * @param {*} axe
   * @returns 1 if infront -1 if behind and false if disjoint
   * @todo rename isInFront
   */
  order (solid, axe) {
    const res1 = this.isInFront(solid, axe)
    if (res1) {
      return res1
    }
    return solid.isInFront(this, axe)
  }

  /**
   *
   * @param {*} solid
   * @returns bool
   * @todo il faudrait aussi vérifier que c2.every()
   * @todo il faut vérifier que l'écart est faible !
   */
  isEqual (solid) {
    // TODO test
    const c1 = [...this.corners]
    const c2 = [...solid.corners]
    return c1.every(corner => c2.find(c => c === corner))
  }

  /**
   * subtract this to the solid in parameter
   * @param {*} zzzz
   * @returns an array of solids representing the substraction
   * @todo vérifier s'il ne faut pas une fonction qui soustrait des solides
   * @todo évaluer l'impact du clone de faces
   */
  subtract (faces) {
    const newsolid = this.clone() // cloneDeep(this);
    newsolid.ensureAdjacencies()
    // TODO supprimer
    const clonefaces = faces // cloneDeep(faces);
    const subsolids = clonefaces
      .reduce((subsolids, face) => {
        return [...subsolids, newsolid.sliceWith(face)]
      }, [])
      .filter(solid => solid.isNonEmptySolid())

    // TODO pas sur utile de recalculer les éléments
    for (const solidei of subsolids) {
      solidei.unvalidSolid() // adjacenciesValid = false;
      solidei.ensureAdjacencies()
      solidei.ensureSilhouettes()
    }
    return subsolids
  }

  /**

/**
 *
 * @param {*} solid
 * @todo verifier s'il ne faut pas retourner solid
 */
  clipWith (solid, axe) {
    if (this.isEqual(solid)) return solid
    if (this.order(solid, axe) === -1) return solid
    // TODO verify with need to clip the other
    const tempsub = solid.subtract(this.getSilhouette(axe))

    return tempsub
  }

  /**
   *
   * @param {*} solids
   * @param {*} exclude
   */
  solidsSilhouetteSubtract (solids, axe) {
    const soli = solids.map(sol => sol.clone()) // cloneDeep
    let res = []
    for (let i = 0; i < solids.length; i++) {
      res = res.concat(this.clipWith(soli[i], axe))
    }
    return res
  }

  /**
   * @todo write
   */
  middleOf () {
    const corners = []
    for (let i = 0; i < this.dimension; i++) {
      const vals = [...this.corners].map(corner => corner[i])
      const maxCorner = Math.max(...vals)
      const minCorner = Math.min(...vals)
      corners[i] = (maxCorner + minCorner) / 2
    }
    return corners
  }

  /**
   *
   * @param {*} face
   * @todo simplif
   */
  static initSolidFromFace (face) {
    const solid = new Solid(face.equ.length - 1)
    solid.suffixFace(face)
    solid.selected = face.selected
    return solid
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
  static createSolidFromHalfSpaces (halfspaces) {
    const solid = new Solid(halfspaces[0].length - 1)
    halfspaces.forEach(HS => solid.suffixFace(new Face(HS)))
    solid.ensureAdjacencies()
    return solid
  }

  // TMP !!!!
  static silProject (face, axe) {
    // if (face.isBackFace()) {  return false }
    // const newface = cloneDeep(face);
    // newface.equ=projectVector(newface.equ,axe);
    // newface.dim = newface.dim - 1 ;
    // const nfaces = [...face.intersectionsIntoFaces()];
    return projectVector(face.equ, axe)
  }

  static createSolidFromVertices (vertices) {
    const dim = vertices[0].length
    const listgroup =  moizeAmongIndex( vertices.length, dim, dim ) // JSON.parse()
    let hyperplanes = listgroup.map( el => {
      const points = el.map(idx => {
        return [...vertices[idx]]
      })
      return points
    })
    hyperplanes = hyperplanes.map( points => {
      return findnormal(points)
    }).filter(el => el)
    // on a maintenant dans hyperplanes l'ensemble des hyperplans induits par les différents points.
    // attention cependant, il manque ceux passant par l'origine.
    // il faut maintenant vérifier l'orientation de ces hyperplans
    
    hyperplanes = hyperplanes.map((hype,id) => {
      const posit = vertices.map(pt => positionPoint(hype,pt))
      if (posit.every(x => x >= 0)) { return hype }
      else if (posit.every(x => x <= 0)) { return hype.map(coord => -coord) }
      else { return false }
    })
    // on a maintenant tous les hyperplans générés par les points, on a donc beaucoup de doublons, 
    // que l'on filtre
    hyperplanes = uniqBy(hyperplanes, JSON.stringify)

    const hpFiltered = hyperplanes.filter(el => el)
    // on a maintenant les hyperplans englobants, on en déduit les faces.
    const sol = this.createSolidFromHalfSpaces(hpFiltered)
    
    return sol 
  }
}

export { Solid }
