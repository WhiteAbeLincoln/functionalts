import * as fc from 'fast-check'
import * as M from '../Array'
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
import { lt, gt } from '../util/functional'
import { isChain } from '../structures/Chain'
import { isMonad } from '../structures/Monad'
import { isFunctor } from '../structures/Functor'
import { isAlt } from '../structures/Alt'
import { Predicate } from '../util/types'
import { isPlus } from '../structures/Plus'
import { isApply } from '../structures/Apply'
import { isApplicative } from '../structures/Applicative'
import { isAlternative } from '../structures/Alternative'
import { isSemigroup } from '../structures/Semigroup'
import { isMonoid } from '../structures/Monoid'
import { isSetoid } from '../structures/Setoid'
import { isOrd } from '../structures/Ord'
jest.mock('../structures/register')

const arrayArbitrary = <A = any>(v: fc.Arbitrary<A> = fc.anything()) => fc.array(v)

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
        Functor.Identity1(M, arrayArbitrary())
      })
      it('fulfills the Composition law', () => {
        Functor.Composition1(M, arrayArbitrary(fc.integer(Number.MAX_SAFE_INTEGER)))
      })
      it('Modifies the Array prototype when registering', () => {
        M.Register()
        expect(Array.prototype[URI_Tag as any]).toEqual(M.URI)
      })
      it('properly registers itself for use by the functor module', () => {
        registeredFine(isFunctor)
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
        registeredFine(isAlt)
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
        registeredFine(isPlus)
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
      it('properly registers itself for use by the apply module', () => {
        registeredFine(isApply)
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
        registeredFine(isApplicative)
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
      it('properly registers itself for use by the alternative module', () => {
        registeredFine(isAlternative)
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
        registeredFine(isChain)
      })
    })
    describe('Monad', () => {
      it('fulfills the Left Identity law', () => {
        Monad.LeftIdentity1(
          M, fc.string(), f => f.split('').map(v => v.charCodeAt(0))
        )
      })
      it('fulfills the Right Identity law', () => {
        Monad.RightIdentity1(
          M, arrayArbitrary(fc.string())
        )
      })
      it('properly registers itself for use by the monad module', () => {
        registeredFine(isMonad)
      })
    })
    describe('Semigroup', () => {
      it('fulfills the Associativity law', () => {
        Semigroup.Assoiciativity(M, arrayArbitrary())
      })
      it('properly registers itself for use by the semigroup module', () => {
        registeredFine(isSemigroup)
      })
    })
    describe('Monoid', () => {
      it('fulfills the Left Identity law', () => {
        Monoid.LeftIdentity(M, arrayArbitrary())
      })
      it('fulfills the Right Identity law', () => {
        Monoid.RightIdentity(M, arrayArbitrary())
      })
      it('properly registers itself for use by the monoid module', () => {
        registeredFine(isMonoid)
      })
    })
    describe('Setoid', () => {
      it('fulfills the Reflexivity law', () => {
        // we have to use values that are registered as Setoid types
        // since the default array equals does not take a Setoid but dispatches to find one
        Setoid.Reflexivity(M, fc.oneof<any>(arrayArbitrary(fc.integer()), arrayArbitrary(fc.string()), arrayArbitrary(fc.boolean())))
      })
      it('fulfills the Symmetry law', () => {
        // we pass in an array instead of doing oneof because oneof may generate comparisons of A[] vs B[] when used in fc.tuple
        Setoid.Symmetry(M, [arrayArbitrary(fc.integer()), arrayArbitrary(fc.string()), arrayArbitrary(fc.boolean())] as any[])
      })
      it('fulfills the Transitivity law', () => {
        Setoid.Transitivity(M, [arrayArbitrary(fc.integer()), arrayArbitrary(fc.string()), arrayArbitrary(fc.boolean())] as any[])
      })
      it('properly registers itself for use by the setoid module', () => {
        registeredFine(isSetoid)
      })
    })
    describe('Ord', () => {
      it('fulfills the Reflexivity law', () => {
        // we have to use values that are registered as Ord types
        // since the default array compare does not take a Ord but dispatches to find one
        Ord.Reflexivity(M, fc.oneof<any>(arrayArbitrary(fc.integer()), arrayArbitrary(fc.string()), arrayArbitrary(fc.boolean())))
      })
      it('fulfills the Antisymmetry law', () => {
        // we pass in an array instead of doing oneof because oneof may generate comparisons of A[] vs B[] when used in fc.tuple
        Ord.Antisymmetry(M, [arrayArbitrary(fc.integer()), arrayArbitrary(fc.string()), arrayArbitrary(fc.boolean())] as any[])
      })
      it('fulfills the Transitivity law', () => {
        Ord.Transitivity(M, [arrayArbitrary(fc.integer()), arrayArbitrary(fc.string()), arrayArbitrary(fc.boolean())] as any[])
      })
      it('properly registers itself for use by the ord module', () => {
        registeredFine(isOrd)
      })
    })
  })
})
