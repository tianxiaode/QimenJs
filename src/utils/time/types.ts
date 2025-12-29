export interface Repeater {
  cancel(): void
  isActive(): boolean
}

export interface Cancelable {
  cancel(): void
  isActive(): boolean
}
