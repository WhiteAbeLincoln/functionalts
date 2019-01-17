export interface Semigroup<A> {
  readonly concat: (x: A, y: A) => A
}

export const semigroupAll: Semigroup<boolean> = { concat: (x, y) => x && y }
export const semigroupAny: Semigroup<boolean> = { concat: (x, y) => x || y }
export const semigroupSum: Semigroup<number> = { concat: (x, y) => x + y }
export const semigroupProduct: Semigroup<number> = { concat: (x, y) => x * y }
export const semigroupString: Semigroup<string> = { concat: (x, y) => x + y }
export const semigroupVoid: Semigroup<void> = { concat: () => undefined }
