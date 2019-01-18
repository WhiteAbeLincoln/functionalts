import * as fc from 'fast-check'
import { ApplyURIS, Apply1 } from '../Apply'
import { Type } from '../HKT'
import { Fn } from '../../util/types'

/**
 * Tests the Composition law
 * `A.ap(A.ap(A.map(fbc, bc => ab => a => bc(ab(a))), fab), fa) === A.ap(fbc, A.ap(fab, fa))`
 */
export const Composition1 = <
F extends ApplyURIS,
A, B, C
>(A: Apply1<F>,
  fabArb: fc.Arbitrary<Type<F, Fn<[A], B>>>,
  fbcArb: fc.Arbitrary<Type<F, Fn<[B], C>>>,
  faArb: fc.Arbitrary<Type<F, A>>
) => {
  // type of fab: Apply<A -> B>
  // type of fbc: Apply<B -> C>
  // type of fa: Apply<C>

  fc.assert(fc.property(fc.tuple(fabArb, fbcArb, faArb), ([fab, fbc, fa]) => {
    expect(
      A.ap(
        A.ap(
          A.map(fbc, bc => (ab: Fn<[A], B>) => (a: A) => bc(ab(a)))
        , fab
        )
      , fa
      )
    ).toEqual(
      A.ap(fbc, A.ap(fab, fa))
    )
  }))
}
