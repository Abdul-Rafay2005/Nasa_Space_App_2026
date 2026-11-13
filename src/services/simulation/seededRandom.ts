/**
 * Aegis Health — Seeded Pseudorandom Number Generator
 * Compliant with PLAN.md Section 7.2
 */

export class SeededRandom {
  private seed: number;

  constructor(seed: number = 2026) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  /**
   * Generates a float in range [0, 1)
   */
  public next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * Generates a float in range [min, max]
   */
  public nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates zero-centered Gaussian-like noise via Box-Muller transform
   */
  public nextGaussian(mean: number = 0, stdDev: number = 1): number {
    const u1 = Math.max(1e-7, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}
