import { registerInstance, getInstance } from '../register'
import { Functor1 } from '../Functor'

describe('register', () => {
  it('throws early if the module being registered does not have the URI property', () => {
    expect(() => registerInstance({ map: jest.fn() } as any)).toThrow()
  })

  const properModule = { URI: 'URI', map: jest.fn } as unknown as Functor1<any>

  it('Allows registration using the registerInstance function', () => {
    expect(() => registerInstance(properModule)).not.toThrow()
  })

  it('allows getting a module with the getInstance function', () => {
    expect(getInstance(properModule.URI)).toEqual(properModule)
  })
})
