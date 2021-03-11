/**
 * @file Describes ADSODA object
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @class NDObject
 */

class NDObject {
  /**
   *
   * @param {*} name
   * @param {*} color
   */
  constructor (name, color) {
    this.name = name || 'nDobject'
    this.id = 0
    // TODO: utiliser les mêmes couleurs que Three
    this.color = color || 0x000000
    this.selected = false // TODO vérifier
  }
}

export { NDObject }
