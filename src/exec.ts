import { z, type ZodType } from "zod";

/**
 * https://manpages.ubuntu.com/manpages/noble/en/man5/systemd.exec.5.html
 */
export interface ExecSectionConfig {
  /**
  ExecSearchPath=
    Takes a colon separated list of absolute paths relative to which the executable used
    by the Exec*= (e.g.  ExecStart=, ExecStop=, etc.) properties can be found.
    ExecSearchPath= overrides $PATH if $PATH is not supplied by the user through
    Environment=, EnvironmentFile= or PassEnvironment=. Assigning an empty string removes
    previous assignments and setting ExecSearchPath= to a value multiple times will append
    to the previous setting.

    Added in version 250.
  */
  ExecSearchPath?: string;
     
  /**
  WorkingDirectory=
      Takes a directory path relative to the service's root directory specified by
      RootDirectory=, or the special value "~". Sets the working directory for executed
      processes. If set to "~", the home directory of the user specified in User= is used.
      If not set, defaults to the root directory when systemd is running as a system
      instance and the respective user's home directory if run as user. If the setting is
      prefixed with the "-" character, a missing working directory is not considered fatal.
      If RootDirectory=/RootImage= is not set, then WorkingDirectory= is relative to the
      root of the system running the service manager. Note that setting this parameter might
      result in additional dependencies to be added to the unit (see above).
  */ 
  WorkingDirectory?: string;

  /**
    RootDirectory=
      Takes a directory path relative to the host's root directory (i.e. the root of the
      system running the service manager). Sets the root directory for executed processes,
      with the chroot(2) system call. If this is used, it must be ensured that the process
      binary and all its auxiliary files are available in the chroot() jail. Note that
      setting this parameter might result in additional dependencies to be added to the unit
      (see above).

      The MountAPIVFS= and PrivateUsers= settings are particularly useful in conjunction
      with RootDirectory=. For details, see below.

      If RootDirectory=/RootImage= are used together with NotifyAccess= the notification
      socket is automatically mounted from the host into the root environment, to ensure the
      notification interface can work correctly.

      Note that services using RootDirectory=/RootImage= will not be able to log via the
      syslog or journal protocols to the host logging infrastructure, unless the relevant
      sockets are mounted from the host, specifically:

      The host's os-release(5) file will be made available for the service (read-only) as
      /run/host/os-release. It will be updated automatically on soft reboot (see: systemd-
      soft-reboot.service(8)), in case the service is configured to survive it.

      Example 1. Mounting logging sockets into root environment

          BindReadOnlyPaths=/dev/log /run/systemd/journal/socket /run/systemd/journal/stdout

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

     RootImage=
      Takes a path to a block device node or regular file as argument. This call is similar
      to RootDirectory= however mounts a file system hierarchy from a block device node or
      loopback file instead of a directory. The device node or file system image file needs
      to contain a file system without a partition table, or a file system within an
      MBR/MS-DOS or GPT partition table with only a single Linux-compatible partition, or a
      set of file systems within a GPT partition table that follows the Discoverable
      Partitions Specification[1].

      When DevicePolicy= is set to "closed" or "strict", or set to "auto" and DeviceAllow=
      is set, then this setting adds /dev/loop-control with rw mode, "block-loop" and
      "block-blkext" with rwm mode to DeviceAllow=. See systemd.resource-control(5) for the
      details about DevicePolicy= or DeviceAllow=. Also, see PrivateDevices= below, as it
      may change the setting of DevicePolicy=.

      Units making use of RootImage= automatically gain an After= dependency on
      systemd-udevd.service.

      The host's os-release(5) file will be made available for the service (read-only) as
      /run/host/os-release. It will be updated automatically on soft reboot (see: systemd-
      soft-reboot.service(8)), in case the service is configured to survive it.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 233.

  RootImageOptions=
      Takes a comma-separated list of mount options that will be used on disk images
      specified by RootImage=. Optionally a partition name can be prefixed, followed by
      colon, in case the image has multiple partitions, otherwise partition name "root" is
      implied. Options for multiple partitions can be specified in a single line with space
      separators. Assigning an empty string removes previous assignments. Duplicated options
      are ignored. For a list of valid mount options, please refer to mount(8).

      Valid partition names follow the Discoverable Partitions Specification[1]: root, usr,
      home, srv, esp, xbootldr, tmp, var.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 247.

  RootEphemeral=
      Takes a boolean argument. If enabled, executed processes will run in an ephemeral copy
      of the root directory or root image. The ephemeral copy is placed in
      /var/lib/systemd/ephemeral-trees/ while the service is active and is cleaned up when
      the service is stopped or restarted. If RootDirectory= is used and the root directory
      is a subvolume, the ephemeral copy will be created by making a snapshot of the
      subvolume.

      To make sure making ephemeral copies can be made efficiently, the root directory or
      root image should be located on the same filesystem as
      /var/lib/systemd/ephemeral-trees/. When using RootEphemeral= with root directories,
      btrfs(5) should be used as the filesystem and the root directory should ideally be a
      subvolume which systemd can snapshot to make the ephemeral copy. For root images, a
      filesystem with support for reflinks should be used to ensure an efficient ephemeral
      copy.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 254.

  RootHash=
      Takes a data integrity (dm-verity) root hash specified in hexadecimal, or the path to
      a file containing a root hash in ASCII hexadecimal format. This option enables data
      integrity checks using dm-verity, if the used image contains the appropriate integrity
      data (see above) or if RootVerity= is used. The specified hash must match the root
      hash of integrity data, and is usually at least 256 bits (and hence 64 formatted
      hexadecimal characters) long (in case of SHA256 for example). If this option is not
      specified, but the image file carries the "user.verity.roothash" extended file
      attribute (see xattr(7)), then the root hash is read from it, also as formatted
      hexadecimal characters. If the extended file attribute is not found (or is not
      supported by the underlying file system), but a file with the .roothash suffix is
      found next to the image file, bearing otherwise the same name (except if the image has
      the .raw suffix, in which case the root hash file must not have it in its name), the
      root hash is read from it and automatically used, also as formatted hexadecimal
      characters.

      If the disk image contains a separate /usr/ partition it may also be Verity protected,
      in which case the root hash may configured via an extended attribute
      "user.verity.usrhash" or a .usrhash file adjacent to the disk image. There's currently
      no option to configure the root hash for the /usr/ file system via the unit file
      directly.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 246.

  RootHashSignature=
      Takes a PKCS7 signature of the RootHash= option as a path to a DER-encoded signature
      file, or as an ASCII base64 string encoding of a DER-encoded signature prefixed by
      "base64:". The dm-verity volume will only be opened if the signature of the root hash
      is valid and signed by a public key present in the kernel keyring. If this option is
      not specified, but a file with the .roothash.p7s suffix is found next to the image
      file, bearing otherwise the same name (except if the image has the .raw suffix, in
      which case the signature file must not have it in its name), the signature is read
      from it and automatically used.

      If the disk image contains a separate /usr/ partition it may also be Verity protected,
      in which case the signature for the root hash may configured via a .usrhash.p7s file
      adjacent to the disk image. There's currently no option to configure the root hash
      signature for the /usr/ via the unit file directly.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 246.

  RootVerity=
      Takes the path to a data integrity (dm-verity) file. This option enables data
      integrity checks using dm-verity, if RootImage= is used and a root-hash is passed and
      if the used image itself does not contain the integrity data. The integrity data must
      be matched by the root hash. If this option is not specified, but a file with the
      .verity suffix is found next to the image file, bearing otherwise the same name
      (except if the image has the .raw suffix, in which case the verity data file must not
      have it in its name), the verity data is read from it and automatically used.

      This option is supported only for disk images that contain a single file system,
      without an enveloping partition table. Images that contain a GPT partition table
      should instead include both root file system and matching Verity data in the same
      image, implementing the Discoverable Partitions Specification[1].

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 246.

  RootImagePolicy=, MountImagePolicy=, ExtensionImagePolicy=
      Takes an image policy string as per systemd.image-policy(7) to use when mounting the
      disk images (DDI) specified in RootImage=, MountImage=, ExtensionImage=, respectively.
      If not specified the following policy string is the default for RootImagePolicy= and
      MountImagePolicy:

          root=verity+signed+encrypted+unprotected+absent: \
                  usr=verity+signed+encrypted+unprotected+absent: \
                  home=encrypted+unprotected+absent: \
                  srv=encrypted+unprotected+absent: \
                  tmp=encrypted+unprotected+absent: \
                  var=encrypted+unprotected+absent

      The default policy for ExtensionImagePolicy= is:

          root=verity+signed+encrypted+unprotected+absent: \
                  usr=verity+signed+encrypted+unprotected+absent

      Added in version 254.

  MountAPIVFS=
      Takes a boolean argument. If on, a private mount namespace for the unit's processes is
      created and the API file systems /proc/, /sys/, /dev/ and /run/ (as an empty "tmpfs")
      are mounted inside of it, unless they are already mounted. Note that this option has
      no effect unless used in conjunction with RootDirectory=/RootImage= as these four
      mounts are generally mounted in the host anyway, and unless the root directory is
      changed, the private mount namespace will be a 1:1 copy of the host's, and include
      these four mounts. Note that the /dev/ file system of the host is bind mounted if this
      option is used without PrivateDevices=. To run the service with a private, minimal
      version of /dev/, combine this option with PrivateDevices=.

      In order to allow propagating mounts at runtime in a safe manner,
      /run/systemd/propagate/ on the host will be used to set up new mounts, and
      /run/host/incoming/ in the private namespace will be used as an intermediate step to
      store them before being moved to the final mount point.

      Added in version 233.

  ProtectProc=
      Takes one of "noaccess", "invisible", "ptraceable" or "default" (which it defaults
      to). When set, this controls the "hidepid=" mount option of the "procfs" instance for
      the unit that controls which directories with process metainformation (/proc/PID) are
      visible and accessible: when set to "noaccess" the ability to access most of other
      users' process metadata in /proc/ is taken away for processes of the service. When set
      to "invisible" processes owned by other users are hidden from /proc/. If "ptraceable"
      all processes that cannot be ptrace()'ed by a process are hidden to it. If "default"
      no restrictions on /proc/ access or visibility are made. For further details see The
      /proc Filesystem[2]. It is generally recommended to run most system services with this
      option set to "invisible". This option is implemented via file system namespacing, and
      thus cannot be used with services that shall be able to install mount points in the
      host file system hierarchy. Note that the root user is unaffected by this option, so
      to be effective it has to be used together with User= or DynamicUser=yes, and also
      without the "CAP_SYS_PTRACE" capability, which also allows a process to bypass this
      feature. It cannot be used for services that need to access metainformation about
      other users' processes. This option implies MountAPIVFS=.

      If the kernel doesn't support per-mount point hidepid= mount options this setting
      remains without effect, and the unit's processes will be able to access and see other
      process as if the option was not used.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 247.

  ProcSubset=
      Takes one of "all" (the default) and "pid". If "pid", all files and directories not
      directly associated with process management and introspection are made invisible in
      the /proc/ file system configured for the unit's processes. This controls the
      "subset=" mount option of the "procfs" instance for the unit. For further details see
      The /proc Filesystem[2]. Note that Linux exposes various kernel APIs via /proc/, which
      are made unavailable with this setting. Since these APIs are used frequently this
      option is useful only in a few, specific cases, and is not suitable for most
      non-trivial programs.

      Much like ProtectProc= above, this is implemented via file system mount namespacing,
      and hence the same restrictions apply: it is only available to system services, it
      disables mount propagation to the host mount table, and it implies MountAPIVFS=. Also,
      like ProtectProc= this setting is gracefully disabled if the used kernel does not
      support the "subset=" mount option of "procfs".

      Added in version 247.

  BindPaths=, BindReadOnlyPaths=
      Configures unit-specific bind mounts. A bind mount makes a particular file or
      directory available at an additional place in the unit's view of the file system. Any
      bind mounts created with this option are specific to the unit, and are not visible in
      the host's mount table. This option expects a whitespace separated list of bind mount
      definitions. Each definition consists of a colon-separated triple of source path,
      destination path and option string, where the latter two are optional. If only a
      source path is specified the source and destination is taken to be the same. The
      option string may be either "rbind" or "norbind" for configuring a recursive or
      non-recursive bind mount. If the destination path is omitted, the option string must
      be omitted too. Each bind mount definition may be prefixed with "-", in which case it
      will be ignored when its source path does not exist.

      BindPaths= creates regular writable bind mounts (unless the source file system mount
      is already marked read-only), while BindReadOnlyPaths= creates read-only bind mounts.
      These settings may be used more than once, each usage appends to the unit's list of
      bind mounts. If the empty string is assigned to either of these two options the entire
      list of bind mounts defined prior to this is reset. Note that in this case both
      read-only and regular bind mounts are reset, regardless which of the two settings is
      used.

      This option is particularly useful when RootDirectory=/RootImage= is used. In this
      case the source path refers to a path on the host file system, while the destination
      path refers to a path below the root directory of the unit.

      Note that the destination directory must exist or systemd must be able to create it.
      Thus, it is not possible to use those options for mount points nested underneath paths
      specified in InaccessiblePaths=, or under /home/ and other protected directories if
      ProtectHome=yes is specified.  TemporaryFileSystem= with ":ro" or ProtectHome=tmpfs
      should be used instead.

      Added in version 233.

  MountImages=
      This setting is similar to RootImage= in that it mounts a file system hierarchy from a
      block device node or loopback file, but the destination directory can be specified as
      well as mount options. This option expects a whitespace separated list of mount
      definitions. Each definition consists of a colon-separated tuple of source path and
      destination definitions, optionally followed by another colon and a list of mount
      options.

      Mount options may be defined as a single comma-separated list of options, in which
      case they will be implicitly applied to the root partition on the image, or a series
      of colon-separated tuples of partition name and mount options. Valid partition names
      and mount options are the same as for RootImageOptions= setting described above.

      Each mount definition may be prefixed with "-", in which case it will be ignored when
      its source path does not exist. The source argument is a path to a block device node
      or regular file. If source or destination contain a ":", it needs to be escaped as
      "\:". The device node or file system image file needs to follow the same rules as
      specified for RootImage=. Any mounts created with this option are specific to the
      unit, and are not visible in the host's mount table.

      These settings may be used more than once, each usage appends to the unit's list of
      mount paths. If the empty string is assigned, the entire list of mount paths defined
      prior to this is reset.

      Note that the destination directory must exist or systemd must be able to create it.
      Thus, it is not possible to use those options for mount points nested underneath paths
      specified in InaccessiblePaths=, or under /home/ and other protected directories if
      ProtectHome=yes is specified.

      When DevicePolicy= is set to "closed" or "strict", or set to "auto" and DeviceAllow=
      is set, then this setting adds /dev/loop-control with rw mode, "block-loop" and
      "block-blkext" with rwm mode to DeviceAllow=. See systemd.resource-control(5) for the
      details about DevicePolicy= or DeviceAllow=. Also, see PrivateDevices= below, as it
      may change the setting of DevicePolicy=.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 247.

  ExtensionImages=
      This setting is similar to MountImages= in that it mounts a file system hierarchy from
      a block device node or loopback file, but instead of providing a destination path, an
      overlay will be set up. This option expects a whitespace separated list of mount
      definitions. Each definition consists of a source path, optionally followed by a colon
      and a list of mount options.

      A read-only OverlayFS will be set up on top of /usr/ and /opt/ hierarchies for sysext
      images and /etc/ hierarchy for confext images. The order in which the images are
      listed will determine the order in which the overlay is laid down: images specified
      first to last will result in overlayfs layers bottom to top.

      Mount options may be defined as a single comma-separated list of options, in which
      case they will be implicitly applied to the root partition on the image, or a series
      of colon-separated tuples of partition name and mount options. Valid partition names
      and mount options are the same as for RootImageOptions= setting described above.

      Each mount definition may be prefixed with "-", in which case it will be ignored when
      its source path does not exist. The source argument is a path to a block device node
      or regular file. If the source path contains a ":", it needs to be escaped as "\:".
      The device node or file system image file needs to follow the same rules as specified
      for RootImage=. Any mounts created with this option are specific to the unit, and are
      not visible in the host's mount table.

      These settings may be used more than once, each usage appends to the unit's list of
      image paths. If the empty string is assigned, the entire list of mount paths defined
      prior to this is reset.

      Each sysext image must carry a /usr/lib/extension-release.d/extension-release.IMAGE
      file while each confext image must carry a
      /etc/extension-release.d/extension-release.IMAGE file, with the appropriate metadata
      which matches RootImage=/RootDirectory= or the host. See: os-release(5). To disable
      the safety check that the extension-release file name matches the image file name, the
      x-systemd.relax-extension-release-check mount option may be appended.

      When DevicePolicy= is set to "closed" or "strict", or set to "auto" and DeviceAllow=
      is set, then this setting adds /dev/loop-control with rw mode, "block-loop" and
      "block-blkext" with rwm mode to DeviceAllow=. See systemd.resource-control(5) for the
      details about DevicePolicy= or DeviceAllow=. Also, see PrivateDevices= below, as it
      may change the setting of DevicePolicy=.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 248.

  ExtensionDirectories=
      This setting is similar to BindReadOnlyPaths= in that it mounts a file system
      hierarchy from a directory, but instead of providing a destination path, an overlay
      will be set up. This option expects a whitespace separated list of source directories.

      A read-only OverlayFS will be set up on top of /usr/ and /opt/ hierarchies for sysext
      images and /etc/ hierarchy for confext images. The order in which the directories are
      listed will determine the order in which the overlay is laid down: directories
      specified first to last will result in overlayfs layers bottom to top.

      Each directory listed in ExtensionDirectories= may be prefixed with "-", in which case
      it will be ignored when its source path does not exist. Any mounts created with this
      option are specific to the unit, and are not visible in the host's mount table.

      These settings may be used more than once, each usage appends to the unit's list of
      directories paths. If the empty string is assigned, the entire list of mount paths
      defined prior to this is reset.

      Each sysext directory must contain a
      /usr/lib/extension-release.d/extension-release.IMAGE file while each confext directory
      must carry a /etc/extension-release.d/extension-release.IMAGE file, with the
      appropriate metadata which matches RootImage=/RootDirectory= or the host. See: os-
      release(5).

      Note that usage from user units requires overlayfs support in unprivileged user
      namespaces, which was first introduced in kernel v5.11.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 251.
   */
}

export const ExecSectionSchema: ZodType<ExecSectionConfig> = z.object({
  ExecSearchPath: z.string().optional(),
  WorkingDirectory: z.string().optional(),
});


export class ExecSectionBuilder {
  public section: ExecSectionConfig = {};

  public setExecSearchPath(value: string): this {
    this.section.ExecSearchPath = value;
    return this;
  }

  public setWorkingDirectory(value: string): this {
    this.section.WorkingDirectory = value;
    return this;
  }
}
