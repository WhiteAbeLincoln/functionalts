import { Ord } from '../Ord'
import * as fc from 'fast-check'

// required by Fantasy-Land and Static-Land
// not a law in haskell or fp-ts
// export const Totality = <A>(O: Ord<A>, aArb: fc.Arbitrary<A>) => {
//   fc.assert(fc.property(fc.tuple(aArb, aArb), ([a, b]) => {
//     const lte = lessThanOrEq(O)
//     const ab = lte(a, b)
//     const ba = lte(b, a)
//     expect(ab || ba).toBe(true)
//   }))
// }

/**
 * Tests the Reflexivity law `O.compare(a, a) <= 0`
 */
export const Reflexivity = <A>(O: Ord<A>, aArb: fc.Arbitrary<A>) => {
  fc.assert(fc.property(aArb, a => {
    expect(O.compare(a, a)).toBeLessThanOrEqual(0)
  }))
}

/**
 * Tests the Antisymmetry law `if O.compare(a, b) <= 0 && O.compare(b, a) <= 0 then O.equals(a, b)`
 */
export const Antisymmetry = <A>(O: Ord<A>, arbs: fc.Arbitrary<A>[]) => {
  const test = (a: A, b: A) => {
    const ab = O.compare(a, b) <= 0
    const ba = O.compare(b, a) <= 0
    if (ab && ba) {
      expect(O.equals(a, b)).toBe(true)
      expect(O.compare(a, b)).toBe(0)
    }
  }

  // we test with two items that may not be equal
  fc.assert(fc.property(fc.oneof(...arbs.map(arb => fc.tuple(arb, arb))), ([a, b]) => {
    test(a, b)
  }))
  // also test with two that are equal, because it's pretty unlikely
  // that fast-check will generate the same thing twice
  fc.assert(fc.property(fc.oneof(...arbs), a => {
    test(a, a)
  }))
}

/**
 * Tests the Transitivity law `if O.compare(a, b) <= 0 && O.compare(b, c) <= 0 then O.compare(a, c) <= 0`
 */
export const Transitivity = <A>(O: Ord<A>, arbs: fc.Arbitrary<A>[]) => {
  fc.assert(fc.property(fc.oneof(...arbs.map(aArb => fc.tuple(aArb, aArb, aArb))), ([a, b, c]) => {
    const ab = O.compare(a, b) <= 0
    const bc = O.compare(b, c) <= 0
    const ac = O.compare(a, c) <= 0
    if (ab && bc) {
      expect(ac).toBe(true)
    }
  }))
}
