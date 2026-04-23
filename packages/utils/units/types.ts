
export type LengthUnit = "px" | "em" | "rem" | "%" | "vw" | "vh"

export interface LengthContext {
  rootFontSize: number      // rem
  fontSize: number          // em
  viewportWidth: number     // vw
  viewportHeight: number    // vh
  percentBase?: number      // %
}