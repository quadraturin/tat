export async function lerp (start:number, end:number, amt:number) {
    return (1 - amt) * start + amt * end
  }