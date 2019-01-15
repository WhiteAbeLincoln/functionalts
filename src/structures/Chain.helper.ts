import { ChainURIS, Chain1 } from './Chain'
import * as fc from 'fast-check'
import { Type } from './HKT'
import { Fn } from '../util/types'

/**
 * Tests the Associativity law
 * `F.chain(F.chain(fa, afb), bfc) === F.chain(fa, a => F.chain(afb(a), bfc))`
 * @param A
 */
export const Associativity1 = <
  F extends ChainURIS,
  A, B, C
>(F: Chain1<F>, faArb: fc.Arbitrary<Type<F, A>>, afbArb: fc.Arbitrary<Fn<[A], Type<F, B>>>, bfcArb: fc.Arbitrary<Fn<[B], Type<F, C>>>) => {
  fc.assert(fc.property(fc.tuple(faArb, afbArb, bfcArb), ([fa, afb, bfc]) => {
    expect(
      F.chain(F.chain(fa, afb), bfc)
    ).toEqual(
      F.chain(fa, a => F.chain(afb(a), bfc))
    )
  }))
}
