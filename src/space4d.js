/**
 * @file Describes ADSODA space4d
 * @author Jeff Bigot <jeff@raktres.net> after Greg Ferrar
 * @module space4d
 */

// import { Space } from "./space.js";
import { Solid } from './solid.js'

/**
 * return an array representing a 3D cube
 * @param {number} min
 * @param {number} min
 * @returns cube 3D cube
 */
export function cube3D (min, max) {
  return new Solid(3, [
    [-1, 0, 0, max],
    [1, 0, 0, -min],
    [0, -1, 0, max],
    [0, 1, 0, -min],
    [0, 0, -1, max],
    [0, 0, 1, -min]
  ])
}

/**
 * return an array representing a 4D cube
 * @param {number} min
 * @param {number} min
 * @returns cube 4D cube

 * */
export function cube4D (min, max) {
  return new Solid(4, [
    [-1, 0, 0, 0, max],
    [1, 0, 0, 0, -min],
    [0, -1, 0, 0, max],
    [0, 1, 0, 0, -min],
    [0, 0, -1, 0, max],
    [0, 0, 1, 0, -min],
    [0, 0, 0, -1, max],
    [0, 0, 0, 1, -min]
  ])
}
