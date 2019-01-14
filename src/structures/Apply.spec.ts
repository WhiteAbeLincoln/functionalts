import * as A from './Apply'
import { URI_Tag } from './HKT'
import * as R from './register'
jest.mock('./register')

describe('Apply', () => {
  it('exports ap and apC functions which call the specific ap for the type', () => {
    const ap = jest.fn()
    const URI = 'TAG'
    ;(R as jest.Mocked<typeof R>).getInstance.mockReturnValue(
      { URI, ap, map: ap }
    )

    const fa = { [URI_Tag]: URI } as any
    A.ap(fa, fa)
    A.apC(fa)(fa)
    // checks if our generic curried version calls the regular map
    expect(ap).toHaveBeenCalledTimes(2)
    expect(ap).toHaveBeenCalledWith(fa, fa)
  })

  it('throws if a Apply instance is not registered for the HKT', () => {
    const fa = { [URI_Tag]: 'asdf' } as any
    ;(R as jest.Mocked<typeof R>).getInstance.mockReset()
    expect(() => A.ap(fa, fa)).toThrow()
  })
})
