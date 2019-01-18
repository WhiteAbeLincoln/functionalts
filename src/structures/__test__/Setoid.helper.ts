import { Setoid } from '../Setoid'
import * as fc from 'fast-check'

export const Reflexivity = <A>(S: Setoid<A>, aArb: fc.Arbitrary<A>) => {
  fc.assert(fc.property(aArb, a => {
    expect(
      S.equals(a, a)
    ).toBe(
      true
    )
  }))
}

export const Symmetry = <A>(S: Setoid<A>, arbs: fc.Arbitrary<A>[]) => {
  fc.assert(fc.property(fc.oneof(...arbs.map(arb => fc.tuple(arb, arb))) , ([a, b]) => {
    expect(
      S.equals(a, b)
    ).toBe(
      S.equals(b, a)
    )
  }))
}

export const Transitivity = <A>(S: Setoid<A>, arbs: fc.Arbitrary<A>[]) => {
  const test = (a: A, b: A, c: A) => {
    const ab = S.equals(a, b)
    const bc = S.equals(b, c)
    const ac = S.equals(a, c)
    if (ab && bc) {
      expect(ac).toBe(true)
    }
  }

  // test with three items that may not be equal
  fc.assert(fc.property(fc.oneof(...arbs.map(arb => fc.tuple(arb, arb, arb))), ([a, b, c]) => {
    test(a, b, c)
  }))
  // also test with three that are equal, because fast-check probably wont generate three equal items
  fc.assert(fc.property(fc.oneof(...arbs), a => {
    test(a, a, a)
  }))
}
