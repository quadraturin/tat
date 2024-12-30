/**
 * lerp.
 * @param start the start number.
 * @param end the end number.
 * @param amt the amount to increment.
 * @returns the interpolation.
 */
export async function lerp (start:number, end:number, amt:number) {
    return (1 - amt) * start + amt * end
  }
  