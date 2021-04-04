
/* globals describe, expect, beforeEach, test */
// const translate = require('./halfspace.js');

import {
  positionPoint,
  projectVector,
  intersectHyperplanes,
  echelon,
  nonZeroRows,
  getConstant,
  getCoordinate,
  amongIndex,
  moizeAmongIndex,
  solution,
  constantAdd,
  isCornerEqual,
  vectorFromPoints,
  findnormal,
  normalize
} from '../src/halfspace.js'
import * as P from '../src/parameters.js'

const a = [1, 2, 3]
const b = [2, 3, 4]

describe( 'Tests of halfspace', () => {
  beforeEach( () => {
    // do something
  } )

  test( 'isCornerEqual', () => {
    const a1 = [3, 7, 4]
    const a2 = [3, 7, 4]
    const res1 = isCornerEqual( a1, a2 )
    a2[1] += P.VERY_SMALL_NUM / 2
    const res2 = isCornerEqual( a1, a2 )
    a2[1] += P.VERY_SMALL_NUM
    const res3 = isCornerEqual( a1, a2 )
    a2[1] += P.VERY_SMALL_NUM * 2
    const res4 = isCornerEqual( a1, a2 )
    // const res5 = isCornerEqual( 0, P.VERY_SMALL_NUM / 2 )
    // const res6 = isCornerEqual( 0, P.VERY_SMALL_NUM )
    expect( res1 ).toBeTruthy()
    expect( res2 ).toBeTruthy()
    expect( res3 ).toBeFalsy()
    expect( res4 ).toBeFalsy()
   // expect( res5 ).toBeTruthy()
  //  expect( res6 ).toBeFalsy()
  } )

  // TODO
  test( 'project', () => {
    const c = projectVector( a, 0 )
    expect( c ).toEqual( [2, 3] )
  } )

  test( 'vector from points', () => {
    const c = vectorFromPoints( a, b )
    expect( c ).toEqual( [-1, -1, -1] )
  } )

  test( 'constant add', () => {
    const c = [1, 2, 3, 4]
    constantAdd( c, 4 )
    expect( c ).toEqual( [1, 2, 3, 0] )
  } )

  test( 'get constant ', () => {
    const c = [1, 2, 3, 4]
    const d = getConstant( c )
    expect( d ).toEqual( 4 )
  } )

  test( 'get coordinate ', () => {
    const c = [1, 2, 3, 4]
    const d = getCoordinate( c, 2 )
    expect( d ).toEqual( 3 )
  } )

  test( 'normalize ', () => {
    const c = normalize([1, 0, 0, 1])
    const d = getCoordinate( c, 3 )
    expect( d ).toEqual( 1 )
    const e = normalize([2, 0, 0, 1])
    const f = getCoordinate( e, 0 )
    expect( f ).toEqual( 1 )
    const g = getCoordinate( e, 3 )

    expect( g ).toEqual( 0.5 )
  } )

  /* test("project false", () => {
        const c = projectVector(a, 4);
        expect(c).toBeFalsy();
    }); */

  test( 'amongIndex', () => {
    const array2 =  amongIndex( 3, 2, 2 ) 
    expect( array2.length ).toEqual( 3 )
    const array13 =  amongIndex( 3, 1, 3 )
    expect( array13.length ).toEqual( 7 )
  } )
  test( 'amongIndex Moize', () => {
    let array2 =  moizeAmongIndex( 3, 2, 2 ) 
    expect( array2.length ).toEqual( 3 )
    const array13 = moizeAmongIndex( 3, 1, 3 ) 
    expect( array13.length ).toEqual( 7 )
    array2 =  moizeAmongIndex( 3, 2, 2 ) 
    expect( array2.length ).toEqual( 3 )
    array2 = moizeAmongIndex( 3, 2, 2 ) 
    expect( array2.length ).toEqual( 3 )
    array2 = moizeAmongIndex( 3, 2, 2 ) 
    expect( array2.length ).toEqual( 3 )
  } )
  //

  test( 'nonZeroRows', () => {
    const matrix = [
      [1, 2, -1, -4],
      [0, 0, 0, 0],
      [-2, 0, -3, 22],
      [0, 0, 0, 22],
      [0 + P.VERY_SMALL_NUM / 10, 0 - P.VERY_SMALL_NUM / 10, 0, 0]
    ]

    // console.log("init"+JSON.stringify(matrix));
    const fil = nonZeroRows( matrix )
    // console.log(fil);
    // 3 ou 4 ?
    expect( fil.length ).toEqual( 3 )
  } )

  test( 'echelon', () => {
    const matrix = [
      [1, 2, -1, -4],
      [2, 3, -1, -11],
      [-2, 0, -3, 22]
    ]

    // console.log("init"+JSON.stringify(matrix));
    const ech = echelon( matrix )
    // console.log(ech);
    expect( ech[0][3] ).toEqual( -8 )
    expect( ech[1][3] ).toEqual( 1 )
    expect( ech[2][3] ).toEqual( -2 )
  } )
  //
  //
  test( 'solution', () => {
    const matrix = [
      [1, 2, -1, -4],
      [2, 3, -1, -11],
      [-2, 0, -3, 22],
      [-4, 0, -6, 44],
      [2, 4, -2, -8]
    ]

    // console.log("init"+JSON.stringify(matrix));
    const ech = solution( matrix )
    // console.log(ech);
    expect( ech[0] ).toEqual( 8 )
    expect( ech[1] ).toEqual( -1 )
    expect( ech[2] ).toEqual( 2 )
  } )

  test( 'Solution 2D', () => {
    const matrix = [
      [1, -1, 3],
      [1, 1, -5]
    ]
    
    expect( intersectHyperplanes( matrix ) ).toEqual( [1, 4] )
    const matrix1 = [
      [1, -1, 3],
      [-1, 0, 6]
    ]
    expect( intersectHyperplanes( matrix1 ) ).toEqual( [6, 9] )
    const matrix2 = [
      [1, 1, -5],
      [0, 1, -1]
    ]
    expect( intersectHyperplanes( matrix2 ) ).toEqual( [4, 1] )
  } )

  test( 'Position test 1', () => {
    const halfspace = [1, -1, 3]
    expect( positionPoint( halfspace, [6, 9] ) ).toEqual( 0 )
    expect( positionPoint( halfspace, [0, 0] ) ).toBeGreaterThan( 0 )
    expect( positionPoint( halfspace, [0, 10] ) ).toBeLessThan( 0 )
  } )

  test( 'normal vector', () => {
// const listgroupcube = JSON.parse( amongIndex( 8, 4, 4 ) )

    let groupcube = [[1, 1, 1], [2, 1, 1], [2, 2, 1]] // .map(el => tetrahedra[el])
    let vectscube = findnormal(groupcube)
    expect( vectscube).toEqual( [0,0,1,-1] )
   // console.log('groupcube Z', vectscube)

    groupcube = [[1, 1, 1], [1, 2, 1], [1, 1, 2]]
    vectscube = findnormal(groupcube)
    expect( vectscube).toEqual( [1,0,0,-1] )
    //console.log('groupcube X', findnormal(groupcube))

    groupcube = [[1, 1, 1], [2, 1, 1], [1, 1, 2]]
    vectscube = findnormal(groupcube)
    expect( vectscube).toEqual( [0,1,0,-1] )
    //console.log('groupcube Y', findnormal(groupcube))
    // groupcube = [[-1, 0, 0], [1, 0, 0], [0, 0, 1]]
    // console.log('groupcube diag', findnormal(groupcube))

   // groupcube = [ [1, 2, 2],  [1, 1, 1], [2, 1, 1]]
    // console.log('groupcube diag 2', findnormal(groupcube))
    //console.log('gc diag 2 lusolve',lusolve(groupcube, [1,1,1]))


    // groupcube = [[1, 2, 2], [1, 2, 1], [2, 1, 1]]
    // const groupcube2 = [[1, 1, 1], [2, 1, 1], [2, 1, 2]]
    // console.log('groupcube verif',findnormal(groupcube))

  } )

  test( 'solution e17', () => {
  const grp =  [    
    [      0,      0,      6.123233995736766e-17,      1,      1    ],    
    [      0,      0,      -1,      6.123233995736766e-17,      1    ],
    [      -1,      0,      0,      0,      1    ],    
    [      0,      1,      0,      0,      1    ],    

  ]
  const res = solution(grp)

  })

  test( 'from corner to faces', () => {


    const tetrahedra =     [[-0.949, -1.225, 0, 0],
    [-0.949, 0.408, -1.155, 0],
    [-0.949, 0.408, 0.577, -1],
    [-0.949, 0.408, 0.577, 1],
    [0.632, 0.816, 1.155, 0],
    [0.632, -0.816, -1.155, 0],
    [0.632, 0.816, -0.577, -1],
    [0.632, 0.816, -0.577, 1],
    [0.632, -0.816, 0.577, -1],
    [0.632, -0.816, 0.577, 1]]

    // [[1, 0, 0, 0], [2, 0, 0, 0], [0, 1, 0, 0], [0, 2, 0, 0], [0, 0, 1, 0], [0, 0, 2, 0], [0, 0, 0, 1], [0, 0, 0, 2]]
    //const pointB = [1, 1]
    // const pointC = [1, 0]
    // const pointD = [0, 0]
    // const pointA = [0, 1]
    // const vect1 = [[1, 0, 0, 0], [-1, 1, 0, 0], [-1, 2, 0, 0]]
    // console.log( 'vect1' )
    // console.table( echelon( vect1 ) )
    const listgroup =  amongIndex( 8, 4, 4 ) // JSON.parse()
    // console.log( 'among' )
    console.table( listgroup )
    // console.table(listgroup[0])

    listgroup.forEach( ( group, idx ) => {
      // let group = listgroup[5]
      let groupdev = [tetrahedra[group[0]], tetrahedra[group[1]], tetrahedra[group[2]], tetrahedra[group[3]]]
      let res = findnormal(groupdev)
      if(res) {
        // console.log('vect', idx, res)
      }
      //console.log( 'group', group[0], tetrahedra[group[0]] )
      //let groupres = echelon( groupdev )
      //console.log( 'echelon', idx )
      //console.table( groupres )
    } )


    let res1 = solution( [[1, 0, 3], [-2, 1, 3]] )
    let res11 = echelon( [[-2, 1, 3, 5], [1, 0, 3, 8], [0, 1, 1, 5]] )
    // let tmp = multiply(transpose(res11).slice(-1)[0],-1).concat([1])
    let res12 = echelon( [[1, 1, 0], [1, -1, 0]] )
    let res13 = echelon( [[0, 1, 1], [0, 1, -1]] ) // transpose(res12.map(vector => vector.slice(-1)))
    let res14 = '' // multiply(res12[0], -1)
  //  let res2 = echelon( [pointD, pointB] )
//    let res3 = nonZeroRows( echelon( [pointA, pointB] ) )[0]
  //  let res4 = nonZeroRows( echelon( [pointC, pointD] ) )[0]

    // console.log( 'res', res1, res11, res12, res13 ) // res12, res13, res14)
    // console.log( 'ec', echelon( [pointC, pointB] ) )

    // console.log('lu', lusolve([[0,1,0,0],[0,0,1,0], [0,0,0,1],[0,0,0,0]],[1,1,1,0]))
    expect( 1 ).toEqual( 1 )
  } )
} )
