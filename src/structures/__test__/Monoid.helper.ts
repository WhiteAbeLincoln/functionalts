import * as fc from 'fast-check'
import { Monoid } from '../Monoid'

/**
 * Tests the Left Identity law `M.concat(x, M.empty) === x`
 */
export const LeftIdentity =
  <A>(M: Monoid<A>, aArb: fc.Arbitrary<A>) => {
    fc.assert(fc.property(aArb, x => {
      expect(
        M.concat(x, M.empty)
      ).toEqual(
        x
      )
    }))
  }

/**
 * Tests the Right Identity law `M.concat(M.empty, x) === x`
 */
export const RightIdentity =
  <A>(M: Monoid<A>, aArb: fc.Arbitrary<A>) => {
    fc.assert(fc.property(aArb, x => {
      expect(
        M.concat(M.empty, x)
      ).toEqual(
        x
      )
    }))
  }
