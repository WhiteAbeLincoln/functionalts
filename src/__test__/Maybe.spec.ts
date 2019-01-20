import * as fc from 'fast-check'
import { just, nothing } from '../Maybe'
import * as M from '../Maybe'
import * as R from '../structures/register'
import { URI_Tag } from '../structures/HKT'
import * as Functor from '../structures/__test__/Functor.helper'
import * as Alt from '../structures/__test__/Alt.helper'
import * as Plus from '../structures/__test__/Plus.helper'
import * as Apply from '../structures/__test__/Apply.helper'
import * as Applicative from '../structures/__test__/Applicative.helper'
import * as Alternative from '../structures/__test__/Alternative.helper'
import * as Chain from '../structures/__test__/Chain.helper'
import * as Monad from '../structures/__test__/Monad.helper'
import * as Semigroup from '../structures/__test__/Semigroup.helper'
import * as Monoid from '../structures/__test__/Monoid.helper'
import * as Setoid from '../structures/__test__/Setoid.helper'
import * as Ord from '../structures/__test__/Ord.helper'
import { lt, gt, B, property, K } from '../util/functional'
import { isChain } from '../structures/Chain'
import { isMonad } from '../structures/Monad'
import { isAlternative } from '../structures/Alternative'
import { isApplicative } from '../structures/Applicative'
import { isPlus } from '../structures/Plus'
import { isApply } from '../structures/Apply'
import { isAlt } from '../structures/Alt'
import { isFunctor } from '../structures/Functor'
import { Predicate } from '../util/types'
import { isSemigroup, semigroupSum } from '../structures/Semigroup'
import { isMonoid, monoidSum } from '../structures/Monoid'
import {
  isSetoid, setoidNumber, setoidBoolean,
  setoidString, setoidSymbol
} from '../structures/Setoid'
import {
  isOrd, ordNumber, ordBoolean, ordString
} from '../structures/Ord'
// Note: Mocking fails when build directory exists
// make sure to clean before
jest.mock('../structures/register')

const justAribitrary = <A = any>(v: fc.Arbitrary<A> = fc.anything()) =>
  v.map(v => just(v))
const nothingArbitrary = () =>
  fc.constant(nothing)
const maybeArbitrary = <A = any>(v: fc.Arbitrary<A> = fc.anything()) =>
  fc.oneof(justAribitrary(v), nothingArbitrary())

;(R as jest.Mocked<typeof R>).isTypeclass.mockReturnValue(jest.requireActual('../structures/register').isTypeclass)

const registeredFine = (p: Predicate<any>) => {
  M.Register()
  expect((R as jest.Mocked<typeof R>).registerInstance).toHaveBeenCalled()
  const module = (R as jest.Mocked<typeof R>).registerInstance.mock.calls[0][0]
  expect(p(module)).toBe(true)
}

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
        registeredFine(isFunctor)
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
        registeredFine(isAlt)
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
        registeredFine(isPlus)
      })
    })
    describe('Apply', () => {
      it('fulfills the Composition law', () => {
        const strLen = (x: string) => x.length
        Apply.Composition1<typeof M['URI'], string, number, boolean>(
          M,
          fc.constant(M.of(strLen)),
          maybeArbitrary(fc.nat().map(gt)),
          maybeArbitrary(fc.string())
        )
      })
      it('properly registers itself for use by the apply module', () => {
        registeredFine(isApply)
      })
    })
    describe('Applicative', () => {
      it('fulfills the Identity law', () => {
        Applicative.Identity1(M, maybeArbitrary())
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
        registeredFine(isApplicative)
      })
    })
    describe('Alternative', () => {
      it('fulfills the Distributivity law', () => {
        const fn = fc.oneof(fc.integer().map(gt), fc.integer().map(lt))
        Alternative.Distributivity1<typeof M.URI, number, boolean>(M, maybeArbitrary(fc.integer()), maybeArbitrary(fn))
      })
      it('fulfills the Annihiliation law', () => {
        Alternative.Annihilation1(M, maybeArbitrary())
      })
      it('properly registers itself for use by the alternative module', () => {
        registeredFine(isAlternative)
      })
    })
    describe('Chain', () => {
      it('fulfills the Associativity law', () => {
        const includes = (x: string) => (y: string) => x.includes(y)
        Chain.Associativity1(
          M,
          maybeArbitrary(fc.string()),
          // this really isn't necessary to test the law, but its kind of boring
          // to just pass in a constant

          // tests if a given string contains a character and that strings length is greater than some number
          fc.char().map(c => M.fromPredicate(includes(c))),
          fc.nat().map(n => M.fromPredicate(B(gt(n))(property<string, 'length'>('length'))))
        )
      })
      it('properly registers itself for use by the chain module', () => {
        registeredFine(isChain)
      })
    })
    describe('Monad', () => {
      it('fulfills the Left Identity law', () => {
        const isEven = (x: number) => x % 2 === 0
        Monad.LeftIdentity1(
          M, fc.integer(), M.fromPredicate(isEven)
        )
      })
      it('fulfills the Right Identity law', () => {
        Monad.RightIdentity1(
          M, maybeArbitrary(fc.integer())
        )
      })
      it('properly registers itself for use by the monad module', () => {
        registeredFine(isMonad)
      })
    })
    describe('Semigroup', () => {
      it('fulfills the Associativity law', () => {
        Semigroup.Assoiciativity(M, maybeArbitrary())
      })
      it('properly registers itself for use by the semigroup module', () => {
        registeredFine(isSemigroup)
      })
      describe('getApplySemigroup', () => {
        it('fulfills the Associativity law', () => {
          Semigroup.Assoiciativity(M.getApplySemigroup(semigroupSum), maybeArbitrary(fc.integer()))
        })
        it('concats the inner value if both maybes are justs', () => {
          const concat = jest.fn()
          const S = M.getApplySemigroup({ concat })

          S.concat(M.just(1), M.just(2))
          S.concat(nothing, M.just(2))
          S.concat(M.just(1), nothing)
          S.concat(nothing, nothing)

          expect(concat).toHaveBeenCalledTimes(1)
          expect(concat).toHaveBeenCalledWith(1, 2)
        })
      })
    })
    describe('Monoid', () => {
      it('fulfills the Left Identity law', () => {
        Monoid.LeftIdentity(M, maybeArbitrary())
      })
      it('fulfills the Right Identity law', () => {
        Monoid.RightIdentity(M, maybeArbitrary())
      })
      it('properly registers itself for use by the monoid module', () => {
        registeredFine(isMonoid)
      })
      describe('getApplyMonoid', () => {
        it('fulfills the Left Identity law', () => {
          Monoid.LeftIdentity(M.getApplyMonoid(monoidSum), maybeArbitrary(fc.integer()))
        })
        it('fulfills the Right Identity law', () => {
          Monoid.RightIdentity(M.getApplyMonoid(monoidSum), maybeArbitrary(fc.integer()))
        })
        it('returns a monoid (Monoid m => Monoid Maybe m) where empty is Just(m.empty)', () => {
          expect(M.getApplyMonoid(monoidSum).empty).toEqual(just(monoidSum.empty))
        })
      })
    })
    describe('Setoid', () => {
      it('fulfills the Reflexivity law', () => {
        // we have to use values that are registered as Setoid types
        // since the default maybe equals does not take a Setoid but dispatches to find one
        Setoid.Reflexivity(M, fc.oneof<any>(maybeArbitrary(fc.integer()), maybeArbitrary(fc.string()), maybeArbitrary(fc.boolean())))
      })
      it('fulfills the Symmetry law', () => {
        // we pass in an array instead of doing oneof because oneof may generate comparisons of Maybe<A> vs Maybe<B> when used in fc.tuple
        Setoid.Symmetry(M, [maybeArbitrary(fc.integer()), maybeArbitrary(fc.string()), maybeArbitrary(fc.boolean())] as any[])
      })
      it('fulfills the Transitivity law', () => {
        Setoid.Transitivity(M, [maybeArbitrary(fc.integer()), maybeArbitrary(fc.string()), maybeArbitrary(fc.boolean())] as any[])
      })
      it('properly registers itself for use by the setoid module', () => {
        registeredFine(isSetoid)
      })
      describe('getSetoid', () => {
        it('fulfills the Reflexivity law', () => {
          const S = M.getSetoid(setoidNumber)
          Setoid.Reflexivity(S, maybeArbitrary(fc.integer()))
        })
        it('fulfills the Symmetry law', () => {
          const S = M.getSetoid(setoidBoolean)
          Setoid.Symmetry(S, [maybeArbitrary(fc.boolean())])
        })
        it('fulfills the Transitivity law', () => {
          const S = M.getSetoid(M.getSetoid(setoidString))
          Setoid.Transitivity(S, [maybeArbitrary(maybeArbitrary(fc.string()))])
        })
      })
      describe('equals', () => {
        it('allows passing in a Setoid typerep', () => {
          const s = M.equals(setoidSymbol)
          expect(typeof s).toBe('function')
          expect(s(just(Symbol('hi')), just(Symbol('hey')))).toBe(false)
          expect(s(just(Symbol.iterator), just(Symbol.iterator))).toBe(true)
        })
      })
    })
    describe('Ord', () => {
      it('fulfills the Reflexivity law', () => {
        // we have to use values that are registered as Ord types
        // since the default maybe compare does not take a Ord but dispatches to find one
        Ord.Reflexivity(M, fc.oneof<any>(maybeArbitrary(fc.integer()), maybeArbitrary(fc.string()), maybeArbitrary(fc.boolean())))
      })
      it('fulfills the Antisymmetry law', () => {
        // we pass in an array instead of doing oneof because oneof may generate comparisons of Maybe<A> vs Maybe<B> when used in fc.tuple
        Ord.Antisymmetry(M, [maybeArbitrary(fc.integer()), maybeArbitrary(fc.string()), maybeArbitrary(fc.boolean())] as any[])
      })
      it('fulfills the Transitivity law', () => {
        Ord.Transitivity(M, [maybeArbitrary(fc.integer()), maybeArbitrary(fc.string()), maybeArbitrary(fc.boolean())] as any[])
      })
      it('properly registers itself for use by the ord module', () => {
        registeredFine(isOrd)
      })
      describe('getOrd', () => {
        it('fulfills the Reflexivity law', () => {
          const O = M.getOrd(ordNumber)
          Ord.Reflexivity(O, maybeArbitrary(fc.integer()))
        })
        it('fulfills the Antisymmetry law', () => {
          const O = M.getOrd(ordBoolean)
          Ord.Antisymmetry(O, [maybeArbitrary(fc.boolean())])
        })
        it('fulfills the Transitivity law', () => {
          const O = M.getOrd(M.getOrd(ordString))
          Ord.Transitivity(O, [maybeArbitrary(maybeArbitrary(fc.string()))])
        })
      })
      describe('compare', () => {
        it('allows passing in an Ord typerep', () => {
          const s = M.compare(ordNumber)
          expect(typeof s).toBe('function')
          expect(s(just(1), just(2))).toBe(-1)
        })
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
  describe('useful functions', () => {
    describe('fromPredicate', () => {
      it('returns a function which returns nothing if the predicate fails', () => {
        expect(M.fromPredicate(K(false))('hi')).toEqual(nothing)
      })
      it('returns a function which returns just the given value if the predicate passes', () => {
        expect(M.fromPredicate(K(true))('hi')).toEqual(just('hi'))
      })
    })
    describe('tryCatch', () => {
      it('returns just(return value) if the function does not throw', () => {
        expect(M.tryCatch(() => 'hi')).toEqual(just('hi'))
      })
      it('returns nothing if the function throws', () => {
        expect(M.tryCatch(() => { throw '' })).toEqual(nothing)
      })
    })
    describe('fromNullable', () => {
      it('returns nothing if the value is nullable, just(value) otherwise', () => {
        expect(M.fromNullable(undefined)).toEqual(nothing)
        expect(M.fromNullable(null)).toEqual(nothing)
        fc.assert(fc.property(fc.anything().filter(v => v !== null && v !== undefined), a => {
          expect(M.fromNullable(a)).toEqual(just(a))
        }))
      })
    })
  })
})
