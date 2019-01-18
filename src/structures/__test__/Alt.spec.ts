jest.mock('../register')
import * as A from '../Alt'
import { URI_Tag } from '../HKT'
import * as R from '../register'

describe('Alt', () => {
  it('exports alt and altC functions which call the specific alt for the type', () => {
    const alt = jest.fn()
    const URI = 'TAG'
    const spy = jest.spyOn(A, 'getAlt')
    spy.mockReturnValue({ URI, alt })
    const fa = { [URI_Tag]: URI } as any
    const fb = { [URI_Tag]: URI } as any
    A.alt(fa, fb)
    A.altC(fa)(fb)
    // checks if our generic curried version calls the regular map
    expect(alt).toHaveBeenCalledTimes(2)
    expect(alt).toHaveBeenCalledWith(fa, fb)

    spy.mockRestore()
  })

  it('throws if a functor instance is not registered for the HKT', () => {
    ;(R as jest.Mocked<typeof R>).getInstance.mockReset()
    expect(() => A.alt({ [URI_Tag]: 'blahsdlf' } as any, {})).toThrow()
  })
})
