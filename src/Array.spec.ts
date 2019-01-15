import * as fc from 'fast-check'
import * as M from './Array'
import * as R from './structures/register'
import { URI_Tag } from './structures/HKT'
import * as Functor from './structures/Functor.helper'
import * as Alt from './structures/Alt.helper'
import * as Plus from './structures/Plus.helper'
import * as Apply from './structures/Apply.helper'
import * as Applicative from './structures/Applicative.helper'
import * as Alternative from './structures/Alternative.helper'
import * as Chain from './structures/Chain.helper'
import { lt, gt } from './util/functional'
jest.mock('./structures/register')

const arrayArbitrary = <A = any>(v: fc.Arbitrary<A> = fc.anything()) => fc.array(v)

describe('Maybe', () => {
  describe('Typeclasses', () => {
    describe('Functor', () => {
      it('fulfills the Identity law', () => {
        Functor.Identity1(M, arrayArbitrary())
      })
      it('fulfills the Composition law', () => {
        Functor.Composition1(M, arrayArbitrary(fc.integer(Number.MAX_SAFE_INTEGER)))
      })
      it('Modifies the Array prototype when registering', () => {
        M.Register()
        expect(Array.prototype[URI_Tag as any]).toEqual(M.URI)
      })
      it('Properly registers itself for use by the functor module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject([{ URI: M.URI, map: M.map }])
      })
    })
    describe('Alt', () => {
      it('fulfills the Associativity law', () => {
        Alt.Associativity1(M, arrayArbitrary())
      })
      it('fulfills the Distributivity law', () => {
        Alt.Distributivity1(M, arrayArbitrary())
      })
      it('properly registers itself for use by the alt module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        // every call should do the same thing, so no need to check anything other than the first
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map, alt: M.alt }]
        )
      })
    })
    describe('Plus', () => {
      it('fulfills the Left Identity law', () => {
        Plus.LeftIdentity1(M, arrayArbitrary())
      })
      it('fulfills the Right Identity law', () => {
        Plus.RightIdentity1(M, arrayArbitrary())
      })
      it('fulfills the Annihilation law', () => {
        Plus.Annihilation1(M)
      })
      it('properly registers itself for use by the plus module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map, alt: M.alt, zero: M.zero }]
        )
      })
    })
    describe('Apply', () => {
      it('fulfills the Composition law', () => {
        const strLen = (x: string) => x.length
        Apply.Composition1<typeof M['URI'], string, number, boolean>(
          M,
          fc.constant(M.of(strLen)),
          arrayArbitrary(fc.nat().map(gt)),
          arrayArbitrary(fc.string())
        )
      })
      it('properly registers itself for use by the plus module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map, alt: M.alt, zero: M.zero, ap: M.ap }]
        )
      })
    })
    describe('Applicative', () => {
      it('fulfills the Identity law', () => {
        Applicative.Identity1(M, arrayArbitrary())
      })
      it('fulfills the Homomorphism law', () => {
        const funcarb = fc.integer().map(gt)
        Applicative.Homomorphism1(M, funcarb, fc.integer())
      })
      it('fulfills the Interchange law', () => {
        const funcarb = fc.integer().map(gt)
        Applicative.Interchange1(M, funcarb, fc.integer())
      })
      it('properly registers itself for use by the applicative module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map, alt: M.alt, zero: M.zero, ap: M.ap, of: M.of }]
        )
      })
    })
    describe('Alternative', () => {
      it('fulfills the Distributivity law', () => {
        const fn = fc.oneof(fc.integer().map(gt), fc.integer().map(lt))
        Alternative.Distributivity1<typeof M.URI, number, boolean>(M, arrayArbitrary(fc.integer()), arrayArbitrary(fn))
      })
      it('fulfills the Annihiliation law', () => {
        Alternative.Annihilation1(M, arrayArbitrary())
      })
    })
    describe('Chain', () => {
      it('fulfills the Associativity law', () => {
        Chain.Associativity1(
          M,
          arrayArbitrary(fc.string()),
          // this really isn't necessary to test the law, but its kind of boring
          // to just pass in a constant
          fc.char().map(c => (x: string) => x.split(c)),
          fc.constant((x: string) => [x.length])
        )
      })
      it('properly registers itself for use by the chain module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map, ap: M.ap, chain: M.chain }]
        )
      })
    })
  })
})
