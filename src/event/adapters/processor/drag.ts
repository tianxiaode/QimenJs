import { GestureEventDescriptor, GestureSemantic } from "../semantic-map";
import { GestureProcessor } from "./base";
import { GestureEmit, GestureInput } from "./types";

export class DragProcessor extends GestureProcessor<'drag'> {
  private dragging = false;

  constructor(
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'drag'>['constraints']

  ) {
    super('drag', emit, constraints);

    this.handlers = {
      press: this.onPress,
      move: this.onMove,
      release: this.onRelease,
      cancel: this.onCancel,
    };
  }

  private onPress = (input: GestureInput) => {
    this.start(input);
    this.dragging = false;
  };

  private onMove = (input: GestureInput) => {
    if (!this.active) return;

    this.move(input);

    const minDistance = this.constraints?.minDistance ?? 8;

    if (!this.dragging) {
      if (this.distance() >= minDistance) {
        this.dragging = true;
        this.emit({
          semantic: this.semantic,
          phase: 'start',
          originalEvent: input.originalEvent,
        });
      }
      return;
    }

    this.emit({
      semantic: this.semantic,
      phase: 'move',
      dx: this.lastX - this.startX,
      dy: this.lastY - this.startY,
      originalEvent: input.originalEvent,
    });
  };

  private onRelease = (input: GestureInput) => {
    if (this.dragging) {
      this.emit({
        semantic: this.semantic,
        phase: 'end',
        originalEvent: input.originalEvent,
      });
    }
    this.reset();
    this.dragging = false;
  };

  private onCancel = () => {
    if (this.dragging) {
      this.emit({
        semantic: this.semantic,
        phase: 'cancel',
      });
    }
    this.reset();
    this.dragging = false;
  };
}
