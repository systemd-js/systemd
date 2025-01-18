import { z } from "zod";
import { implement } from "./utils.js";

/**
 * @see https://manpages.ubuntu.com/manpages/noble/en/man5/systemd.exec.5.html
 */
export interface ExecSectionConfig {
  // PATHS
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
  */
  RootDirectory?: string;

  /**
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
  */
  RootImage?: string;

  /**
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
  */
  RootImageOptions?: string;

  /**
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
  */
  RootEphemeral?: boolean;

  /**
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
  */
  RootHash?: string;

  /**
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
  */
  RootHashSignature?: string;

  /**
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
  */
  RootVerity?: string;

  /**
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
  */
  RootImagePolicy?: string;
  MountImagePolicy?: string;
  ExtensionImagePolicy?: string;

  /**
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
  */
  MountAPIVFS?: boolean;

  /**
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
  */
  ProtectProc?: "default" | "invisible" | "noaccess" | "ptraceable";

  /**
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
  */
  ProcSubset?: "all" | "pid";

  /**
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
  */
  BindPaths?: string;
  BindReadOnlyPaths?: string;

  /**
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
  */
  MountImages?: string;

  /**
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
  */
  ExtensionImages?: string;

  /**
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
  ExtensionDirectories?: string;

  /**
  *
  * USER/GROUP IDENTITY
  */

  /**
  User=, Group=
    Set the UNIX user or group that the processes are executed as, respectively. Takes a
    single user or group name, or a numeric ID as argument. For system services (services
    run by the system service manager, i.e. managed by PID 1) and for user services of the
    root user (services managed by root's instance of systemd --user), the default is
    "root", but User= may be used to specify a different user. For user services of any
    other user, switching user identity is not permitted, hence the only valid setting is
    the same user the user's service manager is running as. If no group is set, the
    default group of the user is used. This setting does not affect commands whose command
    line is prefixed with "+".

    Note that this enforces only weak restrictions on the user/group name syntax, but will
    generate warnings in many cases where user/group names do not adhere to the following
    rules: the specified name should consist only of the characters a-z, A-Z, 0-9, "_" and
    "-", except for the first character which must be one of a-z, A-Z and "_" (i.e. digits
    and "-" are not permitted as first character). The user/group name must have at least
    one character, and at most 31. These restrictions are made in order to avoid
    ambiguities and to ensure user/group names and unit files remain portable among Linux
    systems. For further details on the names accepted and the names warned about see
    User/Group Name Syntax[3].

    When used in conjunction with DynamicUser= the user/group name specified is
    dynamically allocated at the time the service is started, and released at the time the
    service is stopped — unless it is already allocated statically (see below). If
    DynamicUser= is not used the specified user and group must have been created
    statically in the user database no later than the moment the service is started, for
    example using the sysusers.d(5) facility, which is applied at boot or package install
    time. If the user does not exist by then program invocation will fail.

    If the User= setting is used the supplementary group list is initialized from the
    specified user's default group list, as defined in the system's user and group
    database. Additional groups may be configured through the SupplementaryGroups= setting
    (see below).
  */
  User?: string;
  Group?: string;

  /**
  DynamicUser=
    Takes a boolean parameter. If set, a UNIX user and group pair is allocated dynamically
    when the unit is started, and released as soon as it is stopped. The user and group
    will not be added to /etc/passwd or /etc/group, but are managed transiently during
    runtime. The nss-systemd(8) glibc NSS module provides integration of these dynamic
    users/groups into the system's user and group databases. The user and group name to
    use may be configured via User= and Group= (see above). If these options are not used
    and dynamic user/group allocation is enabled for a unit, the name of the dynamic
    user/group is implicitly derived from the unit name. If the unit name without the type
    suffix qualifies as valid user name it is used directly, otherwise a name
    incorporating a hash of it is used. If a statically allocated user or group of the
    configured name already exists, it is used and no dynamic user/group is allocated.
    Note that if User= is specified and the static group with the name exists, then it is
    required that the static user with the name already exists. Similarly, if Group= is
    specified and the static user with the name exists, then it is required that the
    static group with the name already exists. Dynamic users/groups are allocated from the
    UID/GID range 61184...65519. It is recommended to avoid this range for regular system
    or login users. At any point in time each UID/GID from this range is only assigned to
    zero or one dynamically allocated users/groups in use. However, UID/GIDs are recycled
    after a unit is terminated. Care should be taken that any processes running as part of
    a unit for which dynamic users/groups are enabled do not leave files or directories
    owned by these users/groups around, as a different unit might get the same UID/GID
    assigned later on, and thus gain access to these files or directories. If DynamicUser=
    is enabled, RemoveIPC= and PrivateTmp= are implied (and cannot be turned off). This
    ensures that the lifetime of IPC objects and temporary files created by the executed
    processes is bound to the runtime of the service, and hence the lifetime of the
    dynamic user/group. Since /tmp/ and /var/tmp/ are usually the only world-writable
    directories on a system this ensures that a unit making use of dynamic user/group
    allocation cannot leave files around after unit termination. Furthermore
    NoNewPrivileges= and RestrictSUIDSGID= are implicitly enabled (and cannot be
    disabled), to ensure that processes invoked cannot take benefit or create SUID/SGID
    files or directories. Moreover ProtectSystem=strict and ProtectHome=read-only are
    implied, thus prohibiting the service to write to arbitrary file system locations. In
    order to allow the service to write to certain directories, they have to be
    allow-listed using ReadWritePaths=, but care must be taken so that UID/GID recycling
    doesn't create security issues involving files created by the service. Use
    RuntimeDirectory= (see below) in order to assign a writable runtime directory to a
    service, owned by the dynamic user/group and removed automatically when the unit is
    terminated. Use StateDirectory=, CacheDirectory= and LogsDirectory= in order to assign
    a set of writable directories for specific purposes to the service in a way that they
    are protected from vulnerabilities due to UID reuse (see below). If this option is
    enabled, care should be taken that the unit's processes do not get access to
    directories outside of these explicitly configured and managed ones. Specifically, do
    not use BindPaths= and be careful with AF_UNIX file descriptor passing for directory
    file descriptors, as this would permit processes to create files or directories owned
    by the dynamic user/group that are not subject to the lifecycle and access guarantees
    of the service. Note that this option is currently incompatible with D-Bus policies,
    thus a service using this option may currently not allocate a D-Bus service name (note
    that this does not affect calling into other D-Bus services). Defaults to off.

    Added in version 232.
  */
  DynamicUser?: boolean;

  /**
  SupplementaryGroups=
    Sets the supplementary Unix groups the processes are executed as. This takes a
    space-separated list of group names or IDs. This option may be specified more than
    once, in which case all listed groups are set as supplementary groups. When the empty
    string is assigned, the list of supplementary groups is reset, and all assignments
    prior to this one will have no effect. In any way, this option does not override, but
    extends the list of supplementary groups configured in the system group database for
    the user. This does not affect commands prefixed with "+".
  */
  SupplementaryGroups?: string;

  /**
  SetLoginEnvironment=
    Takes a boolean parameter that controls whether to set $HOME, $LOGNAME, and $SHELL
    environment variables. If unset, this is controlled by whether User= is set. If true,
    they will always be set for system services, i.e. even when the default user "root" is
    used. If false, the mentioned variables are not set by systemd, no matter whether
    User= is used or not. This option normally has no effect on user services, since these
    variables are typically inherited from user manager's own environment anyway.

    Added in version 255.
  */
  SetLoginEnvironment?: boolean;

  /**
  PAMName=
    Sets the PAM service name to set up a session as. If set, the executed process will be
    registered as a PAM session under the specified service name. This is only useful in
    conjunction with the User= setting, and is otherwise ignored. If not set, no PAM
    session will be opened for the executed processes. See pam(8) for details.

    Note that for each unit making use of this option a PAM session handler process will
    be maintained as part of the unit and stays around as long as the unit is active, to
    ensure that appropriate actions can be taken when the unit and hence the PAM session
    terminates. This process is named "(sd-pam)" and is an immediate child process of the
    unit's main process.

    Note that when this option is used for a unit it is very likely (depending on PAM
    configuration) that the main unit process will be migrated to its own session scope
    unit when it is activated. This process will hence be associated with two units: the
    unit it was originally started from (and for which PAMName= was configured), and the
    session scope unit. Any child processes of that process will however be associated
    with the session scope unit only. This has implications when used in combination with
    NotifyAccess=all, as these child processes will not be able to affect changes in the
    original unit through notification messages. These messages will be considered
    belonging to the session scope unit and not the original unit. It is hence not
    recommended to use PAMName= in combination with NotifyAccess=all.
  */
  PAMName?: string;

  /**
  *
  * CAPABILITIES
  *
  * These options are only available for system services, or for services running in per-user
  * instances of the service manager in which case PrivateUsers= is implicitly enabled
  * (requires unprivileged user namespaces support to be enabled in the kernel via the
  * "kernel.unprivileged_userns_clone=" sysctl).
  */

  /**
  CapabilityBoundingSet=
    Controls which capabilities to include in the capability bounding set for the executed
    process. See capabilities(7) for details. Takes a whitespace-separated list of
    capability names, e.g.  CAP_SYS_ADMIN, CAP_DAC_OVERRIDE, CAP_SYS_PTRACE. Capabilities
    listed will be included in the bounding set, all others are removed. If the list of
    capabilities is prefixed with "~", all but the listed capabilities will be included,
    the effect of the assignment inverted. Note that this option also affects the
    respective capabilities in the effective, permitted and inheritable capability sets.
    If this option is not used, the capability bounding set is not modified on process
    execution, hence no limits on the capabilities of the process are enforced. This
    option may appear more than once, in which case the bounding sets are merged by OR, or
    by AND if the lines are prefixed with "~" (see below). If the empty string is assigned
    to this option, the bounding set is reset to the empty capability set, and all prior
    settings have no effect. If set to "~" (without any further argument), the bounding
    set is reset to the full set of available capabilities, also undoing any previous
    settings. This does not affect commands prefixed with "+".

    Use systemd-analyze(1)'s capability command to retrieve a list of capabilities defined
    on the local system.

    Example: if a unit has the following,

        CapabilityBoundingSet=CAP_A CAP_B
        CapabilityBoundingSet=CAP_B CAP_C

    then CAP_A, CAP_B, and CAP_C are set. If the second line is prefixed with "~", e.g.,

        CapabilityBoundingSet=CAP_A CAP_B
        CapabilityBoundingSet=~CAP_B CAP_C

    then, only CAP_A is set.
  */
  CapabilityBoundingSet?: string;

  /**
  AmbientCapabilities=
    Controls which capabilities to include in the ambient capability set for the executed
    process. Takes a whitespace-separated list of capability names, e.g.  CAP_SYS_ADMIN,
    CAP_DAC_OVERRIDE, CAP_SYS_PTRACE. This option may appear more than once, in which case
    the ambient capability sets are merged (see the above examples in
    CapabilityBoundingSet=). If the list of capabilities is prefixed with "~", all but the
    listed capabilities will be included, the effect of the assignment inverted. If the
    empty string is assigned to this option, the ambient capability set is reset to the
    empty capability set, and all prior settings have no effect. If set to "~" (without
    any further argument), the ambient capability set is reset to the full set of
    available capabilities, also undoing any previous settings. Note that adding
    capabilities to the ambient capability set adds them to the process's inherited
    capability set.

    Ambient capability sets are useful if you want to execute a process as a
    non-privileged user but still want to give it some capabilities. Note that in this
    case option keep-caps is automatically added to SecureBits= to retain the capabilities
    over the user change.  AmbientCapabilities= does not affect commands prefixed with
    "+".

    Added in version 229.
    */
  AmbientCapabilities?: string;

  /**
   * SECURITY
   */

  /**
  NoNewPrivileges=
    Takes a boolean argument. If true, ensures that the service process and all its
    children can never gain new privileges through execve() (e.g. via setuid or setgid
    bits, or filesystem capabilities). This is the simplest and most effective way to
    ensure that a process and its children can never elevate privileges again. Defaults to
    false. In case the service will be run in a new mount namespace anyway and SELinux is
    disabled, all file systems are mounted with MS_NOSUID flag. Also see No New Privileges
    Flag[4].

    Note that this setting only has an effect on the unit's processes themselves (or any
    processes directly or indirectly forked off them). It has no effect on processes
    potentially invoked on request of them through tools such as at(1), crontab(1),
    systemd-run(1), or arbitrary IPC services.

    Added in version 187.
  */
  NoNewPrivileges?: boolean;

  /**
  SecureBits=
    Controls the secure bits set for the executed process. Takes a space-separated
    combination of options from the following list: keep-caps, keep-caps-locked,
    no-setuid-fixup, no-setuid-fixup-locked, noroot, and noroot-locked. This option may
    appear more than once, in which case the secure bits are ORed. If the empty string is
    assigned to this option, the bits are reset to 0. This does not affect commands
    prefixed with "+". See capabilities(7) for details.
  */
  SecureBits?: string;

  /**
   *
   * MANDATORY ACCESS CONTROL
   * These options are only available for system services and are not supported for services
   * running in per-user instances of the service manager.
   */

  /**
  SELinuxContext=
    Set the SELinux security context of the executed process. If set, this will override
    the automated domain transition. However, the policy still needs to authorize the
    transition. This directive is ignored if SELinux is disabled. If prefixed by "-",
    failing to set the SELinux security context will be ignored, but it's still possible
    that the subsequent execve() may fail if the policy doesn't allow the transition for
    the non-overridden context. This does not affect commands prefixed with "+". See
    setexeccon(3) for details.

    Added in version 209.
  */
  SELinuxContext?: string;

  /**
  AppArmorProfile=
    Takes a profile name as argument. The process executed by the unit will switch to this
    profile when started. Profiles must already be loaded in the kernel, or the unit will
    fail. If prefixed by "-", all errors will be ignored. This setting has no effect if
    AppArmor is not enabled. This setting does not affect commands prefixed with "+".

    Added in version 210.
  */
  AppArmorProfile?: string;

  /**
  SmackProcessLabel=
    Takes a SMACK64 security label as argument. The process executed by the unit will be
    started under this label and SMACK will decide whether the process is allowed to run
    or not, based on it. The process will continue to run under the label specified here
    unless the executable has its own SMACK64EXEC label, in which case the process will
    transition to run under that label. When not specified, the label that systemd is
    running under is used. This directive is ignored if SMACK is disabled.

    The value may be prefixed by "-", in which case all errors will be ignored. An empty
    value may be specified to unset previous assignments. This does not affect commands
    prefixed with "+".

    Added in version 218.
  */
  SmackProcessLabel?: string;

  /**
   *   PROCESS PROPERTIES
   */

  /**
  LimitCPU=, LimitFSIZE=, LimitDATA=, LimitSTACK=, LimitCORE=, LimitRSS=, LimitNOFILE=,
  LimitAS=, LimitNPROC=, LimitMEMLOCK=, LimitLOCKS=, LimitSIGPENDING=, LimitMSGQUEUE=,
  LimitNICE=, LimitRTPRIO=, LimitRTTIME=
    Set soft and hard limits on various resources for executed processes. See setrlimit(2)
    for details on the process resource limit concept. Process resource limits may be
    specified in two formats: either as single value to set a specific soft and hard limit
    to the same value, or as colon-separated pair soft:hard to set both limits
    individually (e.g.  "LimitAS=4G:16G"). Use the string infinity to configure no limit
    on a specific resource. The multiplicative suffixes K, M, G, T, P and E (to the base
    1024) may be used for resource limits measured in bytes (e.g.  "LimitAS=16G"). For the
    limits referring to time values, the usual time units ms, s, min, h and so on may be
    used (see systemd.time(7) for details). Note that if no time unit is specified for
    LimitCPU= the default unit of seconds is implied, while for LimitRTTIME= the default
    unit of microseconds is implied. Also, note that the effective granularity of the
    limits might influence their enforcement. For example, time limits specified for
    LimitCPU= will be rounded up implicitly to multiples of 1s. For LimitNICE= the value
    may be specified in two syntaxes: if prefixed with "+" or "-", the value is understood
    as regular Linux nice value in the range -20...19. If not prefixed like this the value
    is understood as raw resource limit parameter in the range 0...40 (with 0 being
    equivalent to 1).

    Note that most process resource limits configured with these options are per-process,
    and processes may fork in order to acquire a new set of resources that are accounted
    independently of the original process, and may thus escape limits set. Also note that
    LimitRSS= is not implemented on Linux, and setting it has no effect. Often it is
    advisable to prefer the resource controls listed in systemd.resource-control(5) over
    these per-process limits, as they apply to services as a whole, may be altered
    dynamically at runtime, and are generally more expressive. For example, MemoryMax= is
    a more powerful (and working) replacement for LimitRSS=.

    Note that LimitNPROC= will limit the number of processes from one (real) UID and not
    the number of processes started (forked) by the service. Therefore the limit is
    cumulative for all processes running under the same UID. Please also note that the
    LimitNPROC= will not be enforced if the service is running as root (and not dropping
    privileges). Due to these limitations, TasksMax= (see systemd.resource-control(5)) is
    typically a better choice than LimitNPROC=.

    Resource limits not configured explicitly for a unit default to the value configured
    in the various DefaultLimitCPU=, DefaultLimitFSIZE=, ... options available in systemd-
    system.conf(5), and – if not configured there – the kernel or per-user defaults, as
    defined by the OS (the latter only for user services, see below).

    For system units these resource limits may be chosen freely. When these settings are
    configured in a user service (i.e. a service run by the per-user instance of the
    service manager) they cannot be used to raise the limits above those set for the user
    manager itself when it was first invoked, as the user's service manager generally
    lacks the privileges to do so. In user context these configuration options are hence
    only useful to lower the limits passed in or to raise the soft limit to the maximum of
    the hard limit as configured for the user. To raise the user's limits further, the
    available configuration mechanisms differ between operating systems, but typically
    require privileges. In most cases it is possible to configure higher per-user resource
    limits via PAM or by setting limits on the system service encapsulating the user's
    service manager, i.e. the user's instance of user@.service. After making such changes,
    make sure to restart the user's service manager.

    Table 1. Resource limit directives, their equivalent ulimit shell commands and the
    unit used
    ┌─────────────────┬───────────────────┬─────────────────────┬─────────────────────┐
    │Directive        │ ulimit equivalent │ Unit                │ Notes               │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitCPU=        │ ulimit -t         │ Seconds             │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitFSIZE=      │ ulimit -f         │ Bytes               │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitDATA=       │ ulimit -d         │ Bytes               │ Don't use. This     │
    │                 │                   │                     │ limits the allowed  │
    │                 │                   │                     │ address range, not  │
    │                 │                   │                     │ memory use!         │
    │                 │                   │                     │ Defaults to         │
    │                 │                   │                     │ unlimited and       │
    │                 │                   │                     │ should not be       │
    │                 │                   │                     │ lowered. To limit   │
    │                 │                   │                     │ memory use, see     │
    │                 │                   │                     │ MemoryMax= in       │
    │                 │                   │                     │ systemd.resource-   │
    │                 │                   │                     │ control(5).         │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitSTACK=      │ ulimit -s         │ Bytes               │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitCORE=       │ ulimit -c         │ Bytes               │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitRSS=        │ ulimit -m         │ Bytes               │ Don't use. No       │
    │                 │                   │                     │ effect on Linux.    │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitNOFILE=     │ ulimit -n         │ Number of File      │ Don't use. Be       │
    │                 │                   │ Descriptors         │ careful when        │
    │                 │                   │                     │ raising the soft    │
    │                 │                   │                     │ limit above 1024,   │
    │                 │                   │                     │ since select(2)     │
    │                 │                   │                     │ cannot function     │
    │                 │                   │                     │ with file           │
    │                 │                   │                     │ descriptors above   │
    │                 │                   │                     │ 1023 on Linux.      │
    │                 │                   │                     │ Nowadays, the hard  │
    │                 │                   │                     │ limit defaults to   │
    │                 │                   │                     │ 524288, a very high │
    │                 │                   │                     │ value compared to   │
    │                 │                   │                     │ historical          │
    │                 │                   │                     │ defaults. Typically │
    │                 │                   │                     │ applications should │
    │                 │                   │                     │ increase their soft │
    │                 │                   │                     │ limit to the hard   │
    │                 │                   │                     │ limit on their own, │
    │                 │                   │                     │ if they are OK with │
    │                 │                   │                     │ working with file   │
    │                 │                   │                     │ descriptors above   │
    │                 │                   │                     │ 1023, i.e. do not   │
    │                 │                   │                     │ use select(2). Note │
    │                 │                   │                     │ that file           │
    │                 │                   │                     │ descriptors are     │
    │                 │                   │                     │ nowadays accounted  │
    │                 │                   │                     │ like any other form │
    │                 │                   │                     │ of memory, thus     │
    │                 │                   │                     │ there should not be │
    │                 │                   │                     │ any need to lower   │
    │                 │                   │                     │ the hard limit. Use │
    │                 │                   │                     │ MemoryMax= to       │
    │                 │                   │                     │ control overall     │
    │                 │                   │                     │ service memory use, │
    │                 │                   │                     │ including file      │
    │                 │                   │                     │ descriptor memory.  │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitAS=         │ ulimit -v         │ Bytes               │ Don't use. This     │
    │                 │                   │                     │ limits the allowed  │
    │                 │                   │                     │ address range, not  │
    │                 │                   │                     │ memory use!         │
    │                 │                   │                     │ Defaults to         │
    │                 │                   │                     │ unlimited and       │
    │                 │                   │                     │ should not be       │
    │                 │                   │                     │ lowered. To limit   │
    │                 │                   │                     │ memory use, see     │
    │                 │                   │                     │ MemoryMax= in       │
    │                 │                   │                     │ systemd.resource-   │
    │                 │                   │                     │ control(5).         │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitNPROC=      │ ulimit -u         │ Number of Processes │ This limit is       │
    │                 │                   │                     │ enforced based on   │
    │                 │                   │                     │ the number of       │
    │                 │                   │                     │ processes belonging │
    │                 │                   │                     │ to the user.        │
    │                 │                   │                     │ Typically it's      │
    │                 │                   │                     │ better to track     │
    │                 │                   │                     │ processes per       │
    │                 │                   │                     │ service, i.e. use   │
    │                 │                   │                     │ TasksMax=, see      │
    │                 │                   │                     │ systemd.resource-   │
    │                 │                   │                     │ control(5).         │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitMEMLOCK=    │ ulimit -l         │ Bytes               │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitLOCKS=      │ ulimit -x         │ Number of Locks     │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitSIGPENDING= │ ulimit -i         │ Number of Queued    │ -                   │
    │                 │                   │ Signals             │                     │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitMSGQUEUE=   │ ulimit -q         │ Bytes               │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitNICE=       │ ulimit -e         │ Nice Level          │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitRTPRIO=     │ ulimit -r         │ Realtime Priority   │ -                   │
    ├─────────────────┼───────────────────┼─────────────────────┼─────────────────────┤
    │LimitRTTIME=     │ ulimit -R         │ Microseconds        │ -                   │
    └─────────────────┴───────────────────┴─────────────────────┴─────────────────────┘
  */
  LimitCPU?: number | string;
  LimitFSIZE?: number | string ;
  LimitDATA?: number | string;
  LimitSTACK?: number | string;
  LimitCORE?: number | string;
  LimitRSS?: number | string;
  LimitNOFILE?: number | string;
  LimitAS?: number | string;
  LimitNPROC?: number | string;
  LimitMEMLOCK?: number | string;
  LimitLOCKS?: number | string;
  LimitSIGPENDING?: number | string;
  LimitMSGQUEUE?: number | string;
  LimitNICE?: number | string;
  LimitRTPRIO?: number | string;
  LimitRTTIME?: number | string;

  /**
  UMask=
    Controls the file mode creation mask. Takes an access mode in octal notation. See
    umask(2) for details. Defaults to 0022 for system units. For user units the default
    value is inherited from the per-user service manager (whose default is in turn
    inherited from the system service manager, and thus typically also is 0022 — unless
    overridden by a PAM module). In order to change the per-user mask for all user
    services, consider setting the UMask= setting of the user's user@.service system
    service instance. The per-user umask may also be set via the umask field of a user's
    JSON User Record[5] (for users managed by systemd-homed.service(8) this field may be
    controlled via homectl --umask=). It may also be set via a PAM module, such as
    pam_umask(8).
  */
  UMask?: string;

  /**
  CoredumpFilter=
      Controls which types of memory mappings will be saved if the process dumps core (using
      the /proc/pid/coredump_filter file). Takes a whitespace-separated combination of
      mapping type names or numbers (with the default base 16). Mapping type names are
      private-anonymous, shared-anonymous, private-file-backed, shared-file-backed,
      elf-headers, private-huge, shared-huge, private-dax, shared-dax, and the special
      values all (all types) and default (the kernel default of "private-anonymous
      shared-anonymous elf-headers private-huge"). See core(5) for the meaning of the
      mapping types. When specified multiple times, all specified masks are ORed. When not
      set, or if the empty value is assigned, the inherited value is not changed.

      Example 2. Add DAX pages to the dump filter

          CoredumpFilter=default private-dax shared-dax

      Added in version 246.
  */
  CoredumpFilter?: string;

  /**
  KeyringMode=
    Controls how the kernel session keyring is set up for the service (see session-
    keyring(7) for details on the session keyring). Takes one of inherit, private, shared.
    If set to inherit no special keyring setup is done, and the kernel's default behaviour
    is applied. If private is used a new session keyring is allocated when a service
    process is invoked, and it is not linked up with any user keyring. This is the
    recommended setting for system services, as this ensures that multiple services
    running under the same system user ID (in particular the root user) do not share their
    key material among each other. If shared is used a new session keyring is allocated as
    for private, but the user keyring of the user configured with User= is linked into it,
    so that keys assigned to the user may be requested by the unit's processes. In this
    mode multiple units running processes under the same user ID may share key material.
    Unless inherit is selected the unique invocation ID for the unit (see below) is added
    as a protected key by the name "invocation_id" to the newly created session keyring.
    Defaults to private for services of the system service manager and to inherit for
    non-service units and for services of the user service manager.

    Added in version 235.
  */
  KeyringMode?: string;

  /**
  OOMScoreAdjust=
    Sets the adjustment value for the Linux kernel's Out-Of-Memory (OOM) killer score for
    executed processes. Takes an integer between -1000 (to disable OOM killing of
    processes of this unit) and 1000 (to make killing of processes of this unit under
    memory pressure very likely). See The /proc Filesystem[6] for details. If not
    specified defaults to the OOM score adjustment level of the service manager itself,
    which is normally at 0.

    Use the OOMPolicy= setting of service units to configure how the service manager shall
    react to the kernel OOM killer or systemd-oomd terminating a process of the service.
    See systemd.service(5) for details.
  */
  OOMScoreAdjust?: number;

  /**
  TimerSlackNSec=
    Sets the timer slack in nanoseconds for the executed processes. The timer slack
    controls the accuracy of wake-ups triggered by timers. See prctl(2) for more
    information. Note that in contrast to most other time span definitions this parameter
    takes an integer value in nano-seconds if no unit is specified. The usual time units
    are understood too.
  */
  TimerSlackNSec?: number;

  /**
  Personality=
    Controls which kernel architecture uname(2) shall report, when invoked by unit
    processes. Takes one of the architecture identifiers arm64, arm64-be, arm, arm-be,
    x86, x86-64, ppc, ppc-le, ppc64, ppc64-le, s390 or s390x. Which personality
    architectures are supported depends on the kernel's native architecture. Usually the
    64-bit versions of the various system architectures support their immediate 32-bit
    personality architecture counterpart, but no others. For example, x86-64 systems
    support the x86-64 and x86 personalities but no others. The personality feature is
    useful when running 32-bit services on a 64-bit host system. If not specified, the
    personality is left unmodified and thus reflects the personality of the host system's
    kernel. This option is not useful on architectures for which only one native word
    width was ever available, such as m68k (32-bit only) or alpha (64-bit only).

    Added in version 209.
  */
  Personality?: string;

  /**
  IgnoreSIGPIPE=
      Takes a boolean argument. If true, SIGPIPE is ignored in the executed process.
      Defaults to true since SIGPIPE is generally only useful in shell pipelines.
  */
  IgnoreSIGPIPE?: boolean;

  // SANDBOXING

  /**
  The following sandboxing options are an effective way to limit the exposure of the system
  towards the unit's processes. It is recommended to turn on as many of these options for
  each unit as is possible without negatively affecting the process' ability to operate.
  Note that many of these sandboxing features are gracefully turned off on systems where the
  underlying security mechanism is not available. For example, ProtectSystem= has no effect
  if the kernel is built without file system namespacing or if the service manager runs in a
  container manager that makes file system namespacing unavailable to its payload.
  Similarly, RestrictRealtime= has no effect on systems that lack support for SECCOMP system
  call filtering, or in containers where support for this is turned off.

  Also note that some sandboxing functionality is generally not available in user services
  (i.e. services run by the per-user service manager). Specifically, the various settings
  requiring file system namespacing support (such as ProtectSystem=) are not available, as
  the underlying kernel functionality is only accessible to privileged processes. However,
  most namespacing settings, that will not work on their own in user services, will work
  when used in conjunction with PrivateUsers=true.
  */

  /**
  ProtectSystem=
      Takes a boolean argument or the special values "full" or "strict". If true, mounts the
      /usr/ and the boot loader directories (/boot and /efi) read-only for processes invoked
      by this unit. If set to "full", the /etc/ directory is mounted read-only, too. If set
      to "strict" the entire file system hierarchy is mounted read-only, except for the API
      file system subtrees /dev/, /proc/ and /sys/ (protect these directories using
      PrivateDevices=, ProtectKernelTunables=, ProtectControlGroups=). This setting ensures
      that any modification of the vendor-supplied operating system (and optionally its
      configuration, and local mounts) is prohibited for the service. It is recommended to
      enable this setting for all long-running services, unless they are involved with
      system updates or need to modify the operating system in other ways. If this option is
      used, ReadWritePaths= may be used to exclude specific directories from being made
      read-only. This setting is implied if DynamicUser= is set. This setting cannot ensure
      protection in all cases. In general it has the same limitations as ReadOnlyPaths=, see
      below. Defaults to off.

      Added in version 214.
  */
  ProtectSystem?: boolean | "full" | "strict";

  /**
  ProtectHome=
      Takes a boolean argument or the special values "read-only" or "tmpfs". If true, the
      directories /home/, /root, and /run/user are made inaccessible and empty for processes
      invoked by this unit. If set to "read-only", the three directories are made read-only
      instead. If set to "tmpfs", temporary file systems are mounted on the three
      directories in read-only mode. The value "tmpfs" is useful to hide home directories
      not relevant to the processes invoked by the unit, while still allowing necessary
      directories to be made visible when listed in BindPaths= or BindReadOnlyPaths=.

      Setting this to "yes" is mostly equivalent to setting the three directories in
      InaccessiblePaths=. Similarly, "read-only" is mostly equivalent to ReadOnlyPaths=, and
      "tmpfs" is mostly equivalent to TemporaryFileSystem= with ":ro".

      It is recommended to enable this setting for all long-running services (in particular
      network-facing ones), to ensure they cannot get access to private user data, unless
      the services actually require access to the user's private data. This setting is
      implied if DynamicUser= is set. This setting cannot ensure protection in all cases. In
      general it has the same limitations as ReadOnlyPaths=, see below.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 214.
  */
  ProtectHome?: boolean | "read-only" | "tmpfs";

  /**
  RuntimeDirectory=, StateDirectory=, CacheDirectory=, LogsDirectory=,ConfigurationDirectory=
      These options take a whitespace-separated list of directory names. The specified
      directory names must be relative, and may not include "..". If set, when the unit is
      started, one or more directories by the specified names will be created (including
      their parents) below the locations defined in the following table. Also, the
      corresponding environment variable will be defined with the full paths of the
      directories. If multiple directories are set, then in the environment variable the
      paths are concatenated with colon (":").

      Table 2. Automatic directory creation and environment variables
      ┌────────────────────────┬────────────────┬──────────────────────┬──────────────────────────┐
      │Directory               │ Below path for │ Below path for user  │ Environment              │
      │                        │ system units   │ units                │ variable set             │
      ├────────────────────────┼────────────────┼──────────────────────┼──────────────────────────┤
      │RuntimeDirectory=       │ /run/          │ $XDG_RUNTIME_DIR     │ $RUNTIME_DIRECTORY       │
      ├────────────────────────┼────────────────┼──────────────────────┼──────────────────────────┤
      │StateDirectory=         │ /var/lib/      │ $XDG_STATE_HOME      │ $STATE_DIRECTORY         │
      ├────────────────────────┼────────────────┼──────────────────────┼──────────────────────────┤
      │CacheDirectory=         │ /var/cache/    │ $XDG_CACHE_HOME      │ $CACHE_DIRECTORY         │
      ├────────────────────────┼────────────────┼──────────────────────┼──────────────────────────┤
      │LogsDirectory=          │ /var/log/      │ $XDG_STATE_HOME/log/ │ $LOGS_DIRECTORY          │
      ├────────────────────────┼────────────────┼──────────────────────┼──────────────────────────┤
      │ConfigurationDirectory= │ /etc/          │ $XDG_CONFIG_HOME     │ $CONFIGURATION_DIRECTORY │
      └────────────────────────┴────────────────┴──────────────────────┴──────────────────────────┘
      In case of RuntimeDirectory= the innermost subdirectories are removed when the unit is
      stopped. It is possible to preserve the specified directories in this case if
      RuntimeDirectoryPreserve= is configured to restart or yes (see below). The directories
      specified with StateDirectory=, CacheDirectory=, LogsDirectory=,
      ConfigurationDirectory= are not removed when the unit is stopped.

      Except in case of ConfigurationDirectory=, the innermost specified directories will be
      owned by the user and group specified in User= and Group=. If the specified
      directories already exist and their owning user or group do not match the configured
      ones, all files and directories below the specified directories as well as the
      directories themselves will have their file ownership recursively changed to match
      what is configured. As an optimization, if the specified directories are already owned
      by the right user and group, files and directories below of them are left as-is, even
      if they do not match what is requested. The innermost specified directories will have
      their access mode adjusted to the what is specified in RuntimeDirectoryMode=,
      StateDirectoryMode=, CacheDirectoryMode=, LogsDirectoryMode= and
      ConfigurationDirectoryMode=.

      These options imply BindPaths= for the specified paths. When combined with
      RootDirectory= or RootImage= these paths always reside on the host and are mounted
      from there into the unit's file system namespace.

      If DynamicUser= is used, the logic for CacheDirectory=, LogsDirectory= and
      StateDirectory= is slightly altered: the directories are created below
      /var/cache/private, /var/log/private and /var/lib/private, respectively, which are
      host directories made inaccessible to unprivileged users, which ensures that access to
      these directories cannot be gained through dynamic user ID recycling. Symbolic links
      are created to hide this difference in behaviour. Both from perspective of the host
      and from inside the unit, the relevant directories hence always appear directly below
      /var/cache, /var/log and /var/lib.

      Use RuntimeDirectory= to manage one or more runtime directories for the unit and bind
      their lifetime to the daemon runtime. This is particularly useful for unprivileged
      daemons that cannot create runtime directories in /run/ due to lack of privileges, and
      to make sure the runtime directory is cleaned up automatically after use. For runtime
      directories that require more complex or different configuration or lifetime
      guarantees, please consider using tmpfiles.d(5).

      RuntimeDirectory=, StateDirectory=, CacheDirectory= and LogsDirectory= optionally
      support a second parameter, separated by ":". The second parameter will be interpreted
      as a destination path that will be created as a symlink to the directory. The symlinks
      will be created after any BindPaths= or TemporaryFileSystem= options have been set up,
      to make ephemeral symlinking possible. The same source can have multiple symlinks, by
      using the same first parameter, but a different second parameter.

      The directories defined by these options are always created under the standard paths
      used by systemd (/var/, /run/, /etc/, ...). If the service needs directories in a
      different location, a different mechanism has to be used to create them.

      tmpfiles.d(5) provides functionality that overlaps with these options. Using these
      options is recommended, because the lifetime of the directories is tied directly to
      the lifetime of the unit, and it is not necessary to ensure that the tmpfiles.d
      configuration is executed before the unit is started.

      To remove any of the directories created by these settings, use the systemctl clean
      ...  command on the relevant units, see systemctl(1) for details.

      Example: if a system service unit has the following,

          RuntimeDirectory=foo/bar baz

      the service manager creates /run/foo (if it does not exist), /run/foo/bar, and
      /run/baz. The directories /run/foo/bar and /run/baz except /run/foo are owned by the
      user and group specified in User= and Group=, and removed when the service is stopped.

      Example: if a system service unit has the following,

          RuntimeDirectory=foo/bar
          StateDirectory=aaa/bbb ccc

      then the environment variable "RUNTIME_DIRECTORY" is set with "/run/foo/bar", and
      "STATE_DIRECTORY" is set with "/var/lib/aaa/bbb:/var/lib/ccc".

      Example: if a system service unit has the following,

          RuntimeDirectory=foo:bar foo:baz

      the service manager creates /run/foo (if it does not exist), and /run/bar plus
      /run/baz as symlinks to /run/foo.

      Added in version 211.
  */
  RuntimeDirectory?: string;
  StateDirectory?: string;
  CacheDirectory?: string;
  LogsDirectory?: string;
  ConfigurationDirectory?: string;

  /**
  RuntimeDirectoryMode=, StateDirectoryMode=, CacheDirectoryMode=, LogsDirectoryMode=,ConfigurationDirectoryMode=
      Specifies the access mode of the directories specified in RuntimeDirectory=,
      StateDirectory=, CacheDirectory=, LogsDirectory=, or ConfigurationDirectory=,
      respectively, as an octal number. Defaults to 0755. See "Permissions" in
      path_resolution(7) for a discussion of the meaning of permission bits.

      Added in version 234.
  */
  RuntimeDirectoryMode?: string;
  StateDirectoryMode?: string;
  CacheDirectoryMode?: string;
  LogsDirectoryMode?: string;
  ConfigurationDirectoryMode?: string;

  /**
  RuntimeDirectoryPreserve=
      Takes a boolean argument or restart. If set to no (the default), the directories
      specified in RuntimeDirectory= are always removed when the service stops. If set to
      restart the directories are preserved when the service is both automatically and
      manually restarted. Here, the automatic restart means the operation specified in
      Restart=, and manual restart means the one triggered by systemctl restart foo.service.
      If set to yes, then the directories are not removed when the service is stopped. Note
      that since the runtime directory /run/ is a mount point of "tmpfs", then for system
      services the directories specified in RuntimeDirectory= are removed when the system is
      rebooted.

      Added in version 235.
  */
  RuntimeDirectoryPreserve?: boolean | "restart";

  /**
  TimeoutCleanSec=
      Configures a timeout on the clean-up operation requested through systemctl clean ...,
      see systemctl(1) for details. Takes the usual time values and defaults to infinity,
      i.e. by default no timeout is applied. If a timeout is configured the clean operation
      will be aborted forcibly when the timeout is reached, potentially leaving resources on
      disk.

      Added in version 244.
  */
  TimeoutCleanSec?: number;

  /**
  ReadWritePaths=, ReadOnlyPaths=, InaccessiblePaths=, ExecPaths=, NoExecPaths=
      Sets up a new file system namespace for executed processes. These options may be used
      to limit access a process has to the file system. Each setting takes a space-separated
      list of paths relative to the host's root directory (i.e. the system running the
      service manager). Note that if paths contain symlinks, they are resolved relative to
      the root directory set with RootDirectory=/RootImage=.

      Paths listed in ReadWritePaths= are accessible from within the namespace with the same
      access modes as from outside of it. Paths listed in ReadOnlyPaths= are accessible for
      reading only, writing will be refused even if the usual file access controls would
      permit this. Nest ReadWritePaths= inside of ReadOnlyPaths= in order to provide
      writable subdirectories within read-only directories. Use ReadWritePaths= in order to
      allow-list specific paths for write access if ProtectSystem=strict is used. Note that
      ReadWritePaths= cannot be used to gain write access to a file system whose superblock
      is mounted read-only. On Linux, for each mount point write access is granted only if
      the mount point itself and the file system superblock backing it are not marked
      read-only.  ReadWritePaths= only controls the former, not the latter, hence a
      read-only file system superblock remains protected.

      Paths listed in InaccessiblePaths= will be made inaccessible for processes inside the
      namespace along with everything below them in the file system hierarchy. This may be
      more restrictive than desired, because it is not possible to nest ReadWritePaths=,
      ReadOnlyPaths=, BindPaths=, or BindReadOnlyPaths= inside it. For a more flexible
      option, see TemporaryFileSystem=.

      Content in paths listed in NoExecPaths= are not executable even if the usual file
      access controls would permit this. Nest ExecPaths= inside of NoExecPaths= in order to
      provide executable content within non-executable directories.

      Non-directory paths may be specified as well. These options may be specified more than
      once, in which case all paths listed will have limited access from within the
      namespace. If the empty string is assigned to this option, the specific list is reset,
      and all prior assignments have no effect.

      Paths in ReadWritePaths=, ReadOnlyPaths=, InaccessiblePaths=, ExecPaths= and
      NoExecPaths= may be prefixed with "-", in which case they will be ignored when they do
      not exist. If prefixed with "+" the paths are taken relative to the root directory of
      the unit, as configured with RootDirectory=/RootImage=, instead of relative to the
      root directory of the host (see above). When combining "-" and "+" on the same path
      make sure to specify "-" first, and "+" second.

      Note that these settings will disconnect propagation of mounts from the unit's
      processes to the host. This means that this setting may not be used for services which
      shall be able to install mount points in the main mount namespace. For ReadWritePaths=
      and ReadOnlyPaths=, propagation in the other direction is not affected, i.e. mounts
      created on the host generally appear in the unit processes' namespace, and mounts
      removed on the host also disappear there too. In particular, note that mount
      propagation from host to unit will result in unmodified mounts to be created in the
      unit's namespace, i.e. writable mounts appearing on the host will be writable in the
      unit's namespace too, even when propagated below a path marked with ReadOnlyPaths=!
      Restricting access with these options hence does not extend to submounts of a
      directory that are created later on. This means the lock-down offered by that setting
      is not complete, and does not offer full protection.

      Note that the effect of these settings may be undone by privileged processes. In order
      to set up an effective sandboxed environment for a unit it is thus recommended to
      combine these settings with either CapabilityBoundingSet=~CAP_SYS_ADMIN or
      SystemCallFilter=~@mount.

      Please be extra careful when applying these options to API file systems (a list of
      them could be found in MountAPIVPS=), since they may be required for basic system
      functionalities. Moreover, /run/ needs to be writable for setting up mount namespace
      and propagation.

      Simple allow-list example using these directives:

          [Service]
          ReadOnlyPaths=/
          ReadWritePaths=/var /run
          InaccessiblePaths=-/lost+found
          NoExecPaths=/
          ExecPaths=/usr/sbin/my_daemon /usr/lib /usr/lib64

      These options are only available for system services, or for services running in
      per-user instances of the service manager in which case PrivateUsers= is implicitly
      enabled (requires unprivileged user namespaces support to be enabled in the kernel via
      the "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 231.
  */
  ReadWritePaths?: string;
  ReadOnlyPaths?: string;
  InaccessiblePaths?: string;
  ExecPaths?: string;
  NoExecPaths?: string;

  /**
  TemporaryFileSystem=
      Takes a space-separated list of mount points for temporary file systems (tmpfs). If
      set, a new file system namespace is set up for executed processes, and a temporary
      file system is mounted on each mount point. This option may be specified more than
      once, in which case temporary file systems are mounted on all listed mount points. If
      the empty string is assigned to this option, the list is reset, and all prior
      assignments have no effect. Each mount point may optionally be suffixed with a colon
      (":") and mount options such as "size=10%" or "ro". By default, each temporary file
      system is mounted with "nodev,strictatime,mode=0755". These can be disabled by
      explicitly specifying the corresponding mount options, e.g., "dev" or "nostrictatime".

      This is useful to hide files or directories not relevant to the processes invoked by
      the unit, while necessary files or directories can be still accessed by combining with
      BindPaths= or BindReadOnlyPaths=:

      Example: if a unit has the following,

          TemporaryFileSystem=/var:ro
          BindReadOnlyPaths=/var/lib/systemd

      then the invoked processes by the unit cannot see any files or directories under /var/
      except for /var/lib/systemd or its contents.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 238.
  */
  TemporaryFileSystem?: string;

  /**
  PrivateTmp=
      Takes a boolean argument. If true, sets up a new file system namespace for the
      executed processes and mounts private /tmp/ and /var/tmp/ directories inside it that
      are not shared by processes outside of the namespace. This is useful to secure access
      to temporary files of the process, but makes sharing between processes via /tmp/ or
      /var/tmp/ impossible. If true, all temporary files created by a service in these
      directories will be removed after the service is stopped. Defaults to false. It is
      possible to run two or more units within the same private /tmp/ and /var/tmp/
      namespace by using the JoinsNamespaceOf= directive, see systemd.unit(5) for details.
      This setting is implied if DynamicUser= is set. For this setting, the same
      restrictions regarding mount propagation and privileges apply as for ReadOnlyPaths=
      and related calls, see above. Enabling this setting has the side effect of adding
      Requires= and After= dependencies on all mount units necessary to access /tmp/ and
      /var/tmp/. Moreover an implicitly After= ordering on systemd-tmpfiles-setup.service(8)
      is added.

      Note that the implementation of this setting might be impossible (for example if mount
      namespaces are not available), and the unit should be written in a way that does not
      solely rely on this setting for security.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).
  */
  PrivateTmp?: boolean;

  /**
  PrivateDevices=
      Takes a boolean argument. If true, sets up a new /dev/ mount for the executed
      processes and only adds API pseudo devices such as /dev/null, /dev/zero or /dev/random
      (as well as the pseudo TTY subsystem) to it, but no physical devices such as /dev/sda,
      system memory /dev/mem, system ports /dev/port and others. This is useful to turn off
      physical device access by the executed process. Defaults to false.

      Enabling this option will install a system call filter to block low-level I/O system
      calls that are grouped in the @raw-io set, remove CAP_MKNOD and CAP_SYS_RAWIO from the
      capability bounding set for the unit, and set DevicePolicy=closed (see
      systemd.resource-control(5) for details). Note that using this setting will disconnect
      propagation of mounts from the service to the host (propagation in the opposite
      direction continues to work). This means that this setting may not be used for
      services which shall be able to install mount points in the main mount namespace. The
      new /dev/ will be mounted read-only and 'noexec'. The latter may break old programs
      which try to set up executable memory by using mmap(2) of /dev/zero instead of using
      MAP_ANON. For this setting the same restrictions regarding mount propagation and
      privileges apply as for ReadOnlyPaths= and related calls, see above.

      Note that the implementation of this setting might be impossible (for example if mount
      namespaces are not available), and the unit should be written in a way that does not
      solely rely on this setting for security.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      When access to some but not all devices must be possible, the DeviceAllow= setting
      might be used instead. See systemd.resource-control(5).

      Added in version 209.
  */
  PrivateDevices?: boolean;

  /**
  PrivateNetwork=
      Takes a boolean argument. If true, sets up a new network namespace for the executed
      processes and configures only the loopback network device "lo" inside it. No other
      network devices will be available to the executed process. This is useful to turn off
      network access by the executed process. Defaults to false. It is possible to run two
      or more units within the same private network namespace by using the JoinsNamespaceOf=
      directive, see systemd.unit(5) for details. Note that this option will disconnect all
      socket families from the host, including AF_NETLINK and AF_UNIX. Effectively, for
      AF_NETLINK this means that device configuration events received from systemd-
      udevd.service(8) are not delivered to the unit's processes. And for AF_UNIX this has
      the effect that AF_UNIX sockets in the abstract socket namespace of the host will
      become unavailable to the unit's processes (however, those located in the file system
      will continue to be accessible).

      Note that the implementation of this setting might be impossible (for example if
      network namespaces are not available), and the unit should be written in a way that
      does not solely rely on this setting for security.

      When this option is enabled, PrivateMounts= is implied unless it is explicitly
      disabled, and /sys will be remounted to associate it with the new network namespace.

      When this option is used on a socket unit any sockets bound on behalf of this unit
      will be bound within a private network namespace. This may be combined with
      JoinsNamespaceOf= to listen on sockets inside of network namespaces of other services.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).
  */
  PrivateNetwork?: boolean;

  /**
  NetworkNamespacePath=
      Takes an absolute file system path referring to a Linux network namespace pseudo-file
      (i.e. a file like /proc/$PID/ns/net or a bind mount or symlink to one). When set the
      invoked processes are added to the network namespace referenced by that path. The path
      has to point to a valid namespace file at the moment the processes are forked off. If
      this option is used PrivateNetwork= has no effect. If this option is used together
      with JoinsNamespaceOf= then it only has an effect if this unit is started before any
      of the listed units that have PrivateNetwork= or NetworkNamespacePath= configured, as
      otherwise the network namespace of those units is reused.

      When this option is enabled, PrivateMounts= is implied unless it is explicitly
      disabled, and /sys will be remounted to associate it with the new network namespace.

      When this option is used on a socket unit any sockets bound on behalf of this unit
      will be bound within the specified network namespace.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 242.
  */
  NetworkNamespacePath?: string;

  /**
  PrivateIPC=
      Takes a boolean argument. If true, sets up a new IPC namespace for the executed
      processes. Each IPC namespace has its own set of System V IPC identifiers and its own
      POSIX message queue file system. This is useful to avoid name clash of IPC
      identifiers. Defaults to false. It is possible to run two or more units within the
      same private IPC namespace by using the JoinsNamespaceOf= directive, see
      systemd.unit(5) for details.

      Note that IPC namespacing does not have an effect on AF_UNIX sockets, which are the
      most common form of IPC used on Linux. Instead, AF_UNIX sockets in the file system are
      subject to mount namespacing, and those in the abstract namespace are subject to
      network namespacing. IPC namespacing only has an effect on SysV IPC (which is mostly
      legacy) as well as POSIX message queues (for which AF_UNIX/SOCK_SEQPACKET sockets are
      typically a better replacement). IPC namespacing also has no effect on POSIX shared
      memory (which is subject to mount namespacing) either. See ipc_namespaces(7) for the
      details.

      Note that the implementation of this setting might be impossible (for example if IPC
      namespaces are not available), and the unit should be written in a way that does not
      solely rely on this setting for security.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 248.
  */
  PrivateIPC?: boolean;

  /**
  IPCNamespacePath=
      Takes an absolute file system path referring to a Linux IPC namespace pseudo-file
      (i.e. a file like /proc/$PID/ns/ipc or a bind mount or symlink to one). When set the
      invoked processes are added to the network namespace referenced by that path. The path
      has to point to a valid namespace file at the moment the processes are forked off. If
      this option is used PrivateIPC= has no effect. If this option is used together with
      JoinsNamespaceOf= then it only has an effect if this unit is started before any of the
      listed units that have PrivateIPC= or IPCNamespacePath= configured, as otherwise the
      network namespace of those units is reused.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 248.
  */
  IPCNamespacePath?: string;

  /**
  MemoryKSM=
      Takes a boolean argument. When set, it enables KSM (kernel samepage merging) for the
      processes. KSM is a memory-saving de-duplication feature. Anonymous memory pages with
      identical content can be replaced by a single write-protected page. This feature
      should only be enabled for jobs that share the same security domain. For details, see
      Kernel Samepage Merging[7] in the kernel documentation.

      Note that this functionality might not be available, for example if KSM is disabled in
      the kernel, or the kernel doesn't support controlling KSM at the process level through
      prctl(2).

      Added in version 254.
  */
  MemoryKSM?: boolean;

  /**
  PrivateUsers=
      Takes a boolean argument. If true, sets up a new user namespace for the executed
      processes and configures a minimal user and group mapping, that maps the "root" user
      and group as well as the unit's own user and group to themselves and everything else
      to the "nobody" user and group. This is useful to securely detach the user and group
      databases used by the unit from the rest of the system, and thus to create an
      effective sandbox environment. All files, directories, processes, IPC objects and
      other resources owned by users/groups not equaling "root" or the unit's own will stay
      visible from within the unit but appear owned by the "nobody" user and group. If this
      mode is enabled, all unit processes are run without privileges in the host user
      namespace (regardless if the unit's own user/group is "root" or not). Specifically
      this means that the process will have zero process capabilities on the host's user
      namespace, but full capabilities within the service's user namespace. Settings such as
      CapabilityBoundingSet= will affect only the latter, and there's no way to acquire
      additional capabilities in the host's user namespace. Defaults to off.

      When this setting is set up by a per-user instance of the service manager, the mapping
      of the "root" user and group to itself is omitted (unless the user manager is root).
      Additionally, in the per-user instance manager case, the user namespace will be set up
      before most other namespaces. This means that combining PrivateUsers=true with other
      namespaces will enable use of features not normally supported by the per-user
      instances of the service manager.

      This setting is particularly useful in conjunction with RootDirectory=/RootImage=, as
      the need to synchronize the user and group databases in the root directory and on the
      host is reduced, as the only users and groups who need to be matched are "root",
      "nobody" and the unit's own user and group.

      Note that the implementation of this setting might be impossible (for example if user
      namespaces are not available), and the unit should be written in a way that does not
      solely rely on this setting for security.

      Added in version 232.
  */
  PrivateUsers?: boolean;

  /**
  ProtectHostname=
      Takes a boolean argument. When set, sets up a new UTS namespace for the executed
      processes. In addition, changing hostname or domainname is prevented. Defaults to off.

      Note that the implementation of this setting might be impossible (for example if UTS
      namespaces are not available), and the unit should be written in a way that does not
      solely rely on this setting for security.

      Note that when this option is enabled for a service hostname changes no longer
      propagate from the system into the service, it is hence not suitable for services that
      need to take notice of system hostname changes dynamically.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 242.
  */
  ProtectHostname?: boolean;

  /**
  ProtectClock=
      Takes a boolean argument. If set, writes to the hardware clock or system clock will be
      denied. Defaults to off. Enabling this option removes CAP_SYS_TIME and CAP_WAKE_ALARM
      from the capability bounding set for this unit, installs a system call filter to block
      calls that can set the clock, and DeviceAllow=char-rtc r is implied. Note that the
      system calls are blocked altogether, the filter does not take into account that some
      of the calls can be used to read the clock state with some parameter combinations.
      Effectively, /dev/rtc0, /dev/rtc1, etc. are made read-only to the service. See
      systemd.resource-control(5) for the details about DeviceAllow=.

      It is recommended to turn this on for most services that do not need modify the clock
      or check its state.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 245.
  */
  ProtectClock?: boolean;

  /**
  ProtectKernelTunables=
      Takes a boolean argument. If true, kernel variables accessible through /proc/sys/,
      /sys/, /proc/sysrq-trigger, /proc/latency_stats, /proc/acpi, /proc/timer_stats,
      /proc/fs and /proc/irq will be made read-only to all processes of the unit. Usually,
      tunable kernel variables should be initialized only at boot-time, for example with the
      sysctl.d(5) mechanism. Few services need to write to these at runtime; it is hence
      recommended to turn this on for most services. For this setting the same restrictions
      regarding mount propagation and privileges apply as for ReadOnlyPaths= and related
      calls, see above. Defaults to off. Note that this option does not prevent indirect
      changes to kernel tunables effected by IPC calls to other processes. However,
      InaccessiblePaths= may be used to make relevant IPC file system objects inaccessible.
      If ProtectKernelTunables= is set, MountAPIVFS=yes is implied.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 232.
  */
  ProtectKernelTunables?: boolean;

  /**
  ProtectKernelModules=
      Takes a boolean argument. If true, explicit module loading will be denied. This allows
      module load and unload operations to be turned off on modular kernels. It is
      recommended to turn this on for most services that do not need special file systems or
      extra kernel modules to work. Defaults to off. Enabling this option removes
      CAP_SYS_MODULE from the capability bounding set for the unit, and installs a system
      call filter to block module system calls, also /usr/lib/modules is made inaccessible.
      For this setting the same restrictions regarding mount propagation and privileges
      apply as for ReadOnlyPaths= and related calls, see above. Note that limited automatic
      module loading due to user configuration or kernel mapping tables might still happen
      as side effect of requested user operations, both privileged and unprivileged. To
      disable module auto-load feature please see sysctl.d(5) kernel.modules_disabled
      mechanism and /proc/sys/kernel/modules_disabled documentation.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 232.
  */
  ProtectKernelModules?: boolean;

  /**
  ProtectKernelLogs=
      Takes a boolean argument. If true, access to the kernel log ring buffer will be
      denied. It is recommended to turn this on for most services that do not need to read
      from or write to the kernel log ring buffer. Enabling this option removes CAP_SYSLOG
      from the capability bounding set for this unit, and installs a system call filter to
      block the syslog(2) system call (not to be confused with the libc API syslog(3) for
      userspace logging). The kernel exposes its log buffer to userspace via /dev/kmsg and
      /proc/kmsg. If enabled, these are made inaccessible to all the processes in the unit.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 244.
  */
  ProtectKernelLogs?: boolean;

  /**
  ProtectControlGroups=
      Takes a boolean argument. If true, the Linux Control Groups (cgroups(7)) hierarchies
      accessible through /sys/fs/cgroup/ will be made read-only to all processes of the
      unit. Except for container managers no services should require write access to the
      control groups hierarchies; it is hence recommended to turn this on for most services.
      For this setting the same restrictions regarding mount propagation and privileges
      apply as for ReadOnlyPaths= and related calls, see above. Defaults to off. If
      ProtectControlGroups= is set, MountAPIVFS=yes is implied.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 232.
  */
  ProtectControlGroups?: boolean;

  /**
  RestrictAddressFamilies=
      Restricts the set of socket address families accessible to the processes of this unit.
      Takes "none", or a space-separated list of address family names to allow-list, such as
      AF_UNIX, AF_INET or AF_INET6. When "none" is specified, then all address families will
      be denied. When prefixed with "~" the listed address families will be applied as deny
      list, otherwise as allow list. Note that this restricts access to the socket(2) system
      call only. Sockets passed into the process by other means (for example, by using
      socket activation with socket units, see systemd.socket(5)) are unaffected. Also,
      sockets created with socketpair() (which creates connected AF_UNIX sockets only) are
      unaffected. Note that this option has no effect on 32-bit x86, s390, s390x, mips,
      mips-le, ppc, ppc-le, ppc64, ppc64-le and is ignored (but works correctly on other
      ABIs, including x86-64). Note that on systems supporting multiple ABIs (such as
      x86/x86-64) it is recommended to turn off alternative ABIs for services, so that they
      cannot be used to circumvent the restrictions of this option. Specifically, it is
      recommended to combine this option with SystemCallArchitectures=native or similar. By
      default, no restrictions apply, all address families are accessible to processes. If
      assigned the empty string, any previous address family restriction changes are undone.
      This setting does not affect commands prefixed with "+".

      Use this option to limit exposure of processes to remote access, in particular via
      exotic and sensitive network protocols, such as AF_PACKET. Note that in most cases,
      the local AF_UNIX address family should be included in the configured allow list as it
      is frequently used for local communication, including for syslog(2) logging.

      Added in version 211.
  */
  RestrictAddressFamilies?: string;

  /**
  RestrictFileSystems=
      Restricts the set of filesystems processes of this unit can open files on. Takes a
      space-separated list of filesystem names. Any filesystem listed is made accessible to
      the unit's processes, access to filesystem types not listed is prohibited
      (allow-listing). If the first character of the list is "~", the effect is inverted:
      access to the filesystems listed is prohibited (deny-listing). If the empty string is
      assigned, access to filesystems is not restricted.

      If you specify both types of this option (i.e. allow-listing and deny-listing), the
      first encountered will take precedence and will dictate the default action (allow
      access to the filesystem or deny it). Then the next occurrences of this option will
      add or delete the listed filesystems from the set of the restricted filesystems,
      depending on its type and the default action.

      Example: if a unit has the following,

          RestrictFileSystems=ext4 tmpfs
          RestrictFileSystems=ext2 ext4

      then access to ext4, tmpfs, and ext2 is allowed and access to other filesystems is
      denied.

      Example: if a unit has the following,

          RestrictFileSystems=ext4 tmpfs
          RestrictFileSystems=~ext4

      then only access tmpfs is allowed.

      Example: if a unit has the following,

          RestrictFileSystems=~ext4 tmpfs
          RestrictFileSystems=ext4

      then only access to tmpfs is denied.

      As the number of possible filesystems is large, predefined sets of filesystems are
      provided. A set starts with "@" character, followed by name of the set.

      Table 3. Currently predefined filesystem sets
      ┌──────────────────┬──────────────────────────────────┐
      │Set               │ Description                      │
      ├──────────────────┼──────────────────────────────────┤
      │@basic-api        │ Basic filesystem API.            │
      ├──────────────────┼──────────────────────────────────┤
      │@auxiliary-api    │ Auxiliary filesystem API.        │
      ├──────────────────┼──────────────────────────────────┤
      │@common-block     │ Common block device filesystems. │
      ├──────────────────┼──────────────────────────────────┤
      │@historical-block │ Historical block device          │
      │                  │ filesystems.                     │
      ├──────────────────┼──────────────────────────────────┤
      │@network          │ Well-known network filesystems.  │
      ├──────────────────┼──────────────────────────────────┤
      │@privileged-api   │ Privileged filesystem API.       │
      ├──────────────────┼──────────────────────────────────┤
      │@temporary        │ Temporary filesystems: tmpfs,    │
      │                  │ ramfs.                           │
      ├──────────────────┼──────────────────────────────────┤
      │@known            │ All known filesystems defined by │
      │                  │ the kernel. This list is defined │
      │                  │ statically in systemd based on a │
      │                  │ kernel version that was          │
      │                  │ available when this systemd      │
      │                  │ version was released. It will    │
      │                  │ become progressively more        │
      │                  │ out-of-date as the kernel is     │
      │                  │ updated.                         │
      └──────────────────┴──────────────────────────────────┘
      Use systemd-analyze(1)'s filesystems command to retrieve a list of filesystems defined
      on the local system.

      Note that this setting might not be supported on some systems (for example if the LSM
      eBPF hook is not enabled in the underlying kernel or if not using the unified control
      group hierarchy). In that case this setting has no effect.

      This option cannot be bypassed by prefixing "+" to the executable path in the service
      unit, as it applies to the whole control group.

      Added in version 250.
  */
  RestrictFileSystems?: string;

  /**
  RestrictNamespaces=
      Restricts access to Linux namespace functionality for the processes of this unit. For
      details about Linux namespaces, see namespaces(7). Either takes a boolean argument, or
      a space-separated list of namespace type identifiers. If false (the default), no
      restrictions on namespace creation and switching are made. If true, access to any kind
      of namespacing is prohibited. Otherwise, a space-separated list of namespace type
      identifiers must be specified, consisting of any combination of: cgroup, ipc, net,
      mnt, pid, user and uts. Any namespace type listed is made accessible to the unit's
      processes, access to namespace types not listed is prohibited (allow-listing). By
      prepending the list with a single tilde character ("~") the effect may be inverted:
      only the listed namespace types will be made inaccessible, all unlisted ones are
      permitted (deny-listing). If the empty string is assigned, the default namespace
      restrictions are applied, which is equivalent to false. This option may appear more
      than once, in which case the namespace types are merged by OR, or by AND if the lines
      are prefixed with "~" (see examples below). Internally, this setting limits access to
      the unshare(2), clone(2) and setns(2) system calls, taking the specified flags
      parameters into account. Note that — if this option is used — in addition to
      restricting creation and switching of the specified types of namespaces (or all of
      them, if true) access to the setns() system call with a zero flags parameter is
      prohibited. This setting is only supported on x86, x86-64, mips, mips-le, mips64,
      mips64-le, mips64-n32, mips64-le-n32, ppc64, ppc64-le, s390 and s390x, and enforces no
      restrictions on other architectures.

      Example: if a unit has the following,

          RestrictNamespaces=cgroup ipc
          RestrictNamespaces=cgroup net

      then cgroup, ipc, and net are set. If the second line is prefixed with "~", e.g.,

          RestrictNamespaces=cgroup ipc
          RestrictNamespaces=~cgroup net

      then, only ipc is set.

      Added in version 233.
  */
  RestrictNamespaces?: string | boolean;

  /**
  LockPersonality=
      Takes a boolean argument. If set, locks down the personality(2) system call so that
      the kernel execution domain may not be changed from the default or the personality
      selected with Personality= directive. This may be useful to improve security, because
      odd personality emulations may be poorly tested and source of vulnerabilities.

      Added in version 235.
  */
  LockPersonality?: boolean;

  /**
  MemoryDenyWriteExecute=
      Takes a boolean argument. If set, attempts to create memory mappings that are writable
      and executable at the same time, or to change existing memory mappings to become
      executable, or mapping shared memory segments as executable, are prohibited.
      Specifically, a system call filter is added (or preferably, an equivalent kernel check
      is enabled with prctl(2)) that rejects mmap(2) system calls with both PROT_EXEC and
      PROT_WRITE set, mprotect(2) or pkey_mprotect(2) system calls with PROT_EXEC set and
      shmat(2) system calls with SHM_EXEC set. Note that this option is incompatible with
      programs and libraries that generate program code dynamically at runtime, including
      JIT execution engines, executable stacks, and code "trampoline" feature of various C
      compilers. This option improves service security, as it makes harder for software
      exploits to change running code dynamically. However, the protection can be
      circumvented, if the service can write to a filesystem, which is not mounted with
      noexec (such as /dev/shm), or it can use memfd_create(). This can be prevented by
      making such file systems inaccessible to the service (e.g.
      InaccessiblePaths=/dev/shm) and installing further system call filters
      (SystemCallFilter=~memfd_create). Note that this feature is fully available on x86-64,
      and partially on x86. Specifically, the shmat() protection is not available on x86.
      Note that on systems supporting multiple ABIs (such as x86/x86-64) it is recommended
      to turn off alternative ABIs for services, so that they cannot be used to circumvent
      the restrictions of this option. Specifically, it is recommended to combine this
      option with SystemCallArchitectures=native or similar.

      Added in version 231.
  */
  MemoryDenyWriteExecute?: boolean;

  /**
  RestrictRealtime=
      Takes a boolean argument. If set, any attempts to enable realtime scheduling in a
      process of the unit are refused. This restricts access to realtime task scheduling
      policies such as SCHED_FIFO, SCHED_RR or SCHED_DEADLINE. See sched(7) for details
      about these scheduling policies. Realtime scheduling policies may be used to
      monopolize CPU time for longer periods of time, and may hence be used to lock up or
      otherwise trigger Denial-of-Service situations on the system. It is hence recommended
      to restrict access to realtime scheduling to the few programs that actually require
      them. Defaults to off.

      Added in version 231.
  */
  RestrictRealtime?: boolean;

  /**
  RestrictSUIDSGID=
      Takes a boolean argument. If set, any attempts to set the set-user-ID (SUID) or
      set-group-ID (SGID) bits on files or directories will be denied (for details on these
      bits see inode(7)). As the SUID/SGID bits are mechanisms to elevate privileges, and
      allow users to acquire the identity of other users, it is recommended to restrict
      creation of SUID/SGID files to the few programs that actually require them. Note that
      this restricts marking of any type of file system object with these bits, including
      both regular files and directories (where the SGID is a different meaning than for
      files, see documentation). This option is implied if DynamicUser= is enabled. Defaults
      to off.

      Added in version 242.
  */
  RestrictSUIDSGID?: boolean;

  /**
  RemoveIPC=
      Takes a boolean parameter. If set, all System V and POSIX IPC objects owned by the
      user and group the processes of this unit are run as are removed when the unit is
      stopped. This setting only has an effect if at least one of User=, Group= and
      DynamicUser= are used. It has no effect on IPC objects owned by the root user.
      Specifically, this removes System V semaphores, as well as System V and POSIX shared
      memory segments and message queues. If multiple units use the same user or group the
      IPC objects are removed when the last of these units is stopped. This setting is
      implied if DynamicUser= is set.

      This option is only available for system services and is not supported for services
      running in per-user instances of the service manager.

      Added in version 232.
  */
  RemoveIPC?: boolean;

  /**
  PrivateMounts=
      Takes a boolean parameter. If set, the processes of this unit will be run in their own
      private file system (mount) namespace with all mount propagation from the processes
      towards the host's main file system namespace turned off. This means any file system
      mount points established or removed by the unit's processes will be private to them
      and not be visible to the host. However, file system mount points established or
      removed on the host will be propagated to the unit's processes. See
      mount_namespaces(7) for details on file system namespaces. Defaults to off.

      When turned on, this executes three operations for each invoked process: a new
      CLONE_NEWNS namespace is created, after which all existing mounts are remounted to
      MS_SLAVE to disable propagation from the unit's processes to the host (but leaving
      propagation in the opposite direction in effect). Finally, the mounts are remounted
      again to the propagation mode configured with MountFlags=, see below.

      File system namespaces are set up individually for each process forked off by the
      service manager. Mounts established in the namespace of the process created by
      ExecStartPre= will hence be cleaned up automatically as soon as that process exits and
      will not be available to subsequent processes forked off for ExecStart= (and similar
      applies to the various other commands configured for units). Similarly,
      JoinsNamespaceOf= does not permit sharing kernel mount namespaces between units, it
      only enables sharing of the /tmp/ and /var/tmp/ directories.

      Other file system namespace unit settings — PrivateMounts=, PrivateTmp=,
      PrivateDevices=, ProtectSystem=, ProtectHome=, ReadOnlyPaths=, InaccessiblePaths=,
      ReadWritePaths=, ... — also enable file system namespacing in a fashion equivalent to
      this option. Hence it is primarily useful to explicitly request this behaviour if none
      of the other settings are used.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).

      Added in version 239.
  */
  PrivateMounts?: boolean;

  /**
  MountFlags=
      Takes a mount propagation setting: shared, slave or private, which controls whether
      file system mount points in the file system namespaces set up for this unit's
      processes will receive or propagate mounts and unmounts from other file system
      namespaces. See mount(2) for details on mount propagation, and the three propagation
      flags in particular.

      This setting only controls the final propagation setting in effect on all mount points
      of the file system namespace created for each process of this unit. Other file system
      namespacing unit settings (see the discussion in PrivateMounts= above) will implicitly
      disable mount and unmount propagation from the unit's processes towards the host by
      changing the propagation setting of all mount points in the unit's file system
      namespace to slave first. Setting this option to shared does not reestablish
      propagation in that case.

      If not set – but file system namespaces are enabled through another file system
      namespace unit setting – shared mount propagation is used, but — as mentioned — as
      slave is applied first, propagation from the unit's processes to the host is still
      turned off.

      It is not recommended to use private mount propagation for units, as this means
      temporary mounts (such as removable media) of the host will stay mounted and thus
      indefinitely busy in forked off processes, as unmount propagation events won't be
      received by the file system namespace of the unit.

      Usually, it is best to leave this setting unmodified, and use higher level file system
      namespacing options instead, in particular PrivateMounts=, see above.

      This option is only available for system services, or for services running in per-user
      instances of the service manager in which case PrivateUsers= is implicitly enabled
      (requires unprivileged user namespaces support to be enabled in the kernel via the
      "kernel.unprivileged_userns_clone=" sysctl).
  */
  MountFlags?: string;

  /**
   * ENVIRONMENT
   */
  /**
  Environment=
    Sets environment variables for executed processes. Each line is unquoted using the
    rules described in "Quoting" section in systemd.syntax(7) and becomes a list of
    variable assignments. If you need to assign a value containing spaces or the equals
    sign to a variable, put quotes around the whole assignment. Variable expansion is not
    performed inside the strings and the "$" character has no special meaning. Specifier
    expansion is performed, see the "Specifiers" section in systemd.unit(5).

    This option may be specified more than once, in which case all listed variables will
    be set. If the same variable is listed twice, the later setting will override the
    earlier setting. If the empty string is assigned to this option, the list of
    environment variables is reset, all prior assignments have no effect.

    The names of the variables can contain ASCII letters, digits, and the underscore
    character. Variable names cannot be empty or start with a digit. In variable values,
    most characters are allowed, but non-printable characters are currently rejected.

    Example:

        Environment="VAR1=word1 word2" VAR2=word3 "VAR3=$word 5 6"

    gives three variables "VAR1", "VAR2", "VAR3" with the values "word1 word2", "word3",
    "$word 5 6".

    See environ(7) for details about environment variables.

    Note that environment variables are not suitable for passing secrets (such as
    passwords, key material, ...) to service processes. Environment variables set for a
    unit are exposed to unprivileged clients via D-Bus IPC, and generally not understood
    as being data that requires protection. Moreover, environment variables are propagated
    down the process tree, including across security boundaries (such as setuid/setgid
    executables), and hence might leak to processes that should not have access to the
    secret data. Use LoadCredential=, LoadCredentialEncrypted= or SetCredentialEncrypted=
    (see below) to pass data to unit processes securely.
  */
  Environment?: string[] | string;

  /**
  EnvironmentFile=
    Similar to Environment=, but reads the environment variables from a text file. The
    text file should contain newline-separated variable assignments. Empty lines, lines
    without an "=" separator, or lines starting with ";" or "#" will be ignored, which may
    be used for commenting. The file must be encoded with UTF-8. Valid characters are
    unicode scalar values[8] other than unicode noncharacters[9], U+0000 NUL, and U+FEFF
    unicode byte order mark[10]. Control codes other than NUL are allowed.

    In the file, an unquoted value after the "=" is parsed with the same backslash-escape
    rules as POSIX shell unquoted text[11], but unlike in a shell, interior whitespace is
    preserved and quotes after the first non-whitespace character are preserved. Leading
    and trailing whitespace (space, tab, carriage return) is discarded, but interior
    whitespace within the line is preserved verbatim. A line ending with a backslash will
    be continued to the following one, with the newline itself discarded. A backslash "\"
    followed by any character other than newline will preserve the following character, so
    that "\\" will become the value "\".

    In the file, a "'"-quoted value after the "=" can span multiple lines and contain any
    character verbatim other than single quote, like POSIX shell single-quoted text[12].
    No backslash-escape sequences are recognized. Leading and trailing whitespace outside
    of the single quotes is discarded.

    In the file, a """-quoted value after the "=" can span multiple lines, and the same
    escape sequences are recognized as in POSIX shell double-quoted text[13]. Backslash
    ("\") followed by any of ""\`$" will preserve that character. A backslash followed by
    newline is a line continuation, and the newline itself is discarded. A backslash
    followed by any other character is ignored; both the backslash and the following
    character are preserved verbatim. Leading and trailing whitespace outside of the
    double quotes is discarded.

    The argument passed should be an absolute filename or wildcard expression, optionally
    prefixed with "-", which indicates that if the file does not exist, it will not be
    read and no error or warning message is logged. This option may be specified more than
    once in which case all specified files are read. If the empty string is assigned to
    this option, the list of file to read is reset, all prior assignments have no effect.

    The files listed with this directive will be read shortly before the process is
    executed (more specifically, after all processes from a previous unit state
    terminated. This means you can generate these files in one unit state, and read it
    with this option in the next. The files are read from the file system of the service
    manager, before any file system changes like bind mounts take place).

    Settings from these files override settings made with Environment=. If the same
    variable is set twice from these files, the files will be read in the order they are
    specified and the later setting will override the earlier setting.
  */
  EnvironmentFile?: string[] | string;

  /**
  PassEnvironment=
    Pass environment variables set for the system service manager to executed processes.
    Takes a space-separated list of variable names. This option may be specified more than
    once, in which case all listed variables will be passed. If the empty string is
    assigned to this option, the list of environment variables to pass is reset, all prior
    assignments have no effect. Variables specified that are not set for the system
    manager will not be passed and will be silently ignored. Note that this option is only
    relevant for the system service manager, as system services by default do not
    automatically inherit any environment variables set for the service manager itself.
    However, in case of the user service manager all environment variables are passed to
    the executed processes anyway, hence this option is without effect for the user
    service manager.

    Variables set for invoked processes due to this setting are subject to being
    overridden by those configured with Environment= or EnvironmentFile=.

    Example:

        PassEnvironment=VAR1 VAR2 VAR3

    passes three variables "VAR1", "VAR2", "VAR3" with the values set for those variables
    in PID1.

    See environ(7) for details about environment variables.

    Added in version 228.
  */
  PassEnvironment?: string[] | string;

  /**
  UnsetEnvironment=
    Explicitly unset environment variable assignments that would normally be passed from
    the service manager to invoked processes of this unit. Takes a space-separated list of
    variable names or variable assignments. This option may be specified more than once,
    in which case all listed variables/assignments will be unset. If the empty string is
    assigned to this option, the list of environment variables/assignments to unset is
    reset. If a variable assignment is specified (that is: a variable name, followed by
    "=", followed by its value), then any environment variable matching this precise
    assignment is removed. If a variable name is specified (that is a variable name
    without any following "=" or value), then any assignment matching the variable name,
    regardless of its value is removed. Note that the effect of UnsetEnvironment= is
    applied as final step when the environment list passed to executed processes is
    compiled. That means it may undo assignments from any configuration source, including
    assignments made through Environment= or EnvironmentFile=, inherited from the system
    manager's global set of environment variables, inherited via PassEnvironment=, set by
    the service manager itself (such as $NOTIFY_SOCKET and such), or set by a PAM module
    (in case PAMName= is used).

    See "Environment Variables in Spawned Processes" below for a description of how those
    settings combine to form the inherited environment. See environ(7) for general
    information about environment variables.

    Added in version 235.
  */
  UnsetEnvironment?: string[] | string;
}

export const ExecSectionSchema = implement<ExecSectionConfig>().with({
  ExecSearchPath: z.string().optional(),
  WorkingDirectory: z.string().optional(),
  RootDirectory: z.string().optional(),
  RootImage: z.string().optional(),
  RootImageOptions: z.string().optional(),
  RootEphemeral: z.boolean().optional(),
  RootHash: z.string().optional(),
  RootHashSignature: z.string().optional(),
  RootVerity: z.string().optional(),
  RootImagePolicy: z.string().optional(),
  MountImagePolicy: z.string().optional(),
  ExtensionImagePolicy: z.string().optional(),
  MountAPIVFS: z.boolean().optional(),
  ProtectProc: z.enum([
    "noaccess",
    "invisible",
    "ptraceable",
    "default",
  ]).optional(),
  ProcSubset: z.enum([
    "all",
    "pid",
  ]).optional(),
  BindPaths: z.string().optional(),
  BindReadOnlyPaths: z.string().optional(),
  MountImages: z.string().optional(),
  ExtensionImages: z.string().optional(),
  ExtensionDirectories: z.string().optional(),
  User: z.string().optional(),
  Group: z.string().optional(),
  DynamicUser: z.boolean().optional(),
  SupplementaryGroups: z.string().optional(),
  SetLoginEnvironment: z.boolean().optional(),
  PAMName: z.string().optional(),
  CapabilityBoundingSet: z.string().optional(),
  AmbientCapabilities: z.string().optional(),

  // SECURITY
  NoNewPrivileges: z.boolean().optional(),
  SecureBits: z.string().optional(),

  // MANDATORY ACCESS CONTROL
  SELinuxContext: z.string().optional(),
  AppArmorProfile: z.string().optional(),
  SmackProcessLabel: z.string().optional(),

  // PROCESS PROPERTIES
  LimitCPU: z.union([z.string(), z.number()]).optional(),
  LimitFSIZE: z.union([z.string(), z.number()]).optional(),
  LimitDATA: z.union([z.string(), z.number()]).optional(),
  LimitSTACK: z.union([z.string(), z.number()]).optional(),
  LimitCORE: z.union([z.string(), z.number()]).optional(),
  LimitRSS: z.union([z.string(), z.number()]).optional(),
  LimitNOFILE: z.union([z.string(), z.number()]).optional(),
  LimitAS: z.union([z.string(), z.number()]).optional(),
  LimitNPROC: z.union([z.string(), z.number()]).optional(),
  LimitMEMLOCK: z.union([z.string(), z.number()]).optional(),
  LimitLOCKS: z.union([z.string(), z.number()]).optional(),
  LimitSIGPENDING: z.union([z.string(), z.number()]).optional(),
  LimitMSGQUEUE: z.union([z.string(), z.number()]).optional(),
  LimitNICE: z.union([z.string(), z.number()]).optional(),
  LimitRTPRIO: z.union([z.string(), z.number()]).optional(),
  LimitRTTIME: z.union([z.string(), z.number()]).optional(),
  UMask: z.string().optional(),
  CoredumpFilter: z.string().optional(),
  KeyringMode: z.string().optional(),
  OOMScoreAdjust: z.number().optional(),
  TimerSlackNSec: z.number().optional(),
  Personality: z.string().optional(),
  IgnoreSIGPIPE: z.boolean().optional(),

  // SANDBOXING
  ProtectSystem: z.union([z.boolean(), z.literal("full"), z.literal("strict")]).optional(),
  ProtectHome: z.union([z.boolean(), z.literal("read-only"), z.literal("tmpfs")]).optional(),
  RuntimeDirectory: z.string().optional(),
  StateDirectory: z.string().optional(),
  CacheDirectory: z.string().optional(),
  LogsDirectory: z.string().optional(),
  ConfigurationDirectory: z.string().optional(),
  RuntimeDirectoryMode: z.string().optional(),
  StateDirectoryMode: z.string().optional(),
  CacheDirectoryMode: z.string().optional(),
  LogsDirectoryMode: z.string().optional(),
  ConfigurationDirectoryMode: z.string().optional(),
  RuntimeDirectoryPreserve: z.union([z.boolean(), z.literal("restart")]).optional(),
  TimeoutCleanSec: z.number().optional(),
  ReadWritePaths: z.string().optional(),
  ReadOnlyPaths: z.string().optional(),
  InaccessiblePaths: z.string().optional(),
  ExecPaths: z.string().optional(),
  NoExecPaths: z.string().optional(),
  TemporaryFileSystem: z.string().optional(),
  PrivateTmp: z.boolean().optional(),
  PrivateDevices: z.boolean().optional(),
  PrivateNetwork: z.boolean().optional(),
  NetworkNamespacePath: z.string().optional(),
  PrivateIPC: z.boolean().optional(),
  IPCNamespacePath: z.string().optional(),
  MemoryKSM: z.boolean().optional(),
  PrivateUsers: z.boolean().optional(),
  ProtectHostname: z.boolean().optional(),
  ProtectClock: z.boolean().optional(),
  ProtectKernelTunables: z.boolean().optional(),
  ProtectKernelModules: z.boolean().optional(),
  ProtectKernelLogs: z.boolean().optional(),
  ProtectControlGroups: z.boolean().optional(),
  RestrictAddressFamilies: z.union([z.string(), z.literal("none")]).optional(),
  RestrictFileSystems: z.string().optional(),
  RestrictNamespaces: z.union([z.string(), z.boolean()]).optional(),
  LockPersonality: z.boolean().optional(),
  MemoryDenyWriteExecute: z.boolean().optional(),
  RestrictRealtime: z.boolean().optional(),
  RestrictSUIDSGID: z.boolean().optional(),
  RemoveIPC: z.boolean().optional(),
  PrivateMounts: z.boolean().optional(),
  MountFlags: z.string().optional(),

  // ENVIRONMENT
  Environment: z.union([z.string(), z.array(z.string())]).optional(),
  EnvironmentFile: z.union([z.string(), z.array(z.string())]).optional(),
  PassEnvironment: z.union([z.string(), z.array(z.string())]).optional(),
  UnsetEnvironment: z.union([z.string(), z.array(z.string())]).optional(),
});

export class ExecSectionBuilder {
  public section: ExecSectionConfig = {};

  /**
   * Set ExecSearchPath
   * @see {@link ExecSectionConfig.ExecSearchPath}
   */
  public setExecSearchPath(value?: string): this {
    this.section.ExecSearchPath = value;
    return this;
  }

  /**
   * Set WorkingDirectory
   * @see {@link ExecSectionConfig.WorkingDirectory}
   */
  public setWorkingDirectory(value?: string): this {
    this.section.WorkingDirectory = value;
    return this;
  }

  /**
   * Set RootDirectory
   * @see {@link ExecSectionConfig.RootDirectory}
   */
  public setRootDirectory(value?: string): this {
    this.section.RootDirectory = value;
    return this;
  }

  /**
   * Set RootImage
   * @see {@link ExecSectionConfig.RootImage}
   */
  public setRootImage(value?: string): this {
    this.section.RootImage = value;
    return this;
  }

  /**
   * Set RootImageOptions
   * @see {@link ExecSectionConfig.RootImageOptions}
   */
  public setRootImageOptions(value?: string): this {
    this.section.RootImageOptions = value;
    return this;
  }

  /**
   * Set RootEphemeral
   * @see {@link ExecSectionConfig.RootEphemeral}
   */
  public setRootEphemeral(value?: boolean): this {
    this.section.RootEphemeral = value;
    return this;
  }

  /**
   * Set RootHash
   * @see {@link ExecSectionConfig.RootHash}
   */
  public setRootHash(value?: string): this {
    this.section.RootHash = value;
    return this;
  }

  /**
   * Set RootHashSignature
   * @see {@link ExecSectionConfig.RootHashSignature}
   */
  public setRootHashSignature(value?: string): this {
    this.section.RootHashSignature = value;
    return this;
  }

  /**
   * Set RootVerity
   * @see {@link ExecSectionConfig.RootVerity}
   */
  public setRootVerity(value?: string): this {
    this.section.RootVerity = value;
    return this;
  }

  /**
   * Set RootImagePolicy
   * @see {@link ExecSectionConfig.RootImagePolicy}
   */
  public setRootImagePolicy(value?: string): this {
    this.section.RootImagePolicy = value;
    return this;
  }

  /**
   * Set MountImagePolicy
   * @see {@link ExecSectionConfig.MountImagePolicy}
   */
  public setMountImagePolicy(value?: string): this {
    this.section.MountImagePolicy = value;
    return this;
  }

  /**
   * Set ExtensionImagePolicy
   * @see {@link ExecSectionConfig.ExtensionImagePolicy}
   */
  public setExtensionImagePolicy(value?: string): this {
    this.section.ExtensionImagePolicy = value;
    return this;
  }

  /**
   * Set MountAPIVFS
   * @see {@link ExecSectionConfig.MountAPIVFS}
   */
  public setMountAPIVFS(value?: boolean): this {
    this.section.MountAPIVFS = value;
    return this;
  }

  /**
   * Set ProtectProc
   * @see {@link ExecSectionConfig.ProtectProc}
   */

  public setProtectProc(value?: "default" | "invisible" | "noaccess" | "ptraceable"): this {
    this.section.ProtectProc = value;
    return this;
  }

  /**
   * Set ProcSubset
   * @see {@link ExecSectionConfig.ProcSubset}
   */
  public setProcSubset(value?: "all" | "pid"): this {
    this.section.ProcSubset = value;
    return this;
  }

  /**
   * Set BindPaths
   * @see {@link ExecSectionConfig.BindPaths}
   */
  public setBindPaths(value?: string): this {
    this.section.BindPaths = value;
    return this;
  }

  /**
   * Set BindReadOnlyPaths
   * @see {@link ExecSectionConfig.BindReadOnlyPaths}
   */
  public setBindReadOnlyPaths(value?: string): this {
    this.section.BindReadOnlyPaths = value;
    return this;
  }

  /**
   * Set MountImages
   * @see {@link ExecSectionConfig.MountImages}
   */
  public setMountImages(value?: string): this {
    this.section.MountImages = value;
    return this;
  }

  /**
   * Set ExtensionImages
   * @see {@link ExecSectionConfig.ExtensionImages}
   */
  public setExtensionImages(value?: string): this {
    this.section.ExtensionImages = value;
    return this;
  }

  /**
   * Set ExtensionDirectories
   * @see {@link ExecSectionConfig.ExtensionDirectories}
   */
  public setExtensionDirectories(value?: string): this {
    this.section.ExtensionDirectories = value;
    return this;
  }

  /**
   * Set User
   * @see {@link ExecSectionConfig.User}
   */
  public setUser(value?: string): this {
    this.section.User = value;
    return this;
  }

  /**
   * Set Group
   * @see {@link ExecSectionConfig.Group}
   */
  public setGroup(value?: string): this {
    this.section.Group = value;
    return this;
  }

  /**
   * Set DynamicUser
   * @see {@link ExecSectionConfig.DynamicUser}
   */
  public setDynamicUser(value?: boolean): this {
    this.section.DynamicUser = value;
    return this;
  }

  /**
   * Set SupplementaryGroups
   * @see {@link ExecSectionConfig.SupplementaryGroups}
   */
  public setSupplementaryGroups(value?: string): this {
    this.section.SupplementaryGroups = value;
    return this;
  }

  /**
   * Set SetLoginEnvironment
   * @see {@link ExecSectionConfig.SetLoginEnvironment}
   */
  public setSetLoginEnvironment(value?: boolean): this {
    this.section.SetLoginEnvironment = value;
    return this;
  }

  /**
   * Set PAMName
   * @see {@link ExecSectionConfig.PAMName}
   */
  public setPAMName(value?: string): this {
    this.section.PAMName = value;
    return this;
  }

  /**
   * Set CapabilityBoundingSet
   * @see {@link ExecSectionConfig.CapabilityBoundingSet}
   */
  public setCapabilityBoundingSet(value?: string): this {
    this.section.CapabilityBoundingSet = value;
    return this;
  }

  /**
   * Set AmbientCapabilities
   * @see {@link ExecSectionConfig.AmbientCapabilities}
   */
  public setAmbientCapabilities(value?: string): this {
    this.section.AmbientCapabilities = value;
    return this;
  }

  /**
   * Set NoNewPrivileges
   * @see {@link ExecSectionConfig.NoNewPrivileges}
   */
  public setNoNewPrivileges(value?: boolean): this {
    this.section.NoNewPrivileges = value;
    return this;
  }

  /**
   * Set SecureBits
   * @see {@link ExecSectionConfig.SecureBits}
   */
  public setSecureBits(value?: string): this {
    this.section.SecureBits = value;
    return this;
  }

  // SANDBOXING
  /**
   * Set ProtectSystem
   * @see {@link ExecSectionConfig.ProtectSystem}
   */
  public setProtectSystem(value?: boolean | "full" | "strict"): this {
    this.section.ProtectSystem = value;
    return this;
  }

  /**
   * Set ProtectHome
   * @see {@link ExecSectionConfig.ProtectHome}
   */
  public setProtectHome(value?: boolean | "read-only" | "tmpfs"): this {
    this.section.ProtectHome = value;
    return this;
  }

  /**
   * Set RuntimeDirectory
   * @see {@link ExecSectionConfig.RuntimeDirectory}
   */
  public setRuntimeDirectory(value?: string): this {
    this.section.RuntimeDirectory = value;
    return this;
  }

  /**
   * Set StateDirectory
   * @see {@link ExecSectionConfig.StateDirectory}
   */
  public setStateDirectory(value?: string): this {
    this.section.StateDirectory = value;
    return this;
  }

  /**
   * Set CacheDirectory
   * @see {@link ExecSectionConfig.CacheDirectory}
   */
  public setCacheDirectory(value?: string): this {
    this.section.CacheDirectory = value;
    return this;
  }

  /**
   * Set LogsDirectory
   * @see {@link ExecSectionConfig.LogsDirectory}
   */
  public setLogsDirectory(value?: string): this {
    this.section.LogsDirectory = value;
    return this;
  }

  /**
   * Set ConfigurationDirectory
   * @see {@link ExecSectionConfig.ConfigurationDirectory}
   */
  public setConfigurationDirectory(value?: string): this {
    this.section.ConfigurationDirectory = value;
    return this;
  }

  /**
   * Set RuntimeDirectoryMode
   * @see {@link ExecSectionConfig.RuntimeDirectoryMode}
   */
  public setRuntimeDirectoryMode(value?: string): this {
    this.section.RuntimeDirectoryMode = value;
    return this;
  }

  /**
   * Set StateDirectoryMode
   * @see {@link ExecSectionConfig.StateDirectoryMode}
   */
  public setStateDirectoryMode(value?: string): this {
    this.section.StateDirectoryMode = value;
    return this;
  }

  /**
   * Set CacheDirectoryMode
   * @see {@link ExecSectionConfig.CacheDirectoryMode}
   */
  public setCacheDirectoryMode(value?: string): this {
    this.section.CacheDirectoryMode = value;
    return this;
  }

  /**
   * Set LogsDirectoryMode
   * @see {@link ExecSectionConfig.LogsDirectoryMode}
   */
  public setLogsDirectoryMode(value?: string): this {
    this.section.LogsDirectoryMode = value;
    return this;
  }

  /**
   * Set ConfigurationDirectoryMode
   * @see {@link ExecSectionConfig.ConfigurationDirectoryMode}
   */
  public setConfigurationDirectoryMode(value?: string): this {
    this.section.ConfigurationDirectoryMode = value;
    return this;
  }

  /**
   * Set RuntimeDirectoryPreserve
   * @see {@link ExecSectionConfig.RuntimeDirectoryPreserve}
   */
  public setRuntimeDirectoryPreserve(value?: boolean | "restart"): this {
    this.section.RuntimeDirectoryPreserve = value;
    return this;
  }

  /**
   * Set TimeoutCleanSec
   * @see {@link ExecSectionConfig.TimeoutCleanSec}
   */
  public setTimeoutCleanSec(value?: number): this {
    this.section.TimeoutCleanSec = value;
    return this;
  }

  /**
   * Set ReadWritePaths
   * @see {@link ExecSectionConfig.ReadWritePaths}
   */
  public setReadWritePaths(value?: string): this {
    this.section.ReadWritePaths = value;
    return this;
  }

  /**
   * Set ReadOnlyPaths
   * @see {@link ExecSectionConfig.ReadOnlyPaths}
   */
  public setReadOnlyPaths(value?: string): this {
    this.section.ReadOnlyPaths = value;
    return this;
  }

  /**
   * Set InaccessiblePaths
   * @see {@link ExecSectionConfig.InaccessiblePaths}
   */
  public setInaccessiblePaths(value?: string): this {
    this.section.InaccessiblePaths = value;
    return this;
  }

  /**
   * Set ExecPaths
   * @see {@link ExecSectionConfig.ExecPaths}
   */
  public setExecPaths(value?: string): this {
    this.section.ExecPaths = value;
    return this;
  }

  /**
   * Set NoExecPaths
   * @see {@link ExecSectionConfig.NoExecPaths}
   */
  public setNoExecPaths(value?: string): this {
    this.section.NoExecPaths = value;
    return this;
  }

  /**
   * Set TemporaryFileSystem
   * @see {@link ExecSectionConfig.TemporaryFileSystem}
   */
  public setTemporaryFileSystem(value?: string): this {
    this.section.TemporaryFileSystem = value;
    return this;
  }

  /**
   * Set PrivateTmp
   * @see {@link ExecSectionConfig.PrivateTmp}
   */
  public setPrivateTmp(value?: boolean): this {
    this.section.PrivateTmp = value;
    return this;
  }

  /**
   * Set PrivateDevices
   * @see {@link ExecSectionConfig.PrivateDevices}
   */
  public setPrivateDevices(value?: boolean): this {
    this.section.PrivateDevices = value;
    return this;
  }

  /**
   * Set PrivateNetwork
   * @see {@link ExecSectionConfig.PrivateNetwork}
   */
  public setPrivateNetwork(value?: boolean): this {
    this.section.PrivateNetwork = value;
    return this;
  }

  /**
   * Set NetworkNamespacePath
   * @see {@link ExecSectionConfig.NetworkNamespacePath}
   */
  public setNetworkNamespacePath(value?: string): this {
    this.section.NetworkNamespacePath = value;
    return this;
  }

  /**
   * Set PrivateIPC
   * @see {@link ExecSectionConfig.PrivateIPC}
   */
  public setPrivateIPC(value?: boolean): this {
    this.section.PrivateIPC = value;
    return this;
  }

  /**
   * Set IPCNamespacePath
   * @see {@link ExecSectionConfig.IPCNamespacePath}
   */
  public setIPCNamespacePath(value?: string): this {
    this.section.IPCNamespacePath = value;
    return this;
  }

  /**
   * Set MemoryKSM
   * @see {@link ExecSectionConfig.MemoryKSM}
   */
  public setMemoryKSM(value?: boolean): this {
    this.section.MemoryKSM = value;
    return this;
  }

  /**
   * Set PrivateUsers
   * @see {@link ExecSectionConfig.PrivateUsers}
   */
  public setPrivateUsers(value?: boolean): this {
    this.section.PrivateUsers = value;
    return this;
  }

  /**
   * Set ProtectHostname
   * @see {@link ExecSectionConfig.ProtectHostname}
   */
  public setProtectHostname(value?: boolean): this {
    this.section.ProtectHostname = value;
    return this;
  }

  /**
   * Set ProtectClock
   * @see {@link ExecSectionConfig.ProtectClock}
   */
  public setProtectClock(value?: boolean): this {
    this.section.ProtectClock = value;
    return this;
  }

  /**
   * Set ProtectKernelTunables
   * @see {@link ExecSectionConfig.ProtectKernelTunables}
   */
  public setProtectKernelTunables(value?: boolean): this {
    this.section.ProtectKernelTunables = value;
    return this;
  }

  /**
   * Set ProtectKernelModules
   * @see {@link ExecSectionConfig.ProtectKernelModules}
   */
  public setProtectKernelModules(value?: boolean): this {
    this.section.ProtectKernelModules = value;
    return this;
  }

  /**
   * Set ProtectKernelLogs
   * @see {@link ExecSectionConfig.ProtectKernelLogs}
   */
  public setProtectKernelLogs(value?: boolean): this {
    this.section.ProtectKernelLogs = value;
    return this;
  }

  /**
   * Set ProtectControlGroups
   * @see {@link ExecSectionConfig.ProtectControlGroups}
   */
  public setProtectControlGroups(value?: boolean): this {
    this.section.ProtectControlGroups = value;
    return this;
  }

  /**
   * Set RestrictAddressFamilies
   * @see {@link ExecSectionConfig.RestrictAddressFamilies}
   */
  public setRestrictAddressFamilies(value?: string): this {
    this.section.RestrictAddressFamilies = value;
    return this;
  }

  /**
   * Set RestrictFileSystems
   * @see {@link ExecSectionConfig.RestrictFileSystems}
   */
  public setRestrictFileSystems(value?: string): this {
    this.section.RestrictFileSystems = value;
    return this;
  }

  /**
   * Set RestrictNamespaces
   * @see {@link ExecSectionConfig.RestrictNamespaces}
   */
  public setRestrictNamespaces(value?: string | boolean): this {
    this.section.RestrictNamespaces = value;
    return this;
  }

  /**
   * Set LockPersonality
   * @see {@link ExecSectionConfig.LockPersonality}
   */
  public setLockPersonality(value?: boolean): this {
    this.section.LockPersonality = value;
    return this;
  }

  /**
   * Set MemoryDenyWriteExecute
   * @see {@link ExecSectionConfig.MemoryDenyWriteExecute}
   */
  public setMemoryDenyWriteExecute(value?: boolean): this {
    this.section.MemoryDenyWriteExecute = value;
    return this;
  }

  /**
   * Set RestrictRealtime
   * @see {@link ExecSectionConfig.RestrictRealtime}
   */
  public setRestrictRealtime(value?: boolean): this {
    this.section.RestrictRealtime = value;
    return this;
  }

  /**
   * Set RestrictSUIDSGID
   * @see {@link ExecSectionConfig.RestrictSUIDSGID}
   */
  public setRestrictSUIDSGID(value?: boolean): this {
    this.section.RestrictSUIDSGID = value;
    return this;
  }

  /**
   * Set RemoveIPC
   * @see {@link ExecSectionConfig.RemoveIPC}
   */
  public setRemoveIPC(value?: boolean): this {
    this.section.RemoveIPC = value;
    return this;
  }

  /**
   * Set PrivateMounts
   * @see {@link ExecSectionConfig.PrivateMounts}
   */
  public setPrivateMounts(value?: boolean): this {
    this.section.PrivateMounts = value;
    return this;
  }

  /**
   * Set MountFlags
   * @see {@link ExecSectionConfig.MountFlags}
   */
  public setMountFlags(value?: string): this {
    this.section.MountFlags = value;
    return this;
  }

  /**
   * Set Environment
   * @see {@link ExecSectionConfig.Environment}
   */
  public setEnvironment(value?: string[] | string): this {
    this.section.Environment = value;
    return this;
  }

  /**
   * Set EnvironmentFile
   * @see {@link ExecSectionConfig.EnvironmentFile}
   */
  public setEnvironmentFile(value?: string[] | string): this {
    this.section.EnvironmentFile = value;
    return this;
  }

  /**
   * Set PassEnvironment
   * @see {@link ExecSectionConfig.PassEnvironment}
   */
  public setPassEnvironment(value?: string[] | string): this {
    this.section.PassEnvironment = value;
    return this;
  }

  /**
   * Set UnsetEnvironment
   * @see {@link ExecSectionConfig.UnsetEnvironment}
   */
  public setUnsetEnvironment(value?: string[] | string): this {
    this.section.UnsetEnvironment = value;
    return this;
  }

  /**
   * Set SELinuxContext
   * @see {@link ExecSectionConfig.SELinuxContext}
   */
  public setSELinuxContext(value?: string): this {
    this.section.SELinuxContext = value;
    return this;
  }

  /**
   * Set AppArmorProfile
   * @see {@link ExecSectionConfig.AppArmorProfile}
   */
  public setAppArmorProfile(value?: string): this {
    this.section.AppArmorProfile = value;
    return this;
  }

  /**
   * Set SmackProcessLabel
   * @see {@link ExecSectionConfig.SmackProcessLabel}
   */
  public setSmackProcessLabel(value?: string): this {
    this.section.SmackProcessLabel = value;
    return this;
  }
}
