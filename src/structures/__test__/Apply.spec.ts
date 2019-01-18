import * as A from '../Apply'
import { URI_Tag } from '../HKT'

describe('Apply', () => {
  it('exports ap and apC functions which call the specific ap for the type', () => {
    const ap = jest.fn()
    const URI = 'TAG'
    const spy = jest.spyOn(A, 'getApply')
    spy.mockReturnValue({ URI, ap })
    const fa = { [URI_Tag]: URI } as any
    A.ap(fa, fa)
    A.apC(fa)(fa)
    expect(ap).toHaveBeenCalledTimes(2)
    expect(ap).toHaveBeenCalledWith(fa, fa)

    spy.mockRestore()
  })

  it('throws if a Apply instance is not registered for the HKT', () => {
    const fa = { [URI_Tag]: 'asdf' } as any
    expect(() => A.ap(fa, fa)).toThrow()
  })
})
