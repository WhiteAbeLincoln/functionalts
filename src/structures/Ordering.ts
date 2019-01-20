export type Ordering = -1 | 0 | 1

export const sign = (n: number): Ordering => n <= -1 ? -1 : n >= 1 ? 1 : 0

export const invert = (O: Ordering): Ordering => {
  switch (O) {
    case -1:
      return 1
    case 1:
      return -1
    case 0:
      return 0
  }
}
