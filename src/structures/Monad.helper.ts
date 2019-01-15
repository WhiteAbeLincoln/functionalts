import * as fc from 'fast-check'
import { MonadURIS, Monad1 } from './Monad'
import { Type } from './HKT'
import { Fn } from '../util/types'

/**
 * Tests the Left Identity law `M.chain(M.of(a), f) === f(a)`
 */
export const LeftIdentity1 = <
F extends MonadURIS,
A, B
>(M: Monad1<F>, aArb: fc.Arbitrary<A>, f: Fn<[A], Type<F, B>>) => {
  fc.assert(fc.property(aArb, a => {
    expect(
      M.chain(M.of(a), f)
    ).toEqual(
      f(a)
    )
  }))
}

/**
 * Tests the Right Identity law `M.chain(fa, M.of) === fa`
 */
export const RightIdentity1 = <
  F extends MonadURIS, A
>(M: Monad1<F>, faArb: fc.Arbitrary<Type<F, A>>) => {
  fc.assert(fc.property(faArb, fa => {
    expect(
      M.chain(fa, M.of)
    ).toEqual(
      fa
    )
  }))
}
