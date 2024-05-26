import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { INI, Service, Timer, Unit } from "@systemd-js/conf";
import { extname } from "node:path";


const getType = (name: string, unit?: Unit) => {
  if(unit) {
    return unit.getType();
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
  return `/etc/systemd/system/${name}.${type}`;
};

const getUnit = (unitName: string, type: string = getType(unitName)): Unit | undefined => {
  const name = getName(unitName);
  const path = `/etc/systemd/system/${name}.${type}`;

  if (existsSync(path)) {
    const content = readFileSync(path, "utf-8");
    switch (type) {
      case "service": {
        const ini = INI.fromString(content);
        const unit = Service.fromINI(ini);
        return unit;
      }
      case "timer": {
        const ini = INI.fromString(content);
        const unit = Timer.fromINI(ini);
        return unit;
      }
      default:
        throw new Error(`Unit type not supported: ${type}`);
    }
  }
  return;
};

export class Ctl {
  private type: string;
  private name: string;
  private path: string;

  private unit?: Unit;
  private current?: Unit;

  constructor(name: string, unit?: Unit) {
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

  public create() {
    if (!this.unit) {
      throw new Error("Unit not found");
    }
    const unitString = this.unit.toINIString();
    const currentUnit = this.current?.toINIString();

    if (currentUnit !== unitString) {
      writeFileSync(this.path, unitString);
    }
  }

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
}

export function createUnit(unitName: string, unit: Unit) {
  const name = getName(unitName);
  const type = getType(unitName, unit);
  const path = getPath (name, type);

  const current = getUnit(name, type);
  const currentUnit = current?.toINIString();
  const unitString = unit.toINIString();

  if (currentUnit !== unitString) {
    writeFileSync(path, unitString);
  }
}

export function enableUnit(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl enable ${name}.${type}`);
}

export function disableUnit(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl disable ${name}.${type}`);
}

export function startUnit(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl start ${name}.${type}`);
}

export function stopUnit(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl stop ${name}.${type}`);
}

export function restartUnit(unitName: string, unit?: Unit) {
  const type = getType(unitName, unit);
  const name = getName(unitName);

  execSync(`systemctl restart ${name}.${type}`);
}

