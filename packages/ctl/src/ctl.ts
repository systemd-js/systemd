import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { Unit } from "@systemd-js/conf";
import { INI, Service, Timer } from "@systemd-js/conf";
import { extname } from "node:path";

const getType = (name: string, unit?: Unit): string => {
  if (unit) {
    return (unit.constructor as typeof Service).getType();
  }
  const type = extname(name).slice(1);
  if (!type) {
    throw new Error(`Unit type not found in name: ${name}`);
  }
  return type;
};

const getName = (name: string) => {
  const type = extname(name);
  if (!type) {
    return name;
  }
  return name.replace(type, "");
};

const getPath = (name: string, type: string) => {
  return type !== "container"
    ? `/etc/systemd/system/${name}.${type}`
    : `/etc/containers/systemd/${name}.${type}`;
};

/**
 * Create Unit from filesystem
 */
function getUnit(unitName: string, type: string = getType(unitName)): Unit | undefined {
  const name = getName(unitName);
  const path = `/etc/systemd/system/${name}.${type}`;

  if (!existsSync(path)) {
    return;
  }

  const content = readFileSync(path, "utf-8");
  switch (type) {
    case "service": {
      const ini = INI.fromString(content);
      return Service.fromINI(ini);
    }
    case "timer": {
      const ini = INI.fromString(content);
      return Timer.fromINI(ini);
    }
    default:
      throw new Error(`Unit type not supported: ${type}`);
  }
};

/**
 * Write unit file to filesystem.
 * Create the unit file if it does not or update if it is different from the current unit.
 * @returns "created" | "updated" | "unchanged"
 */
export function write(unitName: string, unit: Unit) {
  const name = getName(unitName);
  const type = getType(unitName, unit);
  const path = getPath (name, type);

  const current = getUnit(name, type);

  if (unit.equals(current)) {
    return "unchanged";
  }
  writeFileSync(path, unit.toINIString());

  return current
    ? "updated"
    : "created";
}

export function reload(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl reload ${name}.${type}`);
}

export function enable(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  if (type === "container") {
    throw new Error("Containers are not supported");
  }
  const name = getName(unitName);

  execSync(`systemctl enable ${name}.${type}`);
}

export function disable(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  if (type === "container") {
    throw new Error("Containers are not supported");
  }
  const name = getName(unitName);

  execSync(`systemctl disable ${name}.${type}`);
}

export function start(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl start ${name}.${type}`);
}

export function stop(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl stop ${name}.${type}`);
}

export function restart(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl restart ${name}.${type}`);
}

export function isActive(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  try {
    return execSync(`systemctl is-active ${name}.${type}`).toString().trim() === "active";
  }
  catch {
    return false;
  }
}

export function isEnabled(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  try {
    return execSync(`systemctl is-enabled ${name}.${type}`).toString().trim() === "enabled";
  }
  catch {
    return false;
  }
}

export function daemonReload() {
  execSync(`systemctl daemon-reload`);
}

export class Ctl {
  private readonly type: string;
  private readonly name: string;
  private readonly path: string;

  private readonly unit?: Unit;
  private readonly current?: Unit;

  public constructor(name: string, unit?: Unit) {
    this.name = getName(name);
    this.type = getType(name, unit);
    this.current = getUnit(
      this.name,
      this.type,
    );
    this.path = getPath(
      this.name,
      this.type,
    );
    this.unit = unit;
  }

  /**
   * Write unit file to filesystem.
   * Create the unit file if it does not or update if it is different from the current unit.
   * @returns "created" | "updated" | "unchanged"
   */
  public write() {
    if (!this.unit) {
      throw new Error("Unit not found");
    }

    if (this.unit.equals(this.current)) {
      return "unchanged";
    }

    writeFileSync(this.path, this.unit.toINIString());

    return this.current
      ? "updated"
      : "created";
  }

  /**
   * Enabled Unit will be started on next boot
   */
  public enable() {
    execSync(`systemctl enable ${this.name}.${this.type}`);
  }

  public disable() {
    execSync(`systemctl disable ${this.name}.${this.type}`);
  }

  public start() {
    execSync(`systemctl start ${this.name}.${this.type}`);
  }

  public stop() {
    execSync(`systemctl stop ${this.name}.${this.type}`);
  }

  public restart() {
    execSync(`systemctl restart ${this.name}.${this.type}`);
  }

  public reload() {
    execSync(`systemctl reload ${this.name}.${this.type}`);
  }

  public isActive() {
    return isActive(this.name, this.unit);
  }

  public isEnabled() {
    return isEnabled(this.name, this.unit);
  }
}
