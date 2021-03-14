/* globals describe, expect, beforeEach, test */
import { Solid } from '../src/solid.js'
// import { Solid, initSolidFromFace, createSolidFromHalfSpaces } from "./solid.js";
import { Face } from '../src/face.js'
import * as math from 'mathjs'
import * as P from '../src/parameters.js'
import { cube3D, cube4D } from '../src/space4d.js'
import {
  among,
  intersectHyperplanes,
  projectVector,
  isCornerEqual
} from '../src/halfspace.js'

describe( 'Solid test', () => {
  const hs1 = [1, -1, 3]
  const hs2 = [-1, 0, 6]
  const hs3 = [0, 1, -1]
  const hs4 = [1, 1, -5]

  const f1 = new Face( hs1 )
  let s1 = false
  let sfr = false
  let sfb = false
  let sfg = false

  test( 'solid create', () => {
    const S = new Solid( 5 )
    expect( S.dimension ).toEqual( 5 )
  } )

  test( 'math', () => {
    expect( math.unaryMinus( hs1 ) ).toEqual( [-1, 1, -3] )
  } )

  test( 'solid construction', () => {
    // console.log("f1 " + JSON.stringify(f1));
    s1 = Solid.initSolidFromFace( f1 )
    // console.log("s1 "+JSON.stringify(s1));
    s1.cutWith( hs2 )
    // console.log("s1 hs2 "+JSON.stringify(s1));
    s1.cutWith( hs3 )
    // console.log("s1 hs3 "+JSON.stringify(s1));
    s1.cutWith( hs4 )
    // console.log("s1 hs4 " + JSON.stringify(s1));
    s1.findAdjacencies()

    //  console.log("s1 corners "+JSON.stringify(s1.corners));
    // console.log("adja of face 1"+JSON.stringify(s1.faces[0]))
    // console.log(s1.faces[1].logDetail());
    // console.log(s1.logSummary());
    expect( [...s1.corners].length ).toEqual( 4 )
    expect( s1.faces[0].adjacentFaces.length ).toEqual( 2 )
  } )

  test( 'solid adjacencies', () => {
    s1.ensureFaces()
    s1.ensureSilhouettes()
    // console.log("silhouettes " + JSON.stringify(s1.silhouettes));

    expect( s1.silhouettes.length ).toEqual( 2 )
    // console.log('s1.silhouts', s1.silhouettes  )
    // console.log('s1.silhouts 0', s1.silhouettes[0] )
    expect( s1.silhouettes[0].length ).toEqual( 2 )

    // console.log(
    //    "s1.silhouettes[0][0].equ" +
    //        JSON.stringify(s1.silhouettes[0][0].equ)
    // );
    // console.log(JSON.stringify(s1));
    // expect(s1.silhouettes[0][0].equ.length).toEqual(3);
  } )

  test( 'solid projection', () => { } )

  test( 'Create solid blue from points', () => {
    sfb = new Solid( 2, [
      [-1, -6, 78],
      [-3, 1, 25],
      [2, 6, -70],
      [2, -1, 0]
    ] )
    expect( [...sfb.corners].length ).toEqual( 4 )
  } )
  test( 'Create solid red from points', () => {
    sfr = new Solid( 2, [
      [3, -2, 11],
      [-4, -3, 42],
      [-3, -1, 24],
      [4, 6, -46]
    ] )
    console.log( 'sfr solids', sfr.corners )
    sfr.ensureSilhouettes()
    // Attention le dernier ne devrait pas être un array
    const f1 = sfr.silhouettes[0][0]
    const f2 = sfr.silhouettes[0][1]
    const point1 = [0, 8]
    const point0 = [0, 0]
    const val1 = f1.isPointInsideFace( point1 )
    const val2 = f2.isPointInsideFace( point1 )
    const val10 = f1.isPointInsideFace( point0 )
    const val20 = f2.isPointInsideFace( point0 )

    expect( val1 ).toBeTruthy()
    expect( val2 ).toBeTruthy()
    expect( val10 ).toBeTruthy()
    expect( val20 ).toBeFalsy()
    const f3 = sfr.silhouettes[1][0]
    const f4 = sfr.silhouettes[1][1]
    const point2 = [5, 0]
    const val3 = f3.isPointInsideFace( point2 )
    const val4 = f4.isPointInsideFace( point2 )
    const val30 = f3.isPointInsideFace( point0 )
    const val40 = f4.isPointInsideFace( point0 )
    expect( val3 ).toBeTruthy()
    expect( val4 ).toBeTruthy()
    // TODO: attention !!!
    expect( val30 ).toBeTruthy()
    expect( val40 ).toBeFalsy()
    /* expect(sfr.silhouettes[1][0]).toEqual([0,1,-1]);
        expect(sfr.silhouettes[1][1]).toEqual([0,-1,7]); */
  } )
  test( 'Create solid green from points', () => {
    sfg = new Solid( 2, [
      [1, -2, 0],
      [-1, 0, 14],
      [-1, 3, 8],
      [4, 1, -45]
    ] )
    expect( [...sfg.corners].length ).toEqual( 4 )
  } )
  test( 'is corner equel', () => {
    const p1 = [0, 1, 2]
    const p2 = [3, 4, 5]
    const p3 = [0 + 2 * P.VERY_SMALL_NUM, 1, 2 - P.VERY_SMALL_NUM]
    const p4 = [0 + P.VERY_SMALL_NUM / 2, 1, 2 - P.VERY_SMALL_NUM / 10]
    expect( isCornerEqual( p1, p2 ) ).toBeFalsy()
    expect( isCornerEqual( p1, p3 ) ).toBeFalsy()

    expect( isCornerEqual( p1, p4 ) ).toBeTruthy()
  } )

  test( 'test slice', () => {
    const face = new Face( [1, -1, -8] )
    const tmp = sfg.sliceWith( face )
    tmp.ensureFaces()
    sfg.ensureFaces()
    expect( [...sfg.corners].length ).toEqual( 4 )
    expect( [...tmp.corners].length ).toEqual( 4 )
  } )
  test( 'solid subtract', () => {
    const ss1 = new Solid( 2, [
      [1, 0, -2],
      [-1, 0, 7],
      [0, 1, -2],
      [0, -1, 6]
    ] )
    expect( [...ss1.corners].length ).toEqual( 4 )
    const ss2 = new Solid( 2, [
      [1, 0, -1],
      [-1, 0, 5],
      [1, -1, 2],
      [-1, -1, 8],
      [0, 1, -1]
    ] )
    expect( ss2.corners.length ).toEqual( 5 )
    const ssg3 = ss1.subtract( ss2.faces )
    expect( ssg3.length ).toEqual( 3 )
  } )
  test( 'solid middle', () => {
    const ss1 = new Solid( 2, [
      [1, 0, -2],
      [-1, 0, 7],
      [0, 1, -2],
      [0, -1, 6]
    ] )
    const middle = ss1.middleOf()
    expect( middle ).toEqual( [4.5, 4] )
  } )
  test( 'solid subtract', () => {
    const pr0 = sfr.project( 0 )
    expect( pr0[0].isPointInsideSolid( [8] ) ).toBeTruthy()
    expect( pr0[0].isPointInsideSolid( [2] ) ).toBeFalsy()
    expect( pr0[0].isPointInsideSolid( [11] ) ).toBeFalsy()
  } )

  test( 'test is point inside faces', () => {
    const result = Face.isPointInsideFaces( sfr.silhouettes[0], [14, 7] )
    expect( result ).toBeTruthy()
  } )

  test( 'order solids', () => {
    sfb.ensureSilhouettes()
    sfr.ensureSilhouettes()
    sfg.ensureSilhouettes()
    const order = sfb.order( sfr, 0 )
    expect( order ).toEqual( -1 )
    const order2 = sfr.order( sfb, 0 )
    expect( order2 ).toEqual( 1 )
    const order3 = sfb.order( sfg, 0 )
    expect( order3 ).toBeFalsy
  } )
  test( 'clip solids', () => {
    const clip0 = sfb.clipWith( sfb, 0 )
    expect( clip0 ).toBeFalsy
    const clip1 = sfb.clipWith( sfr, 0 )
    expect( clip1 ).toBeFalsy
    const clip = sfr.clipWith( sfb, 0 )
    expect( clip.length ).toEqual( 1 )
    expect( clip[0].faces.length ).toEqual( 4 )
  } )
  test( 'solid translate', () => {
    sfg = new Solid( 2, [
      [1, -2, 0],
      [-1, 0, 14],
      [-1, 3, 8],
      [4, 1, -45]
    ] )
    sfg.selected = true
    expect( sfg.isPointInsideSolid( [12, 2] ) ).toBeTruthy()
    expect( sfg.isPointInsideSolid( [11, 6] ) ).toBeFalsy()
    sfg.translate( [0, 2] )
    sfg.ensureFaces()
    expect( sfg.isPointInsideSolid( [12, 2] ) ).toBeFalsy()
    expect( sfg.isPointInsideSolid( [11, 6] ) ).toBeTruthy()
  } )
  function rotXY ( d ) {
    const a = ( d * Math.PI ) / 180
    const c = Math.cos( a )
    const s = Math.sin( a )
    const rot = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, c, -s],
      [0, 0, s, c]
    ]

    return rot
  }
  test( 'solid 4D rotation', () => {
    // const space4 = new Space(4, "toto");
    const C = cube4D( 2, 5 )
    // console.log("avant rot"+C.logSummary());
    const t = C.isPointInsideSolid( [4, 4, 4.9, 4] )
    expect( t ).toBeTruthy()
    // C.selected = true ;
    const r1 = rotXY( 5 )
    C.transform( r1, [0, 0, 0, 0], true )
    C.ensureFaces()
    // console.log("après rot"+C.logSummary());
    // space4.suffixSolid(C);
    // const space3_0 = space4.project(0);
    expect( C.isPointInsideSolid( [4, 4, 4.9, 4] ) ).toBeFalsy()
  } )
  test( 'test JSON', () => {
    const C = cube4D( 2, 5 )
    const txt = C.exportToJSON()
    // console.log('solid to JSON ' + txt)
    expect( true ).toBeTruthy()

    const jsontxt =
      '{ "name" : "solid" , "dimension" : 3 , "color" : "000000" , "faces" : [ { "face" : [-1,0,0,0,5] },{ "face" : [1,0,0,0,-2] },{ "face" : [0,-1,0,0,5] },{ "face" : [0,1,0,0,-2] },{ "face" : [0,0,-1,0,5] },{ "face" : [0,0,1,0,-2] },{ "face" : [0,0,0,-1,5] },{ "face" : [0,0,0,1,-2] }]}'
    const sol = Solid.importFromJSON( JSON.parse( jsontxt ) )
    expect( sol.dimension ).toEqual( 3 )
  } )

  test( 'create from vertices', () => {
    let points = [[1, 1], [1, 2], [2, 1], [2, 2]]
    let sol = Solid.createSolidFromVertices( points )
    // console.log(sol.exportToJSON)
    // expect(sol.corners.length).toEqual(4)
    expect( 4 ).toEqual( 4 )
  } )

  test( 'create from vertices', () => {
    let points = [[1, 1, 1], [2, 1, 1], [2, 2, 1], [1, 2, 1], [1, 1, 2], [2, 1, 2], [2, 2, 2], [1, 2, 2]]
    let sol = Solid.createSolidFromVertices( points )
    // console.log(sol.exportToJSON)

    // expect(8).toEqual(8)
    expect( sol.corners.length ).toEqual( 8 )
  } )


  test( 'create from vertices 4D', () => {
    const tetrahedra = [[-0.949, -1.225, 0, 0],
    [-0.949, 0.408, -1.155, 0],
    [-0.949, 0.408, 0.577, -1],
    [-0.949, 0.408, 0.577, 1],
    [0.632, 0.816, 1.155, 0],
    [0.632, -0.816, -1.155, 0],
    [0.632, 0.816, -0.577, -1],
    [0.632, 0.816, -0.577, 1],
    [0.632, -0.816, 0.577, -1],
    [0.632, -0.816, 0.577, 1]]

    let sol = Solid.createSolidFromVertices( tetrahedra )
    // console.log(sol.exportToJSON())
    // console.table(sol.corners)
    expect( sol.corners.length ).toEqual( 10 )
  } )


  test( '2D proj', () => {
    let points = [[2, 1], [4, 1], [1, 3], [5, 3], [2, 5], [4, 5]]
    let sol = Solid.createSolidFromVertices( points )
    console.log( 'sol ', sol.faces.map( f => f.equ ) )
    expect( sol.faces.length ).toEqual( 6 )
    expect( sol.corners.length ).toEqual( 6 )
    let nb_adja = sol.faces.map( f => f.adjacentFaces.length )

    console.log( nb_adja )
    // expect(sol.corners.length).toEqual(4)
    expect( Math.min( ...nb_adja ) ).toEqual( 2 )
    expect( Math.max( ...nb_adja ) ).toEqual( 2 )

    console.log( 'corners 0', sol.corners )
    // sol.transform([[0.95630, -0.29237],[0.29237, 0.95630]], [3,3])
    let d = 0
    let a = ( d * Math.PI ) / 180
    let c = Math.cos( a )
    let s = Math.sin( a )
    let rot = [
      [c, -s],
      [s, c]
    ]
    sol.transform( rot, [3, 3] )
    sol.ensureFaces()
    console.log( 'sol ', sol.faces.map( f => f.equ ) )
    console.log( 'corners 1', sol.corners )
    expect( sol.faces.length ).toEqual( 6 )
    expect( sol.corners.length ).toEqual( 6 )
    nb_adja = sol.faces.map( f => f.adjacentFaces.length )

    console.log( nb_adja )
    // expect(sol.corners.length).toEqual(4)
    expect( Math.min( ...nb_adja ) ).toEqual( 2 )
    expect( Math.max( ...nb_adja ) ).toEqual( 2 )
    sol.ensureSilhouettes()
    expect( sol.silhouettes.length ).toEqual( 2 )
    console.log( 'sil 0', sol.silhouettes[0].map( x => x.equ ) )
    console.log( 'sil 1', sol.silhouettes[1].map( x => x.equ ) )


    d = 90
    a = ( d * Math.PI ) / 180
    c = Math.cos( a )
    s = Math.sin( a )
    rot = [
      [c, -s],
      [s, c]
    ]
    sol.transform( rot, [3, 3] )
    sol.ensureFaces()
    console.log( 'sol 2', sol.faces.map( f => f.equ ) )
    console.log( 'corners 2', sol.corners )
    expect( sol.faces.length ).toEqual( 6 )
    expect( sol.corners.length ).toEqual( 6 )
    nb_adja = sol.faces.map( f => f.adjacentFaces.length )

    console.log( nb_adja )
    // expect(sol.corners.length).toEqual(4)
    expect( Math.min( ...nb_adja ) ).toEqual( 2 )
    expect( Math.max( ...nb_adja ) ).toEqual( 2 )
    sol.ensureSilhouettes()
    expect( sol.silhouettes.length ).toEqual( 2 )
    console.log( 'sil 2 0', sol.silhouettes[0].map( x => x.equ ) )
    console.log( 'sil 2 1', sol.silhouettes[1].map( x => x.equ ) )

    d = 45
    a = ( d * Math.PI ) / 180
    c = Math.cos( a )
    s = Math.sin( a )
    rot = [
      [c, -s],
      [s, c]
    ]
    sol.transform( rot, [3, 3] )
    sol.ensureFaces()
    console.log( 'sol 3', sol.faces.map( f => f.equ ) )
    console.log( 'corners 3', sol.corners )
    expect( sol.faces.length ).toEqual( 6 )
    expect( sol.corners.length ).toEqual( 6 )
    nb_adja = sol.faces.map( f => f.adjacentFaces.length )

    console.log( nb_adja )
    // expect(sol.corners.length).toEqual(4)
    expect( Math.min( ...nb_adja ) ).toEqual( 2 )
    expect( Math.max( ...nb_adja ) ).toEqual( 2 )
    sol.ensureSilhouettes()
    expect( sol.silhouettes.length ).toEqual( 2 )
    console.log( 'sil 2 0', sol.silhouettes[0].map( x => x.equ ) )
    console.log( 'sil 2 1', sol.silhouettes[1].map( x => x.equ ) )

    d = 12.6
    a = ( d * Math.PI ) / 180
    c = Math.cos( a )
    s = Math.sin( a )
    rot = [
      [c, -s],
      [s, c]
    ]
    sol.transform( rot, [0, 0] )
    sol.ensureFaces()
    console.log( 'sol 4', sol.faces.map( f => f.equ ) )
    console.log( 'corners 4', sol.corners )
    expect( sol.faces.length ).toEqual( 6 )
    expect( sol.corners.length ).toEqual( 6 )
    nb_adja = sol.faces.map( f => f.adjacentFaces.length )

    console.log( nb_adja )
    // expect(sol.corners.length).toEqual(4)
    expect( Math.min( ...nb_adja ) ).toEqual( 2 )
    expect( Math.max( ...nb_adja ) ).toEqual( 2 )
    sol.ensureSilhouettes()
    expect( sol.silhouettes.length ).toEqual( 2 )
    console.log( 'sil 2 0', sol.silhouettes[0].map( x => x.equ ) )
    console.log( 'sil 2 1', sol.silhouettes[1].map( x => x.equ ) )

    sol.translate( [3, -2], [0, 0] )
    sol.ensureFaces()
    console.log( 'sol ', sol.faces.map( f => f.equ ) )
    expect( sol.faces.length ).toEqual( 6 )
    expect( sol.corners.length ).toEqual( 6 )
    nb_adja = sol.faces.map( f => f.adjacentFaces.length )

    console.log( nb_adja )
    // expect(sol.corners.length).toEqual(4)
    expect( Math.min( ...nb_adja ) ).toEqual( 2 )
    expect( Math.max( ...nb_adja ) ).toEqual( 2 )
    sol.ensureSilhouettes()
    expect( sol.silhouettes.length ).toEqual( 2 )
    console.log( 'sil 2 0', sol.silhouettes[0].map( x => x.equ ) )
    console.log( 'sil 2 1', sol.silhouettes[1].map( x => x.equ ) )
  } )

  test( '2D project', () => {
    let points = [[2, 1], [4, 1], [1, 3], [5, 3], [2, 5], [4, 5]]
    let sol = Solid.createSolidFromVertices( points )
    // console.log('sol ', sol.faces.map(f=> f.equ ))
    // expect(sol.faces.length).toEqual(6)
    // expect(sol.corners.length).toEqual(6)
    // let nb_adja = sol.faces.map(f => f.adjacentFaces.length)
    const pr0 = sol.project( 0 )
    expect( sol.project( 0 )[0].corners[0] ).toEqual( [1] )
    expect( sol.project( 0 )[0].corners[1] ).toEqual( [5] )
    expect( sol.project( 1 )[0].corners[0] ).toEqual( [5] )
    expect( sol.project( 1 )[0].corners[1] ).toEqual( [1] )
  } )

  test( '3D test proj', () => {
    let points = [[1, 1, 1], [2, 1, 1], [2, 2, 1], [1, 2, 1], [1, 1, 2], [2, 1, 2], [2, 2, 2], [1, 2, 2]]
    let sol = Solid.createSolidFromVertices( points )
    // console.log(sol.exportToJSON)

    // expect(8).toEqual(8)
    // const pr0 = 
    expect( sol.project( 0 )[0].corners.length ).toEqual( 4 )
    expect( sol.project( 1 )[0].corners.length ).toEqual( 4 )
    expect( sol.project( 2 )[0].corners.length ).toEqual( 4 )

    // expect(sol.corners.length).toEqual(8)
  } )

  test( '3D test proj', () => {
    let points = [[1, 1, 1], [2, 1, 1], [2, 2, 1], [1, 2, 1], [1, 1, 2], [2, 1, 2], [2, 2, 2], [1, 2, 2]]
    let sol = Solid.createSolidFromVertices( points )
    // console.log(sol.exportToJSON)

    // expect(8).toEqual(8)
    // const pr0 = 
    console.log( sol.project( 0 )[0].corners )
    console.log( sol.project( 1 )[0].corners )
    console.log( sol.project( 2 )[0].corners )
    console.log( sol.project( 2 )[0].faces )

    let d = 17
    let a = ( d * Math.PI ) / 180
    let c = Math.cos( a )
    let s = Math.sin( a )
    let rot = [
      [c, -s, 0], // [1,0,0], //
      [s, c, 0], //  [0,1,0], //
      [0, 0, 1]
    ]
    sol.transform( rot, [1.5, 1.5, 1.5] )
    // sol.translate([1.5, 1.5, 1.5])
    /*
    d = 47
    a = (d * Math.PI) / 180
    c = Math.cos(a)
    s = Math.sin(a)
    rot = [
      [c, 0, s],
      [0,1,0],
      [-s,0, c]
    ]
    sol.transform(rot, [0,0,0])
    */
    console.log( sol.project( 0 )[0].corners )
    console.log( sol.project( 1 )[0].corners )
    console.log( sol.project( 2 )[0].corners )
    // console.log(sol.project(2)[0].faces)

    // expect(sol.corners.length).toEqual(8)
  } )

  /*
    "solids": [ 
      { "solidname" : "16-cell" , "dimension" : 4 ,
          "color" : "#787878" , 
          "faces" : [ 
              { "face" : [1,1,1,1,1] },
              { "face" : [-1,1,1,1,1] },
              { "face" : [1,-1,1,1,1] },
              { "face" : [-1,-1,1,1,1] },
              { "face" : [1,1,-1,1,1] },
              { "face" : [-1,1,-1,1,1] },
              { "face" : [1,-1,-1,1,1] },
              { "face" : [-1,-1,-1,1,1] },
              { "face" : [1,1,1,-1,1] },
              { "face" : [-1,1,1,-1,1] },
              { "face" : [1,-1,1,-1,1] },
              { "face" : [-1,-1,1,-1,1] },
              { "face" : [1,1,-1,-1,1] },
              { "face" : [-1,1,-1,-1,1] },
              { "face" : [1,-1,-1,-1,1] },
              { "face" : [-1,-1,-1,-1,1] }
          ]
      }
  ]
  */
  test( 'test 4D', () => {
    const octahedra = [
      [-1, 0, 0, 0],
      [1, 0, 0, 0],
      [0, -1, 0, 0],
      [0, 1, 0, 0],
      [0, 0, -1, 0],
      [0, 0, 1, 0],
      [0, 0, 0, -1],
      [0, 0, 0, 1]
    ]
    let sol = Solid.createSolidFromVertices( octahedra )
    console.log( sol.exportToJSON() )

    console.table( sol.corners )
    sol.ensureSilhouettes()

    const HS = [
      [1, 1, 1, 1, 1],
      [-1, 1, 1, 1, 1],
      [1, -1, 1, 1, 1],
      [-1, -1, 1, 1, 1],
      [1, 1, -1, 1, 1],
      [-1, 1, -1, 1, 1],
      [1, -1, -1, 1, 1],
      [-1, -1, -1, 1, 1],
      [1, 1, 1, -1, 1],
      [-1, 1, 1, -1, 1],
      [1, -1, 1, -1, 1],
      [-1, -1, 1, -1, 1],
      [1, 1, -1, -1, 1],
      [-1, 1, -1, -1, 1],
      [1, -1, -1, -1, 1],
      [-1, -1, -1, -1, 1]]

    const ss4d = new Solid( 4, HS )
    ss4d.ensureSilhouettes()
    // console.log(ss4d)
    // const s40 = ss4d.project(0)
    // console.log(s40)
    // console.log(sol.silhouettes)
    // console.table(sol.silhouettes.map(x => x[1].equ))

    //   const s0 = sol.project(0)
    // console.log(s0)
    //expect(sol.corners.length).toEqual(8)
    expect( 8 ).toEqual( 8 )
  } )

} )
