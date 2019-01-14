import * as fc from 'fast-check'
import { just, nothing } from './Maybe'
import * as M from './Maybe'
import * as R from './structures/register'
import { URI_Tag } from './structures/HKT'
import * as Functor from './structures/Functor.helper'
import * as Alt from './structures/Alt.helper'
import * as Plus from './structures/Plus.helper'
import * as Apply from './structures/Apply.helper'
import * as Applicative from './structures/Applicative.helper'
// Note: Mocking fails when build directory exists
// make sure to clean before
jest.mock('./structures/register')

const justAribitrary = <A = any>(v: fc.Arbitrary<A> = fc.anything()) =>
  v.map(v => just(v))
const nothingArbitrary = () =>
  fc.constant(nothing)
const maybeArbitrary = <A = any>(v: fc.Arbitrary<A> = fc.anything()) =>
  fc.oneof(justAribitrary(v), nothingArbitrary())

describe('Maybe', () => {
  describe('Typeclasses', () => {
    describe('Functor', () => {
      it('fulfills the Identity law', () => {
        Functor.Identity1(M, maybeArbitrary())
      })
      it('fulfills the Composition law', () => {
        Functor.Composition1(M, maybeArbitrary(fc.integer(Number.MAX_SAFE_INTEGER)))
      })
      it('properly registers itself for use by the functor module', () => {
        M.Register()
        expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
        // every call should do the same thing, so no need to check anything other than the first
        expect((R as jest.Mocked<typeof R>).registerInstance.mock.calls[0]).toMatchObject(
          [{ URI: M.URI, map: M.map }]
        )
      })
    })
    describe('Alt', () => {
      it('fulfills the Associativity law', () => {
        Alt.Associativity1(M, maybeArbitrary())
      })
      it('fulfills the Distributivity law', () => {
        Alt.Distributivity1(M, maybeArbitrary())
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
        Plus.LeftIdentity1(M, maybeArbitrary())
      })
      it('fulfills the Right Identity law', () => {
        Plus.RightIdentity1(M, maybeArbitrary())
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
        const gt = (x: number) => (y: number) => x > y
        Apply.Composition1<typeof M['URI'], string, number, boolean>(
          M,
          fc.constant(M.of(strLen)),
          maybeArbitrary(fc.nat().map(gt)),
          maybeArbitrary(fc.string())
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
        Applicative.Identity1(M, maybeArbitrary())
      })
      it('fulfills the Homomorphism law', () => {
        const gt = (x: number) => (y: number) => x > y
        const funcarb = fc.integer().map(gt)
        Applicative.Homomorphism1(M, funcarb, fc.integer())
      })
      it('fulfills the Interchange law', () => {
        const gt = (x: number) => (y: number) => x > y
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
  })
  describe('Constructors', () => {
    describe('just', () => {
      // this is all we want to test
      // anything else is left to implementation and free functions (discriminating between just & nothing, storing value for just)
      it('creates an object with the [URI_Tag] property set to the Maybe URI', () => {
        const x = just('4')
        expect(x[URI_Tag]).toEqual(M.URI)
      })
    })
    describe('nothing', () => {
      // this is all we want to test
      // anything else is left to implementation and free functions (discriminating between just & nothing, storing value for just)
      it('creates an object with the [URI_Tag] property set to the Maybe URI', () => {
        const x = nothing
        expect(x[URI_Tag]).toEqual(M.URI)
      })
      it('creates an object with a value property storing the value', () => {
        fc.assert(fc.property(fc.anything(), a => {
          expect((just(a) as M.Just<any>).value).toEqual(a)
        }))
      })
    })

  })
  describe('discriminator functions', () => {
    describe('isJust', () => {
      it('returns true when given a just', () => {
        fc.assert(fc.property(justAribitrary(), m => M.isJust(m)))
      })
      it('returns false when given a nothing', () => {
        expect(M.isJust(nothing)).toBe(false)
      })
    })
    describe('isNothing', () => {
      it('returns false when given a just', () => {
        fc.assert(fc.property(justAribitrary(), m => !M.isNothing(m)))
      })
      it('returns true when given a nothing', () => {
        expect(M.isNothing(nothing)).toBe(true)
      })
    })
  })
})
