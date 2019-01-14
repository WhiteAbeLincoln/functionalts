import { AlternativeURIS, Alternative1 } from './Alternative'
import * as fc from 'fast-check'
import { Type } from './HKT'
import { Fn } from '../util/types'

/**
 * Tests the Distributivity law
 * `A.ap(A.alt(fab, gab), fa) = A.alt(A.ap(fab, fa), A.ap(gab, fa))`
 * @param A an Alternative module
 * @param faArb an arbitrary for an instance of the applicative contaning an A
 * @param fabArb an arbitrary for an instance of the applicative contaning a function A -> B
 */
export const Distributivity1 = <
F extends AlternativeURIS,
A, B,
>(
  A: Alternative1<F>,
  faArb: fc.Arbitrary<Type<F, A>>,
  fabArb: fc.Arbitrary<Type<F, Fn<[A], B>>>,
) => {
  fc.assert(fc.property(fc.tuple(faArb, fabArb, fabArb), ([fa, fab, gab]) => {
    expect(
      A.ap(A.alt(fab, gab), fa)
    ).toEqual(
      A.alt(A.ap(fab, fa), A.ap(gab, fa))
    )
  }))
}

/**
 * Tests the Annihiliation law `A.ap(A.zero(), fa) = A.zero()`
 * @param A an Alternative module
 * @param faArb an arbitrary for an instance of the applicative contaning an A
 */
export const Annihilation1 = <
F extends AlternativeURIS,
>(
  A: Alternative1<F>,
  faArb: fc.Arbitrary<Type<F, any>>,
) => {
  fc.assert(fc.property(faArb, fa => {
    expect(
      A.ap(A.zero() as Type<F, Fn<[any], any>>, fa)
    ).toEqual(
      A.zero()
    )
  }))
}
