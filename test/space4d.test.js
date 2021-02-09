import { cube3D, cube4D } from '../src/space4d.js'
import { Space } from '../src/space.js'
import { Solid } from '../src/solid.js'

function rotXY (d) {
  const a = (d * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  const rot = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, c, -s],
    [0, 0, s, c]
  ]

  return rot
}

describe('Solid test', () => {
  test('solid create', () => {
    const S = cube3D(2, 5)
    // console.log(S.logDetail());
    expect(S.corners.length).toEqual(8)
  })
  test('solid create', () => {
    const S = cube4D(2, 5)
    expect(S.corners.length).toEqual(16)
    const cube = S.project(0)
    expect(cube[0].corners.length).toEqual(8)
  })
  test('space 4D', () => {
    const space4 = new Space(4, 'toto')
    const C = cube4D(2, 5)
    space4.suffixSolid(C)
    const space3_0 = space4.project(0)
    expect([...space3_0.solids].length).toEqual(1)
    expect([...space3_0.solids][0].corners.length).toEqual(8)
  })

  test('space 4D', () => {
    const space4 = new Space(4, 'toto')
    const C = cube4D(2, 5)
    C.selected = true
    const r1 = rotXY(10)
    C.transform(r1, [0, 0, 0, 0])
    // space4.suffixSolid(C);
    // const space3_0 = space4.project(0);

    expect([...C.corners].length).toEqual(16)
    // expect([...space3_0.solids][0].corners.length).toEqual(8);
  })
})
