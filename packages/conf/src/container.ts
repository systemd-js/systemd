import { z } from "zod";
import type { InstallSectionConfig } from "./install.js";
import { InstallSectionBuilder, InstallSectionSchema } from "./install.js";
import type { UnitSection} from "./unit.js";
import { UnitSectionBuilder, UnitSectionSchema } from "./unit.js";
import { implement } from "./utils.js";
import { INI } from "./ini.js";

/**
 * @see https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html
 */
export interface ContainerSection {
  Image?: string;
}

export interface ContainerUnit {
  Unit: UnitSection
  Install?: InstallSectionConfig;
  Container: ContainerSection
}

export const ContainerSectionSchema = implement<ContainerSection>().with({
  Image: z.string().optional(),
});


export const ContainerUnitSchema = implement<ContainerUnit>().with({
  /**
 * @see {@link UnitSection}
 */
  Unit: UnitSectionSchema,
  /**
   * @see {@link InstallSectionConfig}
   */
  Install: InstallSectionSchema.optional(),
  /**
   */
  Container: ContainerSectionSchema,
});


export class ContainerSectionBuilder {
  public section: ContainerSection = {};

  public constructor(section: ContainerSection = {}) {
    this.section = ContainerSectionSchema.parse(section);
  }

  /**
   * Validate and return the UnitSection
   * @returns {ContainerSection}
   */
  public toObject() {
    return ContainerSectionSchema.parse(this.section);
  }
}

export class Container {
  private readonly unitSection: UnitSectionBuilder;
  private readonly containerSection: ContainerSectionBuilder;
  private readonly installSection: InstallSectionBuilder;

  public constructor(timer: object = {
    Unit: {},
    Container: {},
  }) {
    const {Unit, Install, Container: ContainerObj} = ContainerUnitSchema.parse(timer); 
    this.containerSection = new ContainerSectionBuilder(ContainerObj);
    this.unitSection = new UnitSectionBuilder(Unit);
    this.installSection = new InstallSectionBuilder(Install); 
  }

  public static getType() {
    return "container";
  }

  /**
   * Get the [Container] section of the container
   * @returns {ContainerSectionBuilder}
   */
  public getContainerSection() {
    return this.containerSection;
  }

  /**
   * Get the [Unit] section of the container
   * @returns {UnitSectionBuilder}
   */
  public getUnitSection() {
    return this.unitSection;
  }

  /**
   * Get the [Install] section of the container
   * @returns {InstallSectionBuilder}
   */
  public getInstallSection() {
    return this.installSection;
  }
  
  /**
   * Convert the timer to an object
   */
  public toObject() {
    const object = {
      Unit: this.unitSection.toObject(),
      Install: this.installSection.toObject(),
      Container: this.containerSection.toObject(),
    };

    return INI
      .fromObject(object)
      .toObject();
  }

  /**
   * Convert the timer to an INI string
   */
  public toINIString() {
    const object = {
      Unit: this.unitSection.toObject(),
      Install: this.installSection.toObject(),
      Container: this.containerSection.toObject(),
    };

    return INI
      .fromObject(object)
      .toString();
  }

  /**
   * Create an timer from an object
   */
  public static fromObject(obj: unknown) {
    if (obj instanceof Object) {
      const service = ContainerUnitSchema.parse(obj);
      return new Container(service);
    }
    throw new Error("Expected object");
  }

  /**
   * Create an service from an INI instance
   */
  public static fromINI(ini: INI) {
    if (ini instanceof INI) {
      const container = ContainerUnitSchema.parse(ini.toObject());
      return new Container(container);
    }
    throw new Error("Expected INI object");
  }

  /**
   * Compare current timer with another timer
   */
  public equals(container: Container) {
    return JSON.stringify(this.toObject()) === JSON.stringify(container.toObject());
  }
}
