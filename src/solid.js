/**
 * @file Describes ADSODA solids
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class Solid
 * @extends NDObject
 */

import { NDObject } from './ndobject.js'
import { Face } from './face.js'
import { v4 as uuidv4 } from 'uuid'
import {
  projectVector,
  isCornerEqual,
  moizeAmongIndex,
  findnormal,
  positionPoint,
  intersectHyperplanes,
  isHPEqual
} from './halfspace.js'
import * as P from './parameters.js'

function uniqBy (a, key) {
  const seen = {}
  return a.filter(function (item) {
    const k = key(item)
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
    this.cornersValid = false
    this.center = []
    this.adjacentRefs = new Set()
    // TODO: verifi à quoi ça sert
    if (halfspaces) {
      const _t = this
      const halffiltered = uniqBy(halfspaces, JSON.stringify)
      halffiltered.forEach(HS => _t.suffixFace(new Face(HS)))
      this.ensureFaces()
    }
    this.uuid = uuidv4()
  }

  clone () {
    const newSolid = new Solid(
      this.dimension,
      [...this.faces].map(f => [...f.equ])
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
    return json
  }

  /**
   * create a face from a json
   * @param {JSON} JSON (not a string)
   */
  static importFromJSON (json) {
    const sol = new Solid(parseInt(json.dimension))
    sol.name = json.solidname
    sol.id = json.id || 0
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
    this.center.length = 0
    this.cornersValid = false
    this.faces.forEach(face => { face.touchingCorners.length = 0 })
  }

  /**
   * clear adajcent faces
   */
  eraseOldAdjacencies () {
    this.faces.forEach(face => {
      face.adjacentRefs.clear()
      face.eraseTouchingCorners()
      face.eraseAdjacentFaces()
    })
    this.adjacenciesValid = false
    this.eraseCorners()
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
      // TODO: vérifier le fonctionnement des filtres de face
        face.isRealFace() && [...face.touchingCorners].find( corner => _t.isPointInsideOrOnSolid(corner))
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

  /**
   *
   * @param {*} point
   */
  isPointInsideOrOnSolid (point) {
    return [...this.faces].every(face => face.isPointInsideOrOnFace(point))
  }

  /**
   * @todo utile de tout écraser à chaque fois ?
   * TODO: voir si peut garder les cotés adajcents, recalculer les points
   */
  unvalidSolid () {
    this.eraseOldAdjacencies() // inclue l'effacage des points
    this.eraseSilhouettes()
  }

  /**
   * on supprime juste les points et les silhouettes
   * TODO: voir si peut garder les cotés adajcents, recalculer les points
   */
  forceUpdateSolid () {
    this.eraseCorners()
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
    const solid1 = this.clone()
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
    this.ensureFaces()
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
    const str = JSON.stringify(corner)
    if (this.corners.find(el => str === JSON.stringify(el))) {
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
   * TODO: vérifier que les nouvelles conditions du if sont satisfaisantes
   */
  computeIntersection (facesref) {
    // recherche d'une intersection
    const intersection = Face.facesRefIntersection(this.faces, facesref)
    // TODO: pourquoi l'intersection pourrait ne pas être sur les faces ? mais en fait si !!!
    if (intersection) { // && facesref.every(ref => this.faces[ref].isPointOnFace(intersection))
      this.processCorner(facesref, intersection)
    }
  }

  /**
   *
   */
  computeAdjacencies () {
    const groupsFaces = moizeAmongIndex(this.faces.length, this.dimension, P.MAX_FACE_PER_CORNER) // this.dimension) //
    const n = groupsFaces.length
    for (let index = 0; index < n; index++) {
      this.computeIntersection(groupsFaces[index])
    }
  }

  computeCorners () {
    const _t = this
    this.faces.forEach(face => {
      const nbAjaFaces = face.adjacentRefs.size
      const groupsRefFaces = moizeAmongIndex(nbAjaFaces, _t.dimension - 1, _t.dimension - 1) // P.MAX_FACE_PER_CORNER) // _t.dimension-1)
      const n = groupsRefFaces.length
      const adjacentEqu = []
      face.adjacentRefs.forEach(element => {
        adjacentEqu.push(this.faces[element].equ)
      })
      for (let index = 0; index < n; index++) {
        const grp = [face.equ].concat(groupsRefFaces[index].map(id => adjacentEqu[id]))
        const intersection = intersectHyperplanes(grp)
        if (intersection && _t.isPointInsideOrOnSolid(intersection)) {
          face.touchingCorners.push(intersection)
        }
      }
    })
    let cornerList = []
    // TODO, voir pour remplacer uniq par la fonction infra
    this.faces.forEach(face => {
      cornerList = cornerList.concat([...face.touchingCorners])
    })
    _t.corners.length = 0
    cornerList.forEach((corner, idx) => {
      for (let index = idx + 1; index < cornerList.length; index++) {
        if (isCornerEqual(corner, cornerList[index])) { return false }
      }
      _t.corners.push(corner)
    })
  }

  /**
   * TODO: ne pas mélanger avec find corners
   */
  findAdjacencies () {
    this.eraseOldAdjacencies()
    this.computeAdjacencies()
    // TODO: erreur dans certains cas
    const nba = this.faces.length
    this.filterRealFaces()
    if (this.faces.length !== nba) {
      this.eraseOldAdjacencies()
      this.computeAdjacencies()
    }
    this.adjacenciesValid = true
    this.cornersValid = true
  }

  /**
   * TODO: À rédiger !!!
   */
  findCorners () {
    this.eraseCorners()
    this.computeCorners()
    this.cornersValid = true
  }

  /**
   *
   */
  ensureFaces () {
    if (!this.adjacenciesValid) {
      this.findAdjacencies()
    } else if (!this.cornersValid) {
      this.findCorners()
    } else {
      //
    }
  }

  /**
   *
   */
  ensureSilhouettes () {
    if (this.silhouettes.length === 0) {
      for (let i = 0; i < this.dimension; i++) {
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
    const n = sFaces.length
    for (let index = 0; index < n; index++) {
      const tmp = sFaces[index].silhouette(axe, sFaces, this.center)
      if (tmp) {
        sil = [...sil, ...tmp]
      }
    }
    const nb = sil.length
    const filteredSil = []
    sil.forEach((face, idx) => {
      let res = true
      for (let index = idx + 1; index < nb; index++) {
        if (isHPEqual(face.equ, sil[index].equ, P.VERY_SMALL_NUM)) {
          res = false
          break
        }
      }
      if (res) filteredSil.push(face)
    })
    return filteredSil
  }

  /**
   *
   * @param {*} axe
   * @return {array} silhouettes
   * TODO: correction, ne pas ajouter la silhouette si existe déjà
   */

  createAxeCutSilhouette (axe) {
    const hype = []
    for (let index = 0; index < this.dimension + 1; index++) {
      hype[index] = 0
    }
    hype[axe] = 1

    const solid1 = this.clone()
    solid1.name = this.name + '/ cut /'
    // attention ! le plan de coupe peut déjà être une face du solide
    let cface = solid1.faces.find(face => {
      return isHPEqual(hype, face.equ, 0)
    })
    if (!cface) {
      cface = new Face(hype)
      cface.name = 'cut'
      solid1.addFace(cface)
      solid1.ensureFaces()
    }

    const sFaces = [...solid1.faces]

    const sil = cface.cutSilhouette(axe, sFaces, this.center)
    // TODO: reprendre
    const nb = sil.length
    const filteredSil = []
    // recherche de faces en doublon
    sil.forEach((face, idx) => {
      let res = true
      for (let index = idx + 1; index < nb; index++) {
        if (isCornerEqual(face.equ, sil[index].equ, P.VERY_SMALL_NUM)) {
          res = false
          break
        }
      }
      if (res) filteredSil.push(face)
    })
    // TODO: voir si on retourne sil ou filteredSil
    // return sil
    return filteredSil
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
    this.ensureFaces()
    this.ensureSilhouettes()
    const _t = this
    const halfspaces = [..._t.silhouettes[axe]].map(face =>
      Solid.silProject(face, axe)
    )
    // TODO: Voir s'il y a besoin de filtrer les HS, utilisr iSHSEquel
    // trouver d'où peut provenir cette HS à 0. Apparait pour les cubes
    // const halfspacesf = halfspaces.filter(eq => eq.find(x => { return x > P.VERY_SMALL_NUM || x < -P.VERY_SMALL_NUM }))
  
    const dim = this.dimension - 1
    const solid = new Solid(dim, halfspaces)
    // TODO color of projection is function of lights
    solid.color = this.color
    solid.selected = this.selected
    solid.name = 'projection ' + this.name + '|P' + axe + '|'
    solid.parentUuid = this.uuid
    return [solid]
  }

  /**
   *
   * @param {*} axe
   * @todo for the moment, project the silhouette, need to project differents faces
   * @todo vérifier que clonedeep est utile
   * @return {array} solids
   */
  axeCut (axe) {
    this.ensureFaces()
    const _t = this

    const halfspaces = [..._t.createAxeCutSilhouette(axe)].map(face =>
      Solid.silProject(face, axe)
    )
    // TODO: trouver d'où peut provenir cette HS à 0
    // TODO: retrouver la fonction de vérif à 0
    // const halfspacesf = halfspaces.filter(eq => eq.find(x => { return x > P.VERY_SMALL_NUM || x < -P.VERY_SMALL_NUM }))
    // console.log('halfspaces')
    // console.table(halfspacesf)
    // const halfspaces = [..._t.axeCutsilhouettes[axe]].map(face =>
    //  Solid.silProject(face, axe)
    // )
    const dim = this.dimension - 1
    const solid = new Solid(dim, halfspaces)

    solid.color = this.color
    solid.selected = this.selected
    solid.name = 'axe cut ' + this.name + '|P' + axe + '|'
    solid.parentUuid = this.uuid
    return [solid]
  }

  /**
   *
   * @param {*} vector
   * @returns this
   */
  translate (vector, force = false) {
    vector = vector.map(parseFloat)
    this.faces.forEach(face => face.translate(vector))
    this.forceUpdateSolid()
    return this
  }

  /**
   *
   * @param {*} matrix
   * @returns this
   * TODO: selection des solides à translater
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
    this.forceUpdateSolid()
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

  /**
   *
   * @param {*} solid
   * @param {*} point
   * @param {*} axe
   * @todo values behind and infront
   * @returns -1 or 1 or false
   *  TODO: verifier
   */
  checkOrientation (point, axe) {
    for (const face of this.faces) {
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
   * @todo il faudrait aussi vérifier que !c2.find()
   * @todo il faut vérifier que l'écart est faible !
   */
  isEqual (solid) {
    const c1 = [...this.corners]
    const c2 = [...solid.corners]
    if (c1.length !== c2.length) return false
    return c1.every(corner => c2.find(c => c === corner))
  }

  /**
   * subtract this to the solid in parameter
   * @param {*}
   * @returns an array of solids representing the substraction
   * @todo vérifier s'il ne faut pas une fonction qui soustrait des solides
   * @todo évaluer l'impact du clone de faces
   */
  subtract (faces) {
    const newsolid = this.clone()
    newsolid.ensureFaces()
    // TODO supprimer
    const clonefaces = faces
    const subsolids = clonefaces
      .reduce((subsolids, face) => {
        return [...subsolids, newsolid.sliceWith(face)]
      }, [])
      .filter(solid => solid.isNonEmptySolid())

    // TODO pas sur utile de recalculer les éléments
    subsolids.forEach(solidei => {
      solidei.unvalidSolid()
      solidei.ensureFaces()
      solidei.ensureSilhouettes()
    })
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
   * TODO: remplacer concat par un reduce ?
   */
  solidsSilhouetteSubtract (solids, axe) {
    const soli = solids.map(sol => sol.clone())
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

  /**
   *
   * @param {*} halfspaces
   */
  static createSolidFromHalfSpaces (halfspaces) {
    const solid = new Solid(halfspaces[0].length - 1)
    halfspaces.forEach((HS, id) => {
      const face = new Face(HS)
      face.id = id
      solid.suffixFace(face)
    })
    solid.ensureFaces()
    return solid
  }

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
    const listgroup = moizeAmongIndex(vertices.length, dim, dim)
    let hyperplanes = listgroup.map(el => {
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
