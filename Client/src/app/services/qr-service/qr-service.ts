import { Injectable } from '@angular/core';

/**
 * Minimal, dependency-free QR Code generator (ISO/IEC 18004).
 *
 * Only what a URL shortener actually needs: byte-mode encoding, versions 1-10,
 * and error-correction level M. That covers links well past any sane short-URL
 * length, and it keeps the bundle free of an extra npm dependency.
 *
 * Output is an SVG string so the code stays crisp at any size and prints well.
 */
@Injectable({ providedIn: 'root' })
export class QrService {
  /** Galois field log/antilog tables for Reed-Solomon over GF(256). */
  private static readonly EXP = new Uint8Array(512);
  private static readonly LOG = new Uint8Array(256);

  /** Total codewords and EC codewords-per-block for level M, versions 1-10. */
  private static readonly VERSION_SPECS: ReadonlyArray<{
    totalCodewords: number;
    ecPerBlock: number;
    group1Blocks: number;
    group1Codewords: number;
    group2Blocks: number;
    group2Codewords: number;
  }> = [
    { totalCodewords: 26, ecPerBlock: 10, group1Blocks: 1, group1Codewords: 16, group2Blocks: 0, group2Codewords: 0 },
    { totalCodewords: 44, ecPerBlock: 16, group1Blocks: 1, group1Codewords: 28, group2Blocks: 0, group2Codewords: 0 },
    { totalCodewords: 70, ecPerBlock: 26, group1Blocks: 1, group1Codewords: 44, group2Blocks: 0, group2Codewords: 0 },
    { totalCodewords: 100, ecPerBlock: 18, group1Blocks: 2, group1Codewords: 32, group2Blocks: 0, group2Codewords: 0 },
    { totalCodewords: 134, ecPerBlock: 24, group1Blocks: 2, group1Codewords: 43, group2Blocks: 0, group2Codewords: 0 },
    { totalCodewords: 172, ecPerBlock: 16, group1Blocks: 4, group1Codewords: 27, group2Blocks: 0, group2Codewords: 0 },
    { totalCodewords: 196, ecPerBlock: 18, group1Blocks: 4, group1Codewords: 31, group2Blocks: 0, group2Codewords: 0 },
    { totalCodewords: 242, ecPerBlock: 22, group1Blocks: 2, group1Codewords: 38, group2Blocks: 2, group2Codewords: 39 },
    { totalCodewords: 292, ecPerBlock: 22, group1Blocks: 3, group1Codewords: 36, group2Blocks: 2, group2Codewords: 37 },
    { totalCodewords: 346, ecPerBlock: 26, group1Blocks: 4, group1Codewords: 43, group2Blocks: 1, group2Codewords: 44 },
  ];

  /** Alignment-pattern centre coordinates per version (index = version - 1). */
  private static readonly ALIGNMENT_CENTERS: ReadonlyArray<number[]> = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
  ];

  /** Pre-computed BCH format strings for EC level M, masks 0-7. */
  private static readonly FORMAT_BITS: ReadonlyArray<number> = [
    0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0,
  ];

  static {
    // Build GF(256) tables with the QR primitive polynomial 0x11d.
    let x = 1;
    for (let i = 0; i < 255; i++) {
      QrService.EXP[i] = x;
      QrService.LOG[x] = i;
      x <<= 1;
      if (x & 0x100) {
        x ^= 0x11d;
      }
    }
    for (let i = 255; i < 512; i++) {
      QrService.EXP[i] = QrService.EXP[i - 255];
    }
  }

  /**
   * Renders `text` as an SVG QR code.
   *
   * @param size rendered width/height in CSS pixels.
   * @param dark  module colour.
   * @param light background colour; pass 'transparent' to omit the backdrop.
   */
  toSvg(text: string, size = 220, dark = '#000000', light = '#ffffff'): string {
    const matrix = this.buildMatrix(text);
    const count = matrix.length;
    const quiet = 4;
    const total = count + quiet * 2;

    // One path for every dark module keeps the SVG small and sharp.
    let path = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (matrix[row][col]) {
          path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
        }
      }
    }

    const background =
      light === 'transparent' ? '' : `<rect width="${total}" height="${total}" fill="${light}"/>`;

    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
      `viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges" role="img" ` +
      `aria-label="QR code">${background}<path d="${path}" fill="${dark}"/></svg>`
    );
  }

  /** SVG as a data URI, ready for an `<img src>` or a download link. */
  toDataUri(text: string, size = 220, dark = '#000000', light = '#ffffff'): string {
    const svg = this.toSvg(text, size, dark, light);
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // ---------------------------------------------------------------- internals

  private buildMatrix(text: string): boolean[][] {
    const data = new TextEncoder().encode(text);
    const version = this.pickVersion(data.length);
    const spec = QrService.VERSION_SPECS[version - 1];

    const bits = this.encodeData(data, version, spec);
    const codewords = this.interleave(bits, spec);

    const size = 17 + version * 4;
    const modules: (boolean | null)[][] = Array.from({ length: size }, () =>
      new Array<boolean | null>(size).fill(null),
    );

    this.drawFunctionPatterns(modules, version, size);
    this.drawCodewords(modules, codewords, size);

    // Pick the mask that scores best under the standard penalty rules.
    let bestMask = 0;
    let bestPenalty = Number.POSITIVE_INFINITY;
    let bestMatrix: boolean[][] = [];

    for (let mask = 0; mask < 8; mask++) {
      const candidate = this.applyMask(modules, mask, version, size);
      const penalty = this.penalty(candidate);
      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        bestMask = mask;
        bestMatrix = candidate;
      }
    }

    void bestMask;
    return bestMatrix;
  }

  private pickVersion(byteLength: number): number {
    for (let version = 1; version <= QrService.VERSION_SPECS.length; version++) {
      const spec = QrService.VERSION_SPECS[version - 1];
      const dataCodewords =
        spec.group1Blocks * spec.group1Codewords + spec.group2Blocks * spec.group2Codewords;
      const lengthBits = version < 10 ? 8 : 16;
      const capacity = Math.floor((dataCodewords * 8 - 4 - lengthBits) / 8);

      if (byteLength <= capacity) {
        return version;
      }
    }

    throw new Error('Content too long for a version-10 QR code');
  }

  private encodeData(
    data: Uint8Array,
    version: number,
    spec: (typeof QrService.VERSION_SPECS)[number],
  ): Uint8Array {
    const dataCodewords =
      spec.group1Blocks * spec.group1Codewords + spec.group2Blocks * spec.group2Codewords;

    const bits: number[] = [];
    const push = (value: number, length: number) => {
      for (let i = length - 1; i >= 0; i--) {
        bits.push((value >>> i) & 1);
      }
    };

    push(0b0100, 4); // byte mode
    push(data.length, version < 10 ? 8 : 16);
    for (const byte of data) {
      push(byte, 8);
    }

    // Terminator, then pad to a byte boundary.
    const capacityBits = dataCodewords * 8;
    for (let i = 0; i < 4 && bits.length < capacityBits; i++) {
      bits.push(0);
    }
    while (bits.length % 8 !== 0) {
      bits.push(0);
    }

    const bytes = new Uint8Array(dataCodewords);
    for (let i = 0; i < bits.length; i += 8) {
      let byte = 0;
      for (let b = 0; b < 8; b++) {
        byte = (byte << 1) | bits[i + b];
      }
      bytes[i / 8] = byte;
    }

    // Alternating pad codewords fill any remaining space.
    const padBytes = [0xec, 0x11];
    for (let i = bits.length / 8, p = 0; i < dataCodewords; i++, p++) {
      bytes[i] = padBytes[p % 2];
    }

    return bytes;
  }

  private interleave(
    data: Uint8Array,
    spec: (typeof QrService.VERSION_SPECS)[number],
  ): Uint8Array {
    const blocks: Uint8Array[] = [];
    const ecBlocks: Uint8Array[] = [];

    let offset = 0;
    const readBlock = (length: number) => {
      const block = data.slice(offset, offset + length);
      offset += length;
      blocks.push(block);
      ecBlocks.push(this.reedSolomon(block, spec.ecPerBlock));
    };

    for (let i = 0; i < spec.group1Blocks; i++) {
      readBlock(spec.group1Codewords);
    }
    for (let i = 0; i < spec.group2Blocks; i++) {
      readBlock(spec.group2Codewords);
    }

    const result: number[] = [];

    const maxData = Math.max(spec.group1Codewords, spec.group2Codewords);
    for (let i = 0; i < maxData; i++) {
      for (const block of blocks) {
        if (i < block.length) {
          result.push(block[i]);
        }
      }
    }

    for (let i = 0; i < spec.ecPerBlock; i++) {
      for (const block of ecBlocks) {
        result.push(block[i]);
      }
    }

    return Uint8Array.from(result);
  }

  private reedSolomon(data: Uint8Array, ecLength: number): Uint8Array {
    // Generator polynomial for the requested number of EC codewords.
    let generator = [1];
    for (let i = 0; i < ecLength; i++) {
      const next = new Array<number>(generator.length + 1).fill(0);
      for (let j = 0; j < generator.length; j++) {
        next[j] ^= generator[j];
        next[j + 1] ^= this.gfMul(generator[j], QrService.EXP[i]);
      }
      generator = next;
    }

    const remainder = new Uint8Array(ecLength);
    for (const byte of data) {
      const factor = byte ^ remainder[0];
      remainder.copyWithin(0, 1);
      remainder[ecLength - 1] = 0;
      for (let i = 0; i < ecLength; i++) {
        remainder[i] ^= this.gfMul(generator[i + 1], factor);
      }
    }

    return remainder;
  }

  private gfMul(a: number, b: number): number {
    if (a === 0 || b === 0) {
      return 0;
    }
    return QrService.EXP[QrService.LOG[a] + QrService.LOG[b]];
  }

  private drawFunctionPatterns(
    modules: (boolean | null)[][],
    version: number,
    size: number,
  ): void {
    const setFinder = (row: number, col: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = row + r;
          const cc = col + c;
          if (rr < 0 || rr >= size || cc < 0 || cc >= size) {
            continue;
          }
          const outer = r === 0 || r === 6 || c === 0 || c === 6;
          const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          modules[rr][cc] = outer || inner;
        }
      }
    };

    setFinder(0, 0);
    setFinder(0, size - 7);
    setFinder(size - 7, 0);

    // Timing patterns.
    for (let i = 8; i < size - 8; i++) {
      const on = i % 2 === 0;
      modules[6][i] = on;
      modules[i][6] = on;
    }

    // Alignment patterns, skipping the finder corners.
    const centers = QrService.ALIGNMENT_CENTERS[version - 1];
    for (const row of centers) {
      for (const col of centers) {
        const nearFinder =
          (row <= 8 && col <= 8) || (row <= 8 && col >= size - 9) || (row >= size - 9 && col <= 8);
        if (nearFinder) {
          continue;
        }
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            modules[row + r][col + c] = Math.max(Math.abs(r), Math.abs(c)) !== 1;
          }
        }
      }
    }

    // Dark module — always set, always reserved.
    modules[size - 8][8] = true;

    // Reserve the format-information strips.
    for (let i = 0; i < 9; i++) {
      if (modules[8][i] === null) {
        modules[8][i] = false;
      }
      if (modules[i][8] === null) {
        modules[i][8] = false;
      }
    }
    for (let i = 0; i < 8; i++) {
      if (modules[8][size - 1 - i] === null) {
        modules[8][size - 1 - i] = false;
      }
      if (modules[size - 1 - i][8] === null) {
        modules[size - 1 - i][8] = false;
      }
    }
  }

  private drawCodewords(
    modules: (boolean | null)[][],
    codewords: Uint8Array,
    size: number,
  ): void {
    let bitIndex = 0;
    let upward = true;

    for (let right = size - 1; right >= 1; right -= 2) {
      // Column 6 is the vertical timing pattern and is skipped entirely.
      if (right === 6) {
        right = 5;
      }

      for (let step = 0; step < size; step++) {
        const row = upward ? size - 1 - step : step;

        for (let c = 0; c < 2; c++) {
          const col = right - c;
          if (modules[row][col] !== null) {
            continue;
          }

          const byte = codewords[bitIndex >>> 3];
          const bit = byte === undefined ? 0 : (byte >>> (7 - (bitIndex & 7))) & 1;
          modules[row][col] = bit === 1;
          bitIndex++;
        }
      }

      upward = !upward;
    }
  }

  private applyMask(
    modules: (boolean | null)[][],
    mask: number,
    version: number,
    size: number,
  ): boolean[][] {
    // Rebuild the reserved map so masking only touches data modules.
    const reserved: boolean[][] = Array.from({ length: size }, () =>
      new Array<boolean>(size).fill(false),
    );
    const reservedTemplate: (boolean | null)[][] = Array.from({ length: size }, () =>
      new Array<boolean | null>(size).fill(null),
    );
    this.drawFunctionPatterns(reservedTemplate, version, size);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        reserved[r][c] = reservedTemplate[r][c] !== null;
      }
    }

    const result: boolean[][] = modules.map((row) => row.map((cell) => cell === true));

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (reserved[r][c]) {
          continue;
        }
        if (this.maskCondition(mask, r, c)) {
          result[r][c] = !result[r][c];
        }
      }
    }

    this.drawFormatInfo(result, mask, size);
    return result;
  }

  private maskCondition(mask: number, row: number, col: number): boolean {
    switch (mask) {
      case 0:
        return (row + col) % 2 === 0;
      case 1:
        return row % 2 === 0;
      case 2:
        return col % 3 === 0;
      case 3:
        return (row + col) % 3 === 0;
      case 4:
        return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
      case 5:
        return ((row * col) % 2) + ((row * col) % 3) === 0;
      case 6:
        return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
      default:
        return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    }
  }

  private drawFormatInfo(matrix: boolean[][], mask: number, size: number): void {
    const bits = QrService.FORMAT_BITS[mask];

    for (let i = 0; i < 15; i++) {
      const on = ((bits >>> i) & 1) === 1;

      // Copy around the top-left finder.
      if (i < 6) {
        matrix[8][i] = on;
      } else if (i === 6) {
        matrix[8][7] = on;
      } else if (i === 7) {
        matrix[8][8] = on;
      } else if (i === 8) {
        matrix[7][8] = on;
      } else {
        matrix[14 - i][8] = on;
      }

      // Mirrored copy across the other two finders.
      if (i < 8) {
        matrix[size - 1 - i][8] = on;
      } else {
        matrix[8][size - 15 + i] = on;
      }
    }

    matrix[size - 8][8] = true;
  }

  private penalty(matrix: boolean[][]): number {
    const size = matrix.length;
    let score = 0;

    // Rule 1 — runs of five or more same-coloured modules.
    for (let r = 0; r < size; r++) {
      for (const horizontal of [true, false]) {
        let run = 1;
        for (let i = 1; i < size; i++) {
          const prev = horizontal ? matrix[r][i - 1] : matrix[i - 1][r];
          const curr = horizontal ? matrix[r][i] : matrix[i][r];
          if (prev === curr) {
            run++;
          } else {
            if (run >= 5) {
              score += run - 2;
            }
            run = 1;
          }
        }
        if (run >= 5) {
          score += run - 2;
        }
      }
    }

    // Rule 2 — 2x2 blocks of one colour.
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        const v = matrix[r][c];
        if (v === matrix[r][c + 1] && v === matrix[r + 1][c] && v === matrix[r + 1][c + 1]) {
          score += 3;
        }
      }
    }

    // Rule 3 — finder-like 1:1:3:1:1 patterns.
    const pattern = [true, false, true, true, true, false, true];
    const matches = (get: (i: number) => boolean, start: number) =>
      pattern.every((expected, offset) => get(start + offset) === expected);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c <= size - 7; c++) {
        if (matches((i) => matrix[r][i], c)) {
          score += 40;
        }
        if (matches((i) => matrix[i][r], c)) {
          score += 40;
        }
      }
    }

    // Rule 4 — deviation from an even balance of dark and light.
    let dark = 0;
    for (const row of matrix) {
      for (const cell of row) {
        if (cell) {
          dark++;
        }
      }
    }
    const ratio = (dark * 100) / (size * size);
    score += Math.floor(Math.abs(ratio - 50) / 5) * 10;

    return score;
  }
}
