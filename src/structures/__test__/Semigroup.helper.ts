import * as fc from 'fast-check'
import { Semigroup } from '../Semigroup'

/**
 * Tests the Associativity law `S.concat(x, S.concat(y, z)) === S.concat(S.concat(x, y), z)`
 */
export const Assoiciativity =
  <A>(S: Semigroup<A>, aArb: fc.Arbitrary<A>) => {
    fc.assert(fc.property(fc.tuple(aArb, aArb, aArb), ([x, y, z]) => {
      expect(
        S.concat(x, S.concat(y, z))
      ).toEqual(
        S.concat(S.concat(x, y), z)
      )
    }))
  }
