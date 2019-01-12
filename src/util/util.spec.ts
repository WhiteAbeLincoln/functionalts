import { createRegister } from './util'

describe('createRegister', () => {
  it('adds an all() method to the object, which calls all other functions on the object', () => {
    const test1 = jest.fn()
    const test2 = jest.fn()

    const obj = { test1, test2, notAFunction: 1 } as any
    createRegister(obj)
    expect(typeof obj['all']).toBe('function')
    obj['all']()
    expect(test1).toHaveBeenCalledTimes(1)
    expect(test2).toHaveBeenCalledTimes(1)
  })
})
