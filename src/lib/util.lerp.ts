/**
 * Lerp.
 * @param v0 The start number.
 * @param v1 The end number.
 * @param t The amount to increment (0 - 1).
 * @returns The interpolation.
 */
export function lerp (v0:number, v1:number, t:number) {
    return (1 - t) * v0 + t * v1
  }
  