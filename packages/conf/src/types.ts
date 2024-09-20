import type { Container } from "./container.js";
import type { Service } from "./service.js";
import type { Timer } from "./timer.js";

export abstract class AbstractUnit {
  public abstract toObject(): object;
  public abstract toINIString(): string;
  public abstract equals(unit?: Unit): boolean;
}

export type Unit = Container | Service | Timer;
