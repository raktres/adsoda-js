import { createSolidFromHalfSpaces, Solid } from '../src/solid'
import { Space } from '../src/space'

const sfb = Solid.createSolidFromHalfSpaces([
  [-1, -6, 78],
  [-3, 1, 25],
  [2, 6, -70],
  [2, -1, 0]
])
sfb.name = 'sfb'

const sfr = Solid.createSolidFromHalfSpaces([
  [3, -2, 11],
  [-4, -3, 42],
  [-3, -1, 24],
  [4, 6, -46]
])
sfr.name = 'sfr'

const sfg = Solid.createSolidFromHalfSpaces([
  [1, -2, 0],
  [-1, 0, 14],
  [-1, 3, 8],
  [4, 1, -45]
])
sfg.name = 'sfg'

describe('space test', () => {
  const space1 = new Space(2)
  test('test add solids', () => {
    space1.suffixSolid(sfb)
    space1.suffixSolid(sfr)
    expect([...space1.solids].length).toEqual(2)
    space1.suffixSolid(sfr)
    // expect([...space1.solids].length).toEqual(2)
    expect([...space1.solids].length).toEqual(3)
    space1.suffixSolid(sfg)
    expect([...space1.solids].length).toEqual(4)
  })

  test('space project', () => {
    space1.ensureSolids()
    const spaceP0 = space1.project(0)
    expect(spaceP0.dimension).toEqual(1)
    spaceP0.ensureSolids()
    expect([...spaceP0.solids].length).toEqual(4)

    const spaceP2 = space1.project(1)
    spaceP2.ensureSolids()
    expect(spaceP2.dimension).toEqual(1)
    expect([...spaceP2.solids].length).toEqual(4)
  })
  test('space to JSON', () => {
    space1.ensureSolids()
    const txt = space1.exportToJSON()
    console.log(txt)
    expect(txt.length).toBeGreaterThan(1)
  })
  test('test JSON', () => {
    const jsontxt =
      '{ "name" : "space" , "dimension" : 2 , "groups" : [{ "id": "blop", "refs" : ["toto", "titi"]},{ "id": "blurp", "refs" : ["tutu"]}], "solids" : [ { "name" : "sfb" , "id": "toto", "dimension" : 2 ,   "color" : "000000" , "faces" : [ { "face" : [-1,-6,78] },{ "face" : [-3,1,25] },{ "face" : [2,6,-70] },{ "face" : [2,-1,0] }]},{ "name" : "sfr" , "id": "titi", "dimension" : 2 ,        "color" : "000000" , "faces" : [ { "face" : [3,-2,11] },{ "face" : [-4,-3,42] },{ "face" : [-3,-1,24] },{ "face" : [4,6,-46] }]},{ "name" : "sfg" , "dimension" : 2 ,   "id" : "tutu",    "color" : "000000" , "faces" : [ { "face" : [1,-2,0] },{ "face" : [-1,0,14] },{ "face" : [-1,3,8] },{ "face" : [4,1,-45] }]}]}'
    console.log(jsontxt)
      const space = Space.importFromJSON(JSON.parse(jsontxt))
      console.log('fin import', space)
    expect(space.dimension).toEqual(2)
    expect([...space.solids].length).toEqual(3)
    console.log('groups', space.groups)
    expect([...space.groups].length).toEqual(2)
  })
  test('test group', () => {

    const jsontxt =
      '{ "name" : "space" , "dimension" : 2 , "groups" : [{ "id": "blop", "refs" : ["toto", "titi"]},{ "id": "blurp", "refs" : ["tutu"]}], "solids" : [ { "name" : "sfb" , "id": "toto", "dimension" : 2 ,   "color" : "000000" , "faces" : [ { "face" : [-1,-6,78] },{ "face" : [-3,1,25] },{ "face" : [2,6,-70] },{ "face" : [2,-1,0] }]},{ "name" : "sfr" , "id": "titi", "dimension" : 2 ,        "color" : "000000" , "faces" : [ { "face" : [3,-2,11] },{ "face" : [-4,-3,42] },{ "face" : [-3,-1,24] },{ "face" : [4,6,-46] }]},{ "name" : "sfg" , "dimension" : 2 ,   "id" : "tutu",    "color" : "000000" , "faces" : [ { "face" : [1,-2,0] },{ "face" : [-1,0,14] },{ "face" : [-1,3,8] },{ "face" : [4,1,-45] }]}]}'
    // console.log(jsontxt)
      const space = Space.importFromJSON(JSON.parse(jsontxt))
      space.ensureSolids()
      space.solids.forEach(sol => {
        console.log('sol 1',sol.id, sol.corners)
      })
      // console.log('fin import')
    // expect(space.dimension).toEqual(2)
    // expect([...space.solids].length).toEqual(3)
    // console.log('groups', space.groups)
    // expect([...space.groups].length).toEqual(2)
space.translate([1,2])
space.ensureSolids()
    space.solids.forEach(sol => {
      console.log('sol 2',sol.id, sol.corners)
})
    space.transform([[1,-1],[-1,1]])
    // console.log('space',space)
  })

  test('test group multi', () => {
    const jsontxt =
    '{"spacename":"multi mini centre","dimension":4,"solids":[{"solidname":"triancube","dimension":4,"color":"#eb0340","faces":[{"face":[1,0,0,0,-0.6499999999999992]},{"face":[-0.4999999999999998,-0.8660254037844387,0,0,0.3486860279185589]},{"face":[-0.5000000000000004,0.8660254037844384,0,0,1.3013139720814428]},{"face":[0,0,1,0,-0.09999999999999924]},{"face":[0,0,-1,0,0.49999999999999895]},{"face":[0,0,0,1,-0.24999999999999967]},{"face":[0,0,0,-1,0.9499999999999993]}]},{"solidname":"triangone","dimension":4,"color":"#0310ea","faces":[{"face":[1,0,0,0,0.35]},{"face":[0.5,0.8660254037844386,0,0,0.3513139720814412]},{"face":[-0.5,0.8660254037844387,0,0,0.2013139720814408]},{"face":[-1,0,0,0,0.049999999999999684]},{"face":[-0.5,-0.8660254037844384,0,0,0.048686027918558715]},{"face":[0.5,-0.8660254037844387,0,0,0.19868602791855863]},{"face":[0,0,1,0,0.10000000000000057]},{"face":[0,0,-0.4999999999999998,-0.8660254037844387,-0.18612159321677263]},{"face":[0,0,-0.5000000000000004,0.8660254037844384,1.2861215932167727]}]},{"solidname":"cube","dimension":4,"color":"#aF099F","faces":[{"face":[1,0,0,0,-0.049999999999999684]},{"face":[-1,0,0,0,0.5499999999999992]},{"face":[0,1,0,0,-0.4499999999999996]},{"face":[0,-1,0,0,0.9499999999999995]},{"face":[0,0,1,0,0.3000000000000004]},{"face":[0,0,-1,0,0.19999999999999923]},{"face":[0,0,0,1,-0.1499999999999997]},{"face":[0,0,0,-1,0.6499999999999992]}]}]}'
  
    const space = Space.importFromJSON(JSON.parse(jsontxt))
    space.ensureSolids()
    space.translate([1,2,1,1])
    space.ensureSolids()
 

})

})
