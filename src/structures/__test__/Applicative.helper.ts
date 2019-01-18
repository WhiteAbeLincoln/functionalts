import { ApplicativeURIS, Applicative1 } from '../Applicative'
import * as fc from 'fast-check'
import { Type } from '../HKT'
import { id } from '../../util/functional'
import { Fn } from '../../util/types'

/**
 * Tests the Identity law `A.ap(A.of(a => a), fa) = fa`
 * @param A an applicative module
 * @param arbitrary an arbitrary for the applicative
 */
export const Identity1 = <
F extends ApplicativeURIS
>(A: Applicative1<F>, arbitrary: fc.Arbitrary<Type<F, any>>) => {
  fc.assert(fc.property(arbitrary, fa => {
    expect(
      A.ap(A.of(id), fa)
    ).toEqual(
      fa
    )
  }))
}

/**
 * Tests the Homomorphism law `A.ap(A.of(ab), A.of(a)) === A.of(ab(a))`
 * @param A an applicative module
 * @param abArb an arbitrary for functions `a -> b`
 * @param aArb an arbitrary for `a`
 */
export const Homomorphism1 = <
F extends ApplicativeURIS,
A, B
>(A: Applicative1<F>, abArb: fc.Arbitrary<Fn<[A], B>>, aArb: fc.Arbitrary<A>) => {
  fc.assert(fc.property(fc.tuple(abArb, aArb), ([ab, a]) => {
    expect(
      A.ap(A.of(ab), A.of(a))
    ).toEqual(
      A.of(ab(a))
    )
  }))
}

/**
 * Tests the Interchange law `A.ap(fab, A.of(a)) === A.ap(A.of(ab => ab(a)), fab)`
 * @param A an Applicative module
 * @param abArb an arbitrary for functions `a -> b`
 * @param aArb an arbitrary for `a`
 */
export const Interchange1 = <
F extends ApplicativeURIS,
A, B
>(A: Applicative1<F>, abArb: fc.Arbitrary<Fn<[A], B>>, aArb: fc.Arbitrary<A>) => {
  fc.assert(fc.property(fc.tuple(abArb.map(A.of), aArb), ([fab, a]) => {
    expect(
      A.ap(fab, A.of(a))
    ).toEqual(
      A.ap(A.of((ab: Fn<[A], B>) => ab(a)), fab)
    )
  }))
}
