import * as R from '../structures/register'
import { getTypeclass } from './util'
import { URI_Tag } from '../structures/HKT'
jest.mock('../structures/register')

describe('getTypeclass', () => {
  it('throws if an instance is not registered', () => {
    ;(R as jest.Mocked<typeof R>).getInstance.mockReturnValue(undefined)
    expect(
      () => getTypeclass(
        (_: any): _ is any => true, 'hi'
      )(
        { [URI_Tag]: 'asdkjflaksd' } as any
      )
    ).toThrowError('is not registered')
  })
  it('throws if the refinement predicate fails', () => {
    ;(R as jest.Mocked<typeof R>).getInstance.mockReturnValue({ URI: 'HI' })
    expect(
      () => getTypeclass(
        (_: any): _ is any => false, 'hi'
      )(
        { [URI_Tag]: 'HI' } as any
      )
    ).toThrowError('is registered, but doesn\'t comply')
  })
  it('returns the found instance if all checks pass', () => {
    const instance = { URI: 'HI' }
    ;(R as jest.Mocked<typeof R>).getInstance.mockReturnValue(instance)
    expect(
      getTypeclass(
        (_: any): _ is any => true, 'hi'
      )(
        { [URI_Tag]: 'HI' } as any
      )
    ).toBe(instance)
  })
})
