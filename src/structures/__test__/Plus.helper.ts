import * as fc from 'fast-check'
import { PlusURIS, Plus1 } from '../Plus'
import { Type } from '../HKT'
import { id } from '../../util/functional'

/**
 * Tests the Right Identity law `P.alt(a, P.zero()) === a`
 * @param P A Plus TypeRep
 * @param arbitrary an arbitrary providing Plus instances
 */
export const RightIdentity1 = <
  P extends PlusURIS,
  A extends fc.Arbitrary<Type<P, any>>
>(P: Plus1<P>, arbitrary: A) => {
  fc.assert(fc.property(arbitrary, a => {
    expect(P.alt(a, P.zero())).toEqual(a)
  }))
}

/**
 * Tests the Left Identity law `P.alt(P.zero(), a) === a`
 * @param P A Plus TypeRep
 * @param arbitrary an arbitrary providing Plus instances
 */
export const LeftIdentity1 = <
  P extends PlusURIS,
  A extends fc.Arbitrary<Type<P, any>>
>(P: Plus1<P>, arbitrary: A) => {
  fc.assert(fc.property(arbitrary, a => {
    expect(P.alt(P.zero(), a)).toEqual(a)
  }))
}


/**
 * Tests the Annihilation law `P.map(P.zero(), f) === P.zero()`
 * @param P A Plus TypeRep
 * @param arbitrary an arbitrary providing Plus instances
 */
export const Annihilation1 = <
  P extends PlusURIS,
>(P: Plus1<P>) => {
  expect(P.map(P.zero(), id)).toEqual(P.zero())
}
