import * as F from '../Chain'
import { URI_Tag } from '../HKT'
import { id } from '../../util/functional'

describe('Chain', () => {
  it('exports chain and chainC functions which call the specific chain for the type', () => {
    const chain = jest.fn()
    const URI = 'TAG'
    const spy = jest.spyOn(F, 'getChain')
    spy.mockReturnValue({ URI, chain })

    const fa = { [URI_Tag]: URI } as any
    F.chain(fa, id)
    F.chainC(id as any)(fa)
    // checks if our generic curried version calls the regular map
    expect(chain).toHaveBeenCalledTimes(2)
    expect(chain).toHaveBeenCalledWith(fa, id)

    spy.mockRestore()
  })

  it('throws if a chain instance is not registered for the HKT', () => {
    expect(() => F.getChain({ [URI_Tag]: 'blahsdlf' } as any)).toThrow()
  })

  it('exports an isChain function which correctly determines if a module has a chain function', () => {
    const chain = jest.fn()
    // chain depends on apply, which depends on functor
    expect(F.isChain({ URI: 'HI', map: chain, chain, ap: chain }))
  })
})
