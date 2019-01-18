import * as fc from 'fast-check'
import { Functor1, FunctorURIS } from '../Functor'
import { Type } from '../HKT'
import { id, B } from '../../util/functional'

/**
 * Tests the Identity law `F.map(fa, x => x) === fa`
 * @param F A functor TypeRep
 * @param aribtrary an arbitrary providing Functor instances
 */
export const Identity1 = <
  F extends FunctorURIS,
  A extends fc.Arbitrary<Type<F, any>>
>(F: Functor1<F>, aribtrary: A) => {
  fc.assert(fc.property(aribtrary, fa => {
    expect(F.map(fa, id)).toEqual(fa)
  }))
}

/**
 * Tests the Composition law `F.map(fa, x => g(f(x))) === F.map(F.map(fa, f), g)`
 * @param F A functor TypeRep
 * @param arbitrary an arbitrary for Functors containing numbers
 */
export const Composition1 = <
  F extends FunctorURIS,
  A extends fc.Arbitrary<Type<F, number>>
>(F: Functor1<F>, arbitrary: A) => {
  const f = (x: number) => x + 1
  const g = (x: number) => `${x}`
  fc.assert(fc.property(arbitrary, fa => {
    expect(
      F.map(F.map(fa, f), g)
    ).toEqual(
      F.map(fa, B(g)(f))
    )
  }))
}
