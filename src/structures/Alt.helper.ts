import { AltURIS, Alt1 } from './Alt'
import * as fc from 'fast-check'
import { Type } from './HKT'

/**
 * Tests the Associativity law `A.alt(A.alt(a, b), c) === A.alt(a, A.alt(b, c))`
 * @param A An Alt TypeRep
 * @param arbitrary an arbitrary providing Alt instances
 */
export const Associativity1 = <
  F extends AltURIS,
  A extends fc.Arbitrary<Type<F, any>>
>(A: Alt1<F>, arbitrary: A) => {
  fc.assert(fc.property(fc.tuple(arbitrary, arbitrary, arbitrary), ([a, b, c]) => {
    expect(A.alt(A.alt(a, b), c)).toEqual(A.alt(a, A.alt(b, c)))
  }))
}

/**
 * Tests the Distributivity law `A.map(A.alt(a, b), f) === A.alt(A.map(a, f), A.map(b, f))`
 * @param A An Alt TypeRep
 * @param arbitrary an arbitrary providing alt instances
 */
export const Distributivity1 = <
  F extends AltURIS,
  A extends fc.Arbitrary<Type<F, any>>
>(A: Alt1<F>, arbitrary: A) => {
  const f = <A>(a: A) => a

  fc.assert(fc.property(fc.tuple(arbitrary, arbitrary), ([a, b]) => {
    expect(A.map(A.alt(a, b), f)).toEqual(A.alt(A.map(a, f), A.map(b, f)))
  }))
}
