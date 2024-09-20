import { z } from "zod";
import type { InstallSectionConfig } from "./install.js";
import { InstallSectionBuilder, InstallSectionSchema } from "./install.js";
import type { UnitSection } from "./unit.js";
import { UnitSectionBuilder, UnitSectionSchema } from "./unit.js";
import { implement } from "./utils.js";
import { INI } from "./ini.js";
import { ServiceSectionBuilder, ServiceSectionSchema, type ServiceSection } from "./service.js";
import type { AbstractUnit, Unit } from "./types.js";

/**
 * @see https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html
 */
export interface ContainerSection {
  Image?: string;
}

export interface ContainerUnit {
  Unit: UnitSection;
  Install?: InstallSectionConfig;
  Container: ContainerSection;
  Service?: ServiceSection;
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
  /**
   * @see {@link ServiceSection}
   */
  Service: ServiceSectionSchema.optional(),
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

export class Container implements AbstractUnit {
  private readonly unitSection: UnitSectionBuilder;
  private readonly containerSection: ContainerSectionBuilder;
  private readonly installSection: InstallSectionBuilder;
  private readonly serviceSection: ServiceSectionBuilder;

  public constructor(timer: object = {
    Unit: {},
    Container: {},
  }) {
    const { Unit, Install, Service, Container: ContainerObj } = ContainerUnitSchema.parse(timer);
    this.containerSection = new ContainerSectionBuilder(ContainerObj);
    this.unitSection = new UnitSectionBuilder(Unit);
    this.installSection = new InstallSectionBuilder(Install);
    this.serviceSection = new ServiceSectionBuilder(Service);
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
   * Get the [Service] section of the container
   * @returns {ServiceSectionBuilder}
   */
  public getServiceSection() {
    return this.serviceSection;
  }

  /**
   * Convert the container to an object
   */
  public toObject() {
    const object = {
      Unit: this.unitSection.toObject(),
      Install: this.installSection.toObject(),
      Container: this.containerSection.toObject(),
      Service: this.serviceSection.toObject(),
    };

    return INI
      .fromObject(object)
      .toObject();
  }

  /**
   * Convert the container to an INI string
   */
  public toINIString() {
    const object = {
      Unit: this.unitSection.toObject(),
      Install: this.installSection.toObject(),
      Container: this.containerSection.toObject(),
      Service: this.serviceSection.toObject(),
    };

    return INI
      .fromObject(object)
      .toString();
  }

  /**
   * Create an container from an object
   */
  public static fromObject(obj: unknown) {
    if (obj instanceof Object) {
      const service = ContainerUnitSchema.parse(obj);
      return new Container(service);
    }
    throw new Error("Expected object");
  }

  /**
   * Create an container from an INI instance
   */
  public static fromINI(ini: INI) {
    if (ini instanceof INI) {
      const container = ContainerUnitSchema.parse(ini.toObject());
      return new Container(container);
    }
    throw new Error("Expected INI object");
  }

  /**
   * Compare current container with another container
   */
  public equals(container?: Unit) {
    return JSON.stringify(this.toObject()) === JSON.stringify(container?.toObject());
  }
}
