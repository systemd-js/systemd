import type { ZodType} from "zod";
import { z } from "zod";

/**
 * Unit files may include an [Install] section, which carries installation information for
 * the unit. This section is not interpreted by systemd(1) during runtime; it is used by the
 * enable and disable commands of the systemctl(1) tool during installation of a unit.
 *
 * The following specifiers are interpreted in the Install section: %a, %b, %B, %g, %G, %H,
 * %i, %j, %l, %m, %n, %N, %o, %p, %u, %U, %v, %w, %W, %%. For their meaning see the next
 * section.
 * @see https://manpages.ubuntu.com/manpages/noble/en/man5/systemd.unit.5.html#[install]%20section%20options
 */
export interface InstallSection {
  /**
  Alias=
    A space-separated list of additional names this unit shall be installed under. The
    names listed here must have the same suffix (i.e. type) as the unit filename. This
    option may be specified more than once, in which case all listed names are used. At
    installation time, systemctl enable will create symlinks from these names to the unit
    filename. Note that not all unit types support such alias names, and this setting is
    not supported for them. Specifically, mount, slice, swap, and automount units do not
    support aliasing.

    Added in version 201.
  */
  Alias?: string[] | string;

  /**
  WantedBy=, RequiredBy=, UpheldBy=
    This option may be used more than once, or a space-separated list of unit names may be
    given. A symbolic link is created in the .wants/, .requires/, or .upholds/ directory
    of each of the listed units when this unit is installed by systemctl enable. This has
    the effect of a dependency of type Wants=, Requires=, or Upholds= being added from the
    listed unit to the current unit. See the description of the mentioned dependency types
    in the [Unit] section for details.

    In case of template units listing non template units, the listing unit must have
    DefaultInstance= set, or systemctl enable must be called with an instance name. The
    instance (default or specified) will be added to the .wants/, .requires/, or .upholds/
    list of the listed unit. For example, WantedBy=getty.target in a service
    getty@.service will result in systemctl enable getty@tty2.service creating a
    getty.target.wants/getty@tty2.service link to getty@.service. This also applies to
    listing specific instances of templated units: this specific instance will gain the
    dependency. A template unit may also list a template unit, in which case a generic
    dependency will be added where each instance of the listing unit will have a
    dependency on an instance of the listed template with the same instance value. For
    example, WantedBy=container@.target in a service monitor@.service will result in
    systemctl enable monitor@.service creating a container@.target.wants/monitor@.service
    link to monitor@.service, which applies to all instances of container@.target.

    Added in version 201.
  */

  WantedBy?: string[] | string;
  RequiredBy?: string[] | string;
  UpheldBy?: string[] | string;
  
  /**
  Also=
    Additional units to install/deinstall when this unit is installed/deinstalled. If the
    user requests installation/deinstallation of a unit with this option configured,
    systemctl enable and systemctl disable will automatically install/uninstall units
    listed in this option as well.

    This option may be used more than once, or a space-separated list of unit names may be
    given.

    Added in version 201.
  */
  Also?: string[] | string;

  /**
  DefaultInstance=
    In template unit files, this specifies for which instance the unit shall be enabled if
    the template is enabled without any explicitly set instance. This option has no effect
    in non-template unit files. The specified string must be usable as instance
    identifier.

    Added in version 215.
  */
  DefaultInstance?: string;
}


export const InstallSectionSchema: ZodType<InstallSection> = z.object({
  Alias: z.union([z.string(), z.array(z.string())]).optional(),
  WantedBy: z.union([z.string(), z.array(z.string())]).optional(),
  RequiredBy: z.union([z.string(), z.array(z.string())]).optional(),
  UpheldBy: z.union([z.string(), z.array(z.string())]).optional(),
  Also: z.union([z.string(), z.array(z.string())]).optional(),
  DefaultInstance: z.string().optional(),
});

export class InstallSectionBuilder {
  public section: InstallSection = {};

  public constructor(section: InstallSection = {}) {
    this.section = InstallSectionSchema.parse(section);
  }

  /**
   * Validate and return the UnitSection
   * @returns {InstallSection}
   */
  public toObject() {
    return InstallSectionSchema.parse(this.section);
  }

  /**
   * Set alias for the unit
   * @see {@link InstallSection.Alias}
   */
  public setAlias(alias: string[] | string): this {
    this.section.Alias = alias;
    return this;
  }

  /**
   * Set WantedBy for the unit
   * @see {@link InstallSection.WantedBy}
   */
  public setWantedBy(wantedBy: string[] | string): this {
    this.section.WantedBy = wantedBy;
    return this;
  }

  /**
   * Set RequiredBy for the unit
   * @see {@link InstallSection.RequiredBy}
   */
  public setRequiredBy(requiredBy: string[] | string): this {
    this.section.RequiredBy = requiredBy;
    return this;
  }

  /**
   * Set UpheldBy for the unit
   * @see {@link InstallSection.UpheldBy}
   */
  public setUpheldBy(upheldBy: string[] | string): this {
    this.section.UpheldBy = upheldBy;
    return this;
  }

  /**
   * Set Also for the unit
   * @see {@link InstallSection.Also}
   */
  public setAlso(also: string[] | string): this {
    this.section.Also = also;
    return this;
  }

  /**
   * Set DefaultInstance for the unit
   * @see {@link InstallSection.DefaultInstance}
   */
  public setDefaultInstance(defaultInstance: string): this {
    this.section.DefaultInstance = defaultInstance;
    return this;
  }
}
