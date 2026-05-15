import { z } from "zod";
import { implement } from "./utils.js";

type ResourceLimit = number | "infinity" | `${number}${"%" | "G" | "K" | "M" | "T"}`;

/**
 * @see https://manpages.ubuntu.com/manpages/resolute/man5/systemd.resource-control.5.html
 */
export interface ResourceSectionConfig {
  /**
  CPUAccounting=
    Turn on CPU usage accounting for this unit. Takes a boolean argument. Note that
    turning on CPU accounting for one unit will also implicitly turn it on for all units
    contained in the same slice and for all its parent slices and the units contained
    therein. The system default for this setting may be controlled with
    DefaultCPUAccounting= in systemd-system.conf(5).

    Under the unified cgroup hierarchy, CPU accounting is available for all units and this
    setting has no effect.

    Added in version 208.
  */
  CPUAccounting?: boolean;

  /**
  CPUWeight=weight, StartupCPUWeight=weight
    These settings control the cpu controller in the unified hierarchy.

    These options accept an integer value or a the special string "idle":

    •   If set to an integer value, assign the specified CPU time weight to the processes
        executed, if the unified control group hierarchy is used on the system. These
        options control the "cpu.weight" control group attribute. The allowed range is 1
        to 10000. Defaults to unset, but the kernel default is 100. For details about this
        control group attribute, see Control Groups v2[2] and CFS Scheduler[3]. The
        available CPU time is split up among all units within one slice relative to their
        CPU time weight. A higher weight means more CPU time, a lower weight means less.

    •   If set to the special string "idle", mark the cgroup for "idle scheduling", which
        means that it will get CPU resources only when there are no processes not marked
        in this way to execute in this cgroup or its siblings. This setting corresponds to
        the "cpu.idle" cgroup attribute.

        Note that this value only has an effect on cgroup-v2, for cgroup-v1 it is
        equivalent to the minimum weight.

    While StartupCPUWeight= applies to the startup and shutdown phases of the system,
    CPUWeight= applies to normal runtime of the system, and if the former is not set also
    to the startup and shutdown phases. Using StartupCPUWeight= allows prioritizing
    specific services at boot-up and shutdown differently than during normal runtime.

    Added in version 232.
  */
  CPUWeight?: number | "idle";
  StartupCPUWeight?: number | "idle";

  /**
  CPUQuota=
    This setting controls the cpu controller in the unified hierarchy.

    Assign the specified CPU time quota to the processes executed. Takes a percentage
    value, suffixed with "%". The percentage specifies how much CPU time the unit shall
    get at maximum, relative to the total CPU time available on one CPU. Use values > 100%
    for allotting CPU time on more than one CPU. This controls the "cpu.max" attribute on
    the unified control group hierarchy and "cpu.cfs_quota_us" on legacy. Setting
    CPUQuota= to an empty value unsets the quota.

    Example: CPUQuota=20% ensures that the executed processes will never get more than 20%
    CPU time on one CPU.

    Added in version 213.
  */
  CPUQuota?: string;

  /**
  CPUQuotaPeriodSec=
    This setting controls the cpu controller in the unified hierarchy.

    Assign the duration over which the CPU time quota specified by CPUQuota= is measured.
    Takes a time duration value in seconds, with an optional suffix such as "ms" for
    milliseconds (or "s" for seconds.) The default setting is 100ms. The period is clamped
    to the range supported by the kernel, which is [1ms, 1000ms]. Additionally, the period
    is adjusted up so that the quota interval is also at least 1ms. Setting
    CPUQuotaPeriodSec= to an empty value resets it to the default.

    Added in version 242.
  */
  CPUQuotaPeriodSec?: number | string;

  /**
  AllowedCPUs=, StartupAllowedCPUs=
    This setting controls the cpuset controller in the unified hierarchy.

    Restrict processes to be executed on specific CPUs. Takes a list of CPU indices or
    ranges separated by either whitespace or commas. CPU ranges are specified by the lower
    and upper CPU indices separated by a dash.

    Setting AllowedCPUs= or StartupAllowedCPUs= doesn't guarantee that all of the CPUs
    will be used by the processes as it may be limited by parent units. The effective
    configuration is reported as EffectiveCPUs=.

    While StartupAllowedCPUs= applies to the startup and shutdown phases of the system,
    AllowedCPUs= applies to normal runtime of the system, and if the former is not set
    also to the startup and shutdown phases.

    This setting is supported only with the unified control group hierarchy.

    Added in version 244.
  */
  AllowedCPUs?: string;
  StartupAllowedCPUs?: string;

  /**
  MemoryAccounting=
    This setting controls the memory controller in the unified hierarchy.

    Turn on process and kernel memory accounting for this unit. Takes a boolean argument.
    Note that turning on memory accounting for one unit will also implicitly turn it on
    for all units contained in the same slice and for all its parent slices and the units
    contained therein. The system default for this setting may be controlled with
    DefaultMemoryAccounting= in systemd-system.conf(5).

    Added in version 208.
  */
  MemoryAccounting?: boolean;

  /**
  MemoryMin=bytes, MemoryLow=bytes, StartupMemoryLow=bytes, DefaultStartupMemoryLow=bytes
    These settings control the memory controller in the unified hierarchy.

    Specify the memory usage protection of the executed processes in this unit. When
    reclaiming memory, the unit is treated as if it was using less memory resulting in
    memory to be preferentially reclaimed from unprotected units. Using MemoryLow= results
    in a weaker protection where memory may still be reclaimed to avoid invoking the OOM
    killer in case there is no other reclaimable memory.

    For a protection to be effective, it is generally required to set a corresponding
    allocation on all ancestors, which is then distributed between children (with the
    exception of the root slice). Any MemoryMin= or MemoryLow= allocation that is not
    explicitly distributed to specific children is used to create a shared protection for
    all children.

    Takes a memory size in bytes. If the value is suffixed with K, M, G or T, the
    specified memory size is parsed as Kilobytes, Megabytes, Gigabytes, or Terabytes (with
    the base 1024), respectively. Alternatively, a percentage value may be specified,
    which is taken relative to the installed physical memory on the system. If assigned
    the special value "infinity", all available memory is protected. This controls the
    "memory.min" or "memory.low" control group attribute.

    Units may have their children use a default "memory.min" or "memory.low" value by
    specifying DefaultMemoryMin= or DefaultMemoryLow=, which has the same semantics as
    MemoryMin= and MemoryLow=, or DefaultStartupMemoryLow= which has the same semantics as
    StartupMemoryLow=. This setting does not affect "memory.min" or "memory.low" in the
    unit itself. Using it to set a default child allocation is only useful on kernels
    older than 5.7, which do not support the "memory_recursiveprot" cgroup2 mount option.

    While StartupMemoryLow= applies to the startup and shutdown phases of the system,
    MemoryMin= applies to normal runtime of the system.

    Added in version 240.
  */
  MemoryMin?: ResourceLimit;
  DefaultMemoryMin?: ResourceLimit;
  MemoryLow?: ResourceLimit;
  DefaultMemoryLow?: ResourceLimit;
  StartupMemoryLow?: ResourceLimit;
  DefaultStartupMemoryLow?: ResourceLimit;

  /**
  MemoryHigh=bytes, StartupMemoryHigh=bytes
    These settings control the memory controller in the unified hierarchy.

    Specify the throttling limit on memory usage of the executed processes in this unit.
    Memory usage may go above the limit if unavoidable, but the processes are heavily
    slowed down and memory is taken away aggressively in such cases. This is the main
    mechanism to control memory usage of a unit.

    Takes a memory size in bytes. If the value is suffixed with K, M, G or T, the
    specified memory size is parsed as Kilobytes, Megabytes, Gigabytes, or Terabytes (with
    the base 1024), respectively. Alternatively, a percentage value may be specified,
    which is taken relative to the installed physical memory on the system. If assigned
    the special value "infinity", no memory throttling is applied. This controls the
    "memory.high" control group attribute.

    Added in version 231.
  */
  MemoryHigh?: ResourceLimit;
  StartupMemoryHigh?: ResourceLimit;

  /**
  MemoryMax=bytes, StartupMemoryMax=bytes
    These settings control the memory controller in the unified hierarchy.

    Specify the absolute limit on memory usage of the executed processes in this unit. If
    memory usage cannot be contained under the limit, out-of-memory killer is invoked
    inside the unit. It is recommended to use MemoryHigh= as the main control mechanism
    and use MemoryMax= as the last line of defense.

    Takes a memory size in bytes. If the value is suffixed with K, M, G or T, the
    specified memory size is parsed as Kilobytes, Megabytes, Gigabytes, or Terabytes (with
    the base 1024), respectively. Alternatively, a percentage value may be specified,
    which is taken relative to the installed physical memory on the system. If assigned
    the special value "infinity", no memory limit is applied. This controls the
    "memory.max" control group attribute.

    Added in version 231.
  */
  MemoryMax?: ResourceLimit;
  StartupMemoryMax?: ResourceLimit;

  /**
  MemorySwapMax=bytes, StartupMemorySwapMax=bytes
    These settings control the memory controller in the unified hierarchy.

    Specify the absolute limit on swap usage of the executed processes in this unit.

    Takes a swap size in bytes. If the value is suffixed with K, M, G or T, the specified
    swap size is parsed as Kilobytes, Megabytes, Gigabytes, or Terabytes (with the base
    1024), respectively. If assigned the special value "infinity", no swap limit is
    applied. These settings control the "memory.swap.max" control group attribute.

    Added in version 232.
  */
  MemorySwapMax?: ResourceLimit;
  StartupMemorySwapMax?: ResourceLimit;

  /**
  MemoryZSwapMax=bytes, StartupMemoryZSwapMax=bytes
    These settings control the memory controller in the unified hierarchy.

    Specify the absolute limit on zswap usage of the processes in this unit. Zswap is a
    lightweight compressed cache for swap pages. It takes pages that are in the process of
    being swapped out and attempts to compress them into a dynamically allocated RAM-based
    memory pool. If the limit specified is hit, no entries from this unit will be stored
    in the pool until existing entries are faulted back or written out to disk.

    Takes a size in bytes. If the value is suffixed with K, M, G or T, the specified size
    is parsed as Kilobytes, Megabytes, Gigabytes, or Terabytes (with the base 1024),
    respectively. If assigned the special value "infinity", no limit is applied. These
    settings control the "memory.zswap.max" control group attribute.

    Added in version 253.
  */
  MemoryZSwapMax?: ResourceLimit;
  StartupMemoryZSwapMax?: ResourceLimit;

  /**
  MemoryZSwapWriteback=
    This setting controls the memory controller in the unified hierarchy.

    Takes a boolean argument. When true, pages stored in the Zswap cache are permitted to
    be written to the backing storage, false otherwise. Defaults to true. This allows
    disabling writeback of swap pages for IO-intensive applications, while retaining the
    ability to store compressed pages in Zswap.

    Added in version 256.
  */
  MemoryZSwapWriteback?: boolean;

  /**
  AllowedMemoryNodes=, StartupAllowedMemoryNodes=
    These settings control the cpuset controller in the unified hierarchy.

    Restrict processes to be executed on specific memory NUMA nodes. Takes a list of
    memory NUMA nodes indices or ranges separated by either whitespace or commas. Memory
    NUMA nodes ranges are specified by the lower and upper NUMA nodes indices separated by
    a dash.

    Setting AllowedMemoryNodes= or StartupAllowedMemoryNodes= doesn't guarantee that all
    of the memory NUMA nodes will be used by the processes as it may be limited by parent
    units. The effective configuration is reported as EffectiveMemoryNodes=.

    This setting is supported only with the unified control group hierarchy.

    Added in version 244.
  */
  AllowedMemoryNodes?: string;
  StartupAllowedMemoryNodes?: string;

  /**
  TasksAccounting=
    This setting controls the pids controller in the unified hierarchy.

    Turn on task accounting for this unit. Takes a boolean argument. If enabled, the
    kernel will keep track of the total number of tasks in the unit and its children. This
    number includes both kernel threads and userspace processes, with each thread counted
    individually. Note that turning on tasks accounting for one unit will also implicitly
    turn it on for all units contained in the same slice and for all its parent slices and
    the units contained therein. The system default for this setting may be controlled
    with DefaultTasksAccounting= in systemd-system.conf(5).

    Added in version 227.
  */
  TasksAccounting?: boolean;

  /**
  TasksMax=N
    This setting controls the pids controller in the unified hierarchy.

    Specify the maximum number of tasks that may be created in the unit. This ensures that
    the number of tasks accounted for the unit stays below a specific limit. This either
    takes an absolute number of tasks or a percentage value that is taken relative to the
    configured maximum number of tasks on the system. If assigned the special value
    "infinity", no tasks limit is applied. This controls the "pids.max" control group
    attribute.

    The system default for this setting may be controlled with DefaultTasksMax= in
    systemd-system.conf(5).

    Added in version 227.
  */
  TasksMax?: number | "infinity" | `${number}%`;

  /**
  IOAccounting=
    This setting controls the io controller in the unified hierarchy.

    Turn on Block I/O accounting for this unit, if the unified control group hierarchy is
    used on the system. Takes a boolean argument. Note that turning on block I/O
    accounting for one unit will also implicitly turn it on for all units contained in the
    same slice and all for its parent slices and the units contained therein. The system
    default for this setting may be controlled with DefaultIOAccounting= in
    systemd-system.conf(5).

    Added in version 230.
  */
  IOAccounting?: boolean;

  /**
  IOWeight=weight, StartupIOWeight=weight
    These settings control the io controller in the unified hierarchy.

    Set the default overall block I/O weight for the executed processes, if the unified
    control group hierarchy is used on the system. Takes a single weight value (between 1
    and 10000) to set the default block I/O weight. This controls the "io.weight" control
    group attribute, which defaults to 100. The available I/O bandwidth is split up among
    all units within one slice relative to their block I/O weight. A higher weight means
    more I/O bandwidth, a lower weight means less.

    While StartupIOWeight= applies to the startup and shutdown phases of the system,
    IOWeight= applies to the later runtime of the system.

    Added in version 230.
  */
  IOWeight?: number;
  StartupIOWeight?: number;

  /**
  IODeviceWeight=device weight
    This setting controls the io controller in the unified hierarchy.

    Set the per-device overall block I/O weight for the executed processes, if the unified
    control group hierarchy is used on the system. Takes a space-separated pair of a file
    path and a weight value to specify the device specific weight value, between 1 and
    10000. (Example: "/dev/sda 1000"). The file path may be specified as path to a block
    device node or as any other file, in which case the backing block device of the file
    system of the file is determined. This controls the "io.weight" control group
    attribute, which defaults to 100. Use this option multiple times to set weights for
    multiple devices.

    Added in version 230.
  */
  IODeviceWeight?: string | string[];

  /**
  IOReadBandwidthMax=device bytes, IOWriteBandwidthMax=device bytes
    These settings control the io controller in the unified hierarchy.

    Set the per-device overall block I/O bandwidth maximum limit for the executed
    processes, if the unified control group hierarchy is used on the system. This limit is
    not work-conserving and the executed processes are not allowed to use more even if the
    device has idle capacity. Takes a space-separated pair of a file path and a bandwidth
    value (in bytes per second) to specify the device specific bandwidth. The file path
    may be a path to a block device node, or as any other file in which case the backing
    block device of the file system of the file is used. If the bandwidth is suffixed with
    K, M, G, or T, the specified bandwidth is parsed as Kilobytes, Megabytes, Gigabytes,
    or Terabytes, respectively, to the base of 1000. (Example:
    "/dev/disk/by-path/pci-0000:00:1f.2-scsi-0:0:0:0 5M"). This controls the "io.max"
    control group attributes. Use this option multiple times to set bandwidth limits for
    multiple devices.

    Added in version 230.
  */
  IOReadBandwidthMax?: string | string[];
  IOWriteBandwidthMax?: string | string[];

  /**
  IOReadIOPSMax=device IOPS, IOWriteIOPSMax=device IOPS
    These settings control the io controller in the unified hierarchy.

    Set the per-device overall block I/O IOs-Per-Second maximum limit for the executed
    processes, if the unified control group hierarchy is used on the system. This limit is
    not work-conserving and the executed processes are not allowed to use more even if the
    device has idle capacity. Takes a space-separated pair of a file path and an IOPS
    value to specify the device specific IOPS. The file path may be a path to a block
    device node, or as any other file in which case the backing block device of the file
    system of the file is used. If the IOPS is suffixed with K, M, G, or T, the specified
    IOPS is parsed as KiloIOPS, MegaIOPS, GigaIOPS, or TeraIOPS, respectively, to the base
    of 1000. (Example: "/dev/disk/by-path/pci-0000:00:1f.2-scsi-0:0:0:0 1K"). This
    controls the "io.max" control group attributes. Use this option multiple times to set
    IOPS limits for multiple devices.

    Added in version 230.
  */
  IOReadIOPSMax?: string | string[];
  IOWriteIOPSMax?: string | string[];

  /**
  IODeviceLatencyTargetSec=device target
    This setting controls the io controller in the unified hierarchy.

    Set the per-device average target I/O latency for the executed processes, if the
    unified control group hierarchy is used on the system. Takes a file path and a
    timespan separated by a space to specify the device specific latency target. (Example:
    "/dev/sda 25ms"). The file path may be specified as path to a block device node or as
    any other file, in which case the backing block device of the file system of the file
    is determined. This controls the "io.latency" control group attribute. Use this option
    multiple times to set latency target for multiple devices.

    Implies "IOAccounting=yes".

    Added in version 240.
  */
  IODeviceLatencyTargetSec?: string | string[];

  /**
  IPAccounting=
    Takes a boolean argument. If true, turns on IPv4 and IPv6 network traffic accounting
    for packets sent or received by the unit. When this option is turned on, all IPv4 and
    IPv6 sockets created by any process of the unit are accounted for.

    The system default for this setting may be controlled with DefaultIPAccounting= in
    systemd-system.conf(5).

    Added in version 235.
  */
  IPAccounting?: boolean;

  /**
  IPAddressAllow=ADDRESS[/PREFIXLENGTH]..., IPAddressDeny=ADDRESS[/PREFIXLENGTH]...
    Turn on network traffic filtering for IP packets sent and received over AF_INET and
    AF_INET6 sockets. Both directives take a space separated list of IPv4 or IPv6
    addresses, each optionally suffixed with an address prefix length in bits after a "/"
    character. If the suffix is omitted, the address is considered a host address.

    The access lists configured with this option are applied to all sockets created by
    processes of this unit (or in the case of socket units, associated with it). The lists
    are implicitly combined with any lists configured for any of the parent slice units
    this unit might be a member of. Both ingress and egress traffic is filtered by these
    settings.

    In place of explicit IPv4 or IPv6 address and prefix length specifications a small set
    of symbolic names may be used: "any", "localhost", "link-local", "multicast".

    If these settings are used multiple times in the same unit the specified lists are
    combined. If an empty string is assigned to these settings the specific access list is
    reset and all previous settings undone.

    Added in version 235.
  */
  IPAddressAllow?: string | string[];
  IPAddressDeny?: string | string[];

  /**
  SocketBindAllow=bind-rule, SocketBindDeny=bind-rule
    Allow or deny binding a socket address to a socket by matching it with the bind-rule
    and applying a corresponding action if there is a match.

    bind-rule describes socket properties such as address-family, transport-protocol and
    ip-ports.

      bind-rule := { [address-family:][transport-protocol:][ip-ports] | any }
      address-family := { ipv4 | ipv6 }
      transport-protocol := { tcp | udp }
      ip-ports := { ip-port | ip-port-range }

    To allow multiple rules assign SocketBindAllow= or SocketBindDeny= multiple times. To
    clear the existing assignments pass an empty SocketBindAllow= or SocketBindDeny=
    assignment. For each of SocketBindAllow= and SocketBindDeny=, maximum allowed number
    of assignments is 128.

    Added in version 249.
  */
  SocketBindAllow?: string | string[];
  SocketBindDeny?: string | string[];

  /**
  RestrictNetworkInterfaces=
    Takes a list of space-separated network interface names. This option restricts the
    network interfaces that processes of this unit can use. By default processes can only
    use the network interfaces listed (allow-list). If the first character of the rule is
    "~", the effect is inverted: the processes can only use network interfaces not listed
    (deny-list).

    This option can appear multiple times, in which case the network interface names are
    merged. If the empty string is assigned the set is reset, all prior assignments will
    have not effect.

    The loopback interface ("lo") is not treated in any special way, you have to configure
    it explicitly in the unit file.

    Added in version 250.
  */
  RestrictNetworkInterfaces?: string | string[];

  /**
  NFTSet=family:table:set
    This setting provides a method for integrating dynamic cgroup, user and group IDs into
    firewall rules with NFT sets. The benefit of using this setting is to be able to use
    the IDs as selectors in firewall rules easily and this in turn allows more fine
    grained filtering.

    This option expects a whitespace separated list of NFT set definitions. Each
    definition consists of a colon-separated tuple of source type (one of "cgroup", "user"
    or "group"), NFT address family (one of "arp", "bridge", "inet", "ip", "ip6", or
    "netdev"), table name and set name.

    Added in version 255.
  */
  NFTSet?: string | string[];

  /**
  IPIngressFilterPath=BPF_FS_PROGRAM_PATH, IPEgressFilterPath=BPF_FS_PROGRAM_PATH
    Add custom network traffic filters implemented as BPF programs, applying to all IP
    packets sent and received over AF_INET and AF_INET6 sockets. Takes an absolute path to
    a pinned BPF program in the BPF virtual filesystem (/sys/fs/bpf/).

    The filters configured with this option are applied to all sockets created by
    processes of this unit (or in the case of socket units, associated with it). The
    filters are loaded in addition to filters any of the parent slice units this unit
    might be a member of as well as any IPAddressAllow= and IPAddressDeny= filters in any
    of these units.

    If these settings are used multiple times in the same unit all the specified programs
    are attached. If an empty string is assigned to these settings the program list is
    reset and all previous specified programs ignored.

    Added in version 243.
  */
  IPIngressFilterPath?: string | string[];
  IPEgressFilterPath?: string | string[];

  /**
  BPFProgram=type:program-path
    BPFProgram= allows attaching custom BPF programs to the cgroup of a unit. (This
    generalizes the functionality exposed via IPEgressFilterPath= and IPIngressFilterPath=
    for other hooks.)

    The specification of BPF program consists of a pair of BPF program type and program
    path in the file system, with ":" as the separator: type:program-path.

    The BPF program type may be one of egress, ingress, sock_create, sock_ops, device,
    bind4, bind6, connect4, connect6, post_bind4, post_bind6, sendmsg4, sendmsg6, sysctl,
    recvmsg4, recvmsg6, getsockopt, or setsockopt.

    Setting BPFProgram= to an empty value makes previous assignments ineffective.
    Multiple assignments of the same program type/path pair have the same effect as a
    single assignment.

    Added in version 249.
  */
  BPFProgram?: string | string[];

  /**
  DeviceAllow=
    Control access to specific device nodes by the executed processes. Takes two
    space-separated strings: a device node specifier followed by a combination of r, w, m
    to control reading, writing, or creation of the specific device nodes by the unit
    (mknod), respectively. This functionality is implemented using eBPF filtering.

    The device node specifier is either a path to a device node in the file system,
    starting with /dev/, or a string starting with either "char-" or "block-" followed by
    a device group name, as listed in /proc/devices. The latter is useful to allow-list
    all current and future devices belonging to a specific device group at once. The
    device group is matched according to filename globbing rules, you may hence use the
    "*" and "?" wildcards.

    Added in version 208.
  */
  DeviceAllow?: string | string[];

  /**
  DevicePolicy=auto|closed|strict
    Control the policy for allowing device access:

    strict
        means to only allow types of access that are explicitly specified.

    closed
        in addition, allows access to standard pseudo devices including /dev/null,
        /dev/zero, /dev/full, /dev/random, and /dev/urandom.

    auto
        in addition, allows access to all devices if no explicit DeviceAllow= is present.
        This is the default.

    Added in version 208.
  */
  DevicePolicy?: "auto" | "closed" | "strict";

  /**
  Slice=
    The name of the slice unit to place the unit in. Defaults to system.slice for all
    non-instantiated units of all unit types (except for slice units themselves see
    below). Instance units are by default placed in a subslice of system.slice that is
    named after the template name.

    For units of type slice, the only accepted value for this setting is the parent slice.
    Since the name of a slice unit implies the parent slice, it is hence redundant to ever
    set this parameter directly for slice units.

    Added in version 208.
  */
  Slice?: string;

  /**
  Delegate=
    Turns on delegation of further resource control partitioning to processes of the unit.
    Units where this is enabled may create and manage their own private subhierarchy of
    control groups below the control group of the unit itself.

    Takes either a boolean argument or a (possibly empty) list of control group controller
    names. If true, delegation is turned on, and all supported controllers are enabled for
    the unit, making them available to the unit's processes for management. If false,
    delegation is turned off entirely. If set to a list of controllers, delegation is
    turned on, and the specified controllers are enabled for the unit. Defaults to false.

    The following controller names may be specified: cpu, cpuacct, cpuset, io, blkio,
    memory, devices, pids, bpf-firewall, and bpf-devices.

    Added in version 218.
  */
  Delegate?: boolean | string;

  /**
  DelegateSubgroup=
    Place unit processes in the specified subgroup of the unit's control group. Takes a
    valid control group name (not a path!) as parameter, or an empty string to turn this
    feature off. Defaults to off. The control group name must be usable as filename and
    avoid conflicts with the kernel's control group attribute files. This option has no
    effect unless control group delegation is turned on via Delegate=.

    Added in version 254.
  */
  DelegateSubgroup?: string;

  /**
  DisableControllers=
    Disables controllers from being enabled for a unit's children. If a controller listed
    is already in use in its subtree, the controller will be removed from the subtree.
    This can be used to avoid configuration in child units from being able to implicitly
    or explicitly enable a controller. Defaults to empty.

    Multiple controllers may be specified, separated by spaces. You may also pass
    DisableControllers= multiple times, in which case each new instance adds another
    controller to disable.

    The following controller names may be specified: cpu, cpuacct, cpuset, io, blkio,
    memory, devices, pids, bpf-firewall, and bpf-devices.

    Added in version 240.
  */
  DisableControllers?: string | string[];

  /**
  ManagedOOMSwap=auto|kill, ManagedOOMMemoryPressure=auto|kill
    Specifies how systemd-oomd.service(8) will act on this unit's cgroups. Defaults to
    auto.

    When set to kill, the unit becomes a candidate for monitoring by systemd-oomd. If the
    cgroup passes the limits set by oomd.conf(5) or the unit configuration, systemd-oomd
    will select a descendant cgroup and send SIGKILL to all of the processes under it.

    Setting either of these properties to kill will also result in After= and Wants=
    dependencies on systemd-oomd.service unless DefaultDependencies=no.

    When set to auto, systemd-oomd will not actively use this cgroup's data for monitoring
    and detection. However, if an ancestor cgroup has one of these properties set to kill,
    a unit with auto can still be a candidate for systemd-oomd to terminate.

    Added in version 247.
  */
  ManagedOOMSwap?: "auto" | "kill";
  ManagedOOMMemoryPressure?: "auto" | "kill";

  /**
  ManagedOOMMemoryPressureLimit=
    Overrides the default memory pressure limit set by oomd.conf(5) for this unit
    (cgroup). Takes a percentage value between 0% and 100%, inclusive. This property is
    ignored unless ManagedOOMMemoryPressure=kill. Defaults to 0%, which means to use the
    default set by oomd.conf(5).

    Added in version 247.
  */
  ManagedOOMMemoryPressureLimit?: string;

  /**
  ManagedOOMMemoryPressureDurationSec=
    Overrides the default memory pressure duration set by oomd.conf(5) for the cgroup of
    this unit. The specified value supports a time unit such as "ms" or "μs", see
    systemd.time(7) for details on the permitted syntax. Must be set to either empty or a
    value of at least 1s. Defaults to empty, which means to use the default set by
    oomd.conf(5). This property is ignored unless ManagedOOMMemoryPressure=kill.

    Added in version 257.
  */
  ManagedOOMMemoryPressureDurationSec?: string;

  /**
  ManagedOOMPreference=none|avoid|omit
    Allows deprioritizing or omitting this unit's cgroup as a candidate when systemd-oomd
    needs to act. Requires support for extended attributes (see xattr(7)) in order to use
    avoid or omit.

    If this property is set to avoid, the service manager will convey this to
    systemd-oomd, which will only select this cgroup if there are no other viable
    candidates.

    If this property is set to omit, the service manager will convey this to systemd-oomd,
    which will ignore this cgroup as a candidate and will not perform any actions on it.

    Defaults to none which means systemd-oomd will rank this unit's cgroup as defined in
    systemd-oomd.service(8) and oomd.conf(5).

    Added in version 248.
  */
  ManagedOOMPreference?: "none" | "avoid" | "omit";

  /**
  MemoryPressureWatch=
    Controls memory pressure monitoring for invoked processes. Takes one of "off", "on",
    "auto" or "skip". If "off" tells the service not to watch for memory pressure events,
    by setting the $MEMORY_PRESSURE_WATCH environment variable to the literal string
    /dev/null. If "on" tells the service to watch for memory pressure events. This enables
    memory accounting for the service, and ensures the memory.pressure cgroup attribute
    file is accessible for reading and writing by the service's user. If the "auto" value
    is set the protocol is enabled if memory accounting is anyway enabled for the unit,
    and disabled otherwise. If set to "skip" the logic is neither enabled, nor disabled
    and the two environment variables are not set.

    If not explicit set, defaults to the DefaultMemoryPressureWatch= setting in
    systemd-system.conf(5).

    Note: "on" and "off" are normalized to booleans by the INI parser of this library.

    Added in version 254.
  */
  MemoryPressureWatch?: boolean | "auto" | "skip";

  /**
  MemoryPressureThresholdSec=
    Sets the memory pressure threshold time for memory pressure monitor as configured via
    MemoryPressureWatch=. Specifies the maximum allocation latency before a memory
    pressure event is signalled to the service, per 2s window. If not specified defaults
    to the DefaultMemoryPressureThresholdSec= setting in systemd-system.conf(5) (which in
    turn defaults to 200ms). The specified value expects a time unit such as "ms" or "μs",
    see systemd.time(7) for details on the permitted syntax.

    Added in version 254.
  */
  MemoryPressureThresholdSec?: string;

  /**
  CoredumpReceive=
    Takes a boolean argument. This setting is used to enable coredump forwarding for
    containers that belong to this unit's cgroup. Units with CoredumpReceive=yes must also
    be configured with Delegate=yes. Defaults to false.

    When systemd-coredump is handling a coredump for a process from a container, if the
    container's leader process is a descendant of a cgroup with CoredumpReceive=yes and
    Delegate=yes, then systemd-coredump will attempt to forward the coredump to
    systemd-coredump within the container.

    Added in version 255.
  */
  CoredumpReceive?: boolean;
}

export const ResourceLimitSchema = z.union([
  z.number(),
  z.literal("infinity"),
  z.templateLiteral([z.number(), z.enum(["%", "G", "K", "M", "T"])]),
]);

const StringOrStringArray = z.union([z.string(), z.array(z.string())]);

export const ResourceSectionConfigSchema = implement<ResourceSectionConfig>().with({
  CPUAccounting: z.boolean().optional(),
  CPUWeight: z.union([z.number(), z.literal("idle")]).optional(),
  StartupCPUWeight: z.union([z.number(), z.literal("idle")]).optional(),
  CPUQuota: z.string().optional(),
  CPUQuotaPeriodSec: z.union([z.number(), z.string()]).optional(),
  AllowedCPUs: z.string().optional(),
  StartupAllowedCPUs: z.string().optional(),

  MemoryAccounting: z.boolean().optional(),
  MemoryMin: ResourceLimitSchema.optional(),
  DefaultMemoryMin: ResourceLimitSchema.optional(),
  MemoryLow: ResourceLimitSchema.optional(),
  DefaultMemoryLow: ResourceLimitSchema.optional(),
  StartupMemoryLow: ResourceLimitSchema.optional(),
  DefaultStartupMemoryLow: ResourceLimitSchema.optional(),
  MemoryHigh: ResourceLimitSchema.optional(),
  StartupMemoryHigh: ResourceLimitSchema.optional(),
  MemoryMax: ResourceLimitSchema.optional(),
  StartupMemoryMax: ResourceLimitSchema.optional(),
  MemorySwapMax: ResourceLimitSchema.optional(),
  StartupMemorySwapMax: ResourceLimitSchema.optional(),
  MemoryZSwapMax: ResourceLimitSchema.optional(),
  StartupMemoryZSwapMax: ResourceLimitSchema.optional(),
  MemoryZSwapWriteback: z.boolean().optional(),
  AllowedMemoryNodes: z.string().optional(),
  StartupAllowedMemoryNodes: z.string().optional(),

  TasksAccounting: z.boolean().optional(),
  TasksMax: z.union([
    z.number(),
    z.literal("infinity"),
    z.templateLiteral([z.number(), "%"]),
  ]).optional(),

  IOAccounting: z.boolean().optional(),
  IOWeight: z.number().optional(),
  StartupIOWeight: z.number().optional(),
  IODeviceWeight: StringOrStringArray.optional(),
  IOReadBandwidthMax: StringOrStringArray.optional(),
  IOWriteBandwidthMax: StringOrStringArray.optional(),
  IOReadIOPSMax: StringOrStringArray.optional(),
  IOWriteIOPSMax: StringOrStringArray.optional(),
  IODeviceLatencyTargetSec: StringOrStringArray.optional(),

  IPAccounting: z.boolean().optional(),
  IPAddressAllow: StringOrStringArray.optional(),
  IPAddressDeny: StringOrStringArray.optional(),
  SocketBindAllow: StringOrStringArray.optional(),
  SocketBindDeny: StringOrStringArray.optional(),
  RestrictNetworkInterfaces: StringOrStringArray.optional(),
  NFTSet: StringOrStringArray.optional(),

  IPIngressFilterPath: StringOrStringArray.optional(),
  IPEgressFilterPath: StringOrStringArray.optional(),
  BPFProgram: StringOrStringArray.optional(),

  DeviceAllow: StringOrStringArray.optional(),
  DevicePolicy: z.enum(["auto", "closed", "strict"]).optional(),

  Slice: z.string().optional(),
  Delegate: z.union([z.boolean(), z.string()]).optional(),
  DelegateSubgroup: z.string().optional(),
  DisableControllers: StringOrStringArray.optional(),

  ManagedOOMSwap: z.enum(["auto", "kill"]).optional(),
  ManagedOOMMemoryPressure: z.enum(["auto", "kill"]).optional(),
  ManagedOOMMemoryPressureLimit: z.string().optional(),
  ManagedOOMMemoryPressureDurationSec: z.string().optional(),
  ManagedOOMPreference: z.enum(["none", "avoid", "omit"]).optional(),
  MemoryPressureWatch: z.literal([true, false, "auto", "skip"]).optional(),
  MemoryPressureThresholdSec: z.string().optional(),

  CoredumpReceive: z.boolean().optional(),
});

export class ResourceSectionBuilder {
  public section: ResourceSectionConfig = {};

  /**
   * Set resource CPUAccounting
   * @see {@link ResourceSectionConfig.CPUAccounting}
   */
  public setCPUAccounting(value?: ResourceSectionConfig["CPUAccounting"]): this {
    this.section.CPUAccounting = value;
    return this;
  }

  /**
   * Set resource CPUWeight
   * @see {@link ResourceSectionConfig.CPUWeight}
   */
  public setCPUWeight(value?: ResourceSectionConfig["CPUWeight"]): this {
    this.section.CPUWeight = value;
    return this;
  }

  /**
   * Set resource StartupCPUWeight
   * @see {@link ResourceSectionConfig.StartupCPUWeight}
   */
  public setStartupCPUWeight(value?: ResourceSectionConfig["StartupCPUWeight"]): this {
    this.section.StartupCPUWeight = value;
    return this;
  }

  /**
   * Set resource CPUQuota
   * @see {@link ResourceSectionConfig.CPUQuota}
   */
  public setCPUQuota(value?: ResourceSectionConfig["CPUQuota"]): this {
    this.section.CPUQuota = value;
    return this;
  }

  /**
   * Set resource CPUQuotaPeriodSec
   * @see {@link ResourceSectionConfig.CPUQuotaPeriodSec}
   */
  public setCPUQuotaPeriodSec(value?: ResourceSectionConfig["CPUQuotaPeriodSec"]): this {
    this.section.CPUQuotaPeriodSec = value;
    return this;
  }

  /**
   * Set resource AllowedCPUs
   * @see {@link ResourceSectionConfig.AllowedCPUs}
   */
  public setAllowedCPUs(value?: ResourceSectionConfig["AllowedCPUs"]): this {
    this.section.AllowedCPUs = value;
    return this;
  }

  /**
   * Set resource StartupAllowedCPUs
   * @see {@link ResourceSectionConfig.StartupAllowedCPUs}
   */
  public setStartupAllowedCPUs(value?: ResourceSectionConfig["StartupAllowedCPUs"]): this {
    this.section.StartupAllowedCPUs = value;
    return this;
  }

  /**
   * Set resource MemoryAccounting
   * @see {@link ResourceSectionConfig.MemoryAccounting}
   */
  public setMemoryAccounting(value?: ResourceSectionConfig["MemoryAccounting"]): this {
    this.section.MemoryAccounting = value;
    return this;
  }

  /**
   * Set resource MemoryMin
   * @see {@link ResourceSectionConfig.MemoryMin}
   */
  public setMemoryMin(value?: ResourceSectionConfig["MemoryMin"]): this {
    this.section.MemoryMin = value;
    return this;
  }

  /**
   * Set resource DefaultMemoryMin
   * @see {@link ResourceSectionConfig.DefaultMemoryMin}
   */
  public setDefaultMemoryMin(value?: ResourceSectionConfig["DefaultMemoryMin"]): this {
    this.section.DefaultMemoryMin = value;
    return this;
  }

  /**
   * Set resource MemoryLow
   * @see {@link ResourceSectionConfig.MemoryLow}
   */
  public setMemoryLow(value?: ResourceSectionConfig["MemoryLow"]): this {
    this.section.MemoryLow = value;
    return this;
  }

  /**
   * Set resource DefaultMemoryLow
   * @see {@link ResourceSectionConfig.DefaultMemoryLow}
   */
  public setDefaultMemoryLow(value?: ResourceSectionConfig["DefaultMemoryLow"]): this {
    this.section.DefaultMemoryLow = value;
    return this;
  }

  /**
   * Set resource StartupMemoryLow
   * @see {@link ResourceSectionConfig.StartupMemoryLow}
   */
  public setStartupMemoryLow(value?: ResourceSectionConfig["StartupMemoryLow"]): this {
    this.section.StartupMemoryLow = value;
    return this;
  }

  /**
   * Set resource DefaultStartupMemoryLow
   * @see {@link ResourceSectionConfig.DefaultStartupMemoryLow}
   */
  public setDefaultStartupMemoryLow(value?: ResourceSectionConfig["DefaultStartupMemoryLow"]): this {
    this.section.DefaultStartupMemoryLow = value;
    return this;
  }

  /**
   * Set resource MemoryHigh
   * @see {@link ResourceSectionConfig.MemoryHigh}
   */
  public setMemoryHigh(value?: ResourceSectionConfig["MemoryHigh"]): this {
    this.section.MemoryHigh = value;
    return this;
  }

  /**
   * Set resource StartupMemoryHigh
   * @see {@link ResourceSectionConfig.StartupMemoryHigh}
   */
  public setStartupMemoryHigh(value?: ResourceSectionConfig["StartupMemoryHigh"]): this {
    this.section.StartupMemoryHigh = value;
    return this;
  }

  /**
   * Set resource MemoryMax
   * @see {@link ResourceSectionConfig.MemoryMax}
   */
  public setMemoryMax(value?: ResourceSectionConfig["MemoryMax"]): this {
    this.section.MemoryMax = value;
    return this;
  }

  /**
   * Set resource StartupMemoryMax
   * @see {@link ResourceSectionConfig.StartupMemoryMax}
   */
  public setStartupMemoryMax(value?: ResourceSectionConfig["StartupMemoryMax"]): this {
    this.section.StartupMemoryMax = value;
    return this;
  }

  /**
   * Set resource MemorySwapMax
   * @see {@link ResourceSectionConfig.MemorySwapMax}
   */
  public setMemorySwapMax(value?: ResourceSectionConfig["MemorySwapMax"]): this {
    this.section.MemorySwapMax = value;
    return this;
  }

  /**
   * Set resource StartupMemorySwapMax
   * @see {@link ResourceSectionConfig.StartupMemorySwapMax}
   */
  public setStartupMemorySwapMax(value?: ResourceSectionConfig["StartupMemorySwapMax"]): this {
    this.section.StartupMemorySwapMax = value;
    return this;
  }

  /**
   * Set resource MemoryZSwapMax
   * @see {@link ResourceSectionConfig.MemoryZSwapMax}
   */
  public setMemoryZSwapMax(value?: ResourceSectionConfig["MemoryZSwapMax"]): this {
    this.section.MemoryZSwapMax = value;
    return this;
  }

  /**
   * Set resource StartupMemoryZSwapMax
   * @see {@link ResourceSectionConfig.StartupMemoryZSwapMax}
   */
  public setStartupMemoryZSwapMax(value?: ResourceSectionConfig["StartupMemoryZSwapMax"]): this {
    this.section.StartupMemoryZSwapMax = value;
    return this;
  }

  /**
   * Set resource MemoryZSwapWriteback
   * @see {@link ResourceSectionConfig.MemoryZSwapWriteback}
   */
  public setMemoryZSwapWriteback(value?: ResourceSectionConfig["MemoryZSwapWriteback"]): this {
    this.section.MemoryZSwapWriteback = value;
    return this;
  }

  /**
   * Set resource AllowedMemoryNodes
   * @see {@link ResourceSectionConfig.AllowedMemoryNodes}
   */
  public setAllowedMemoryNodes(value?: ResourceSectionConfig["AllowedMemoryNodes"]): this {
    this.section.AllowedMemoryNodes = value;
    return this;
  }

  /**
   * Set resource StartupAllowedMemoryNodes
   * @see {@link ResourceSectionConfig.StartupAllowedMemoryNodes}
   */
  public setStartupAllowedMemoryNodes(value?: ResourceSectionConfig["StartupAllowedMemoryNodes"]): this {
    this.section.StartupAllowedMemoryNodes = value;
    return this;
  }

  /**
   * Set resource TasksAccounting
   * @see {@link ResourceSectionConfig.TasksAccounting}
   */
  public setTasksAccounting(value?: ResourceSectionConfig["TasksAccounting"]): this {
    this.section.TasksAccounting = value;
    return this;
  }

  /**
   * Set resource TasksMax
   * @see {@link ResourceSectionConfig.TasksMax}
   */
  public setTasksMax(value?: ResourceSectionConfig["TasksMax"]): this {
    this.section.TasksMax = value;
    return this;
  }

  /**
   * Set resource IOAccounting
   * @see {@link ResourceSectionConfig.IOAccounting}
   */
  public setIOAccounting(value?: ResourceSectionConfig["IOAccounting"]): this {
    this.section.IOAccounting = value;
    return this;
  }

  /**
   * Set resource IOWeight
   * @see {@link ResourceSectionConfig.IOWeight}
   */
  public setIOWeight(value?: ResourceSectionConfig["IOWeight"]): this {
    this.section.IOWeight = value;
    return this;
  }

  /**
   * Set resource StartupIOWeight
   * @see {@link ResourceSectionConfig.StartupIOWeight}
   */
  public setStartupIOWeight(value?: ResourceSectionConfig["StartupIOWeight"]): this {
    this.section.StartupIOWeight = value;
    return this;
  }

  /**
   * Set resource IODeviceWeight
   * @see {@link ResourceSectionConfig.IODeviceWeight}
   */
  public setIODeviceWeight(value?: ResourceSectionConfig["IODeviceWeight"]): this {
    this.section.IODeviceWeight = value;
    return this;
  }

  /**
   * Set resource IOReadBandwidthMax
   * @see {@link ResourceSectionConfig.IOReadBandwidthMax}
   */
  public setIOReadBandwidthMax(value?: ResourceSectionConfig["IOReadBandwidthMax"]): this {
    this.section.IOReadBandwidthMax = value;
    return this;
  }

  /**
   * Set resource IOWriteBandwidthMax
   * @see {@link ResourceSectionConfig.IOWriteBandwidthMax}
   */
  public setIOWriteBandwidthMax(value?: ResourceSectionConfig["IOWriteBandwidthMax"]): this {
    this.section.IOWriteBandwidthMax = value;
    return this;
  }

  /**
   * Set resource IOReadIOPSMax
   * @see {@link ResourceSectionConfig.IOReadIOPSMax}
   */
  public setIOReadIOPSMax(value?: ResourceSectionConfig["IOReadIOPSMax"]): this {
    this.section.IOReadIOPSMax = value;
    return this;
  }

  /**
   * Set resource IOWriteIOPSMax
   * @see {@link ResourceSectionConfig.IOWriteIOPSMax}
   */
  public setIOWriteIOPSMax(value?: ResourceSectionConfig["IOWriteIOPSMax"]): this {
    this.section.IOWriteIOPSMax = value;
    return this;
  }

  /**
   * Set resource IODeviceLatencyTargetSec
   * @see {@link ResourceSectionConfig.IODeviceLatencyTargetSec}
   */
  public setIODeviceLatencyTargetSec(value?: ResourceSectionConfig["IODeviceLatencyTargetSec"]): this {
    this.section.IODeviceLatencyTargetSec = value;
    return this;
  }

  /**
   * Set resource IPAccounting
   * @see {@link ResourceSectionConfig.IPAccounting}
   */
  public setIPAccounting(value?: ResourceSectionConfig["IPAccounting"]): this {
    this.section.IPAccounting = value;
    return this;
  }

  /**
   * Set resource IPAddressAllow
   * @see {@link ResourceSectionConfig.IPAddressAllow}
   */
  public setIPAddressAllow(value?: ResourceSectionConfig["IPAddressAllow"]): this {
    this.section.IPAddressAllow = value;
    return this;
  }

  /**
   * Set resource IPAddressDeny
   * @see {@link ResourceSectionConfig.IPAddressDeny}
   */
  public setIPAddressDeny(value?: ResourceSectionConfig["IPAddressDeny"]): this {
    this.section.IPAddressDeny = value;
    return this;
  }

  /**
   * Set resource SocketBindAllow
   * @see {@link ResourceSectionConfig.SocketBindAllow}
   */
  public setSocketBindAllow(value?: ResourceSectionConfig["SocketBindAllow"]): this {
    this.section.SocketBindAllow = value;
    return this;
  }

  /**
   * Set resource SocketBindDeny
   * @see {@link ResourceSectionConfig.SocketBindDeny}
   */
  public setSocketBindDeny(value?: ResourceSectionConfig["SocketBindDeny"]): this {
    this.section.SocketBindDeny = value;
    return this;
  }

  /**
   * Set resource RestrictNetworkInterfaces
   * @see {@link ResourceSectionConfig.RestrictNetworkInterfaces}
   */
  public setRestrictNetworkInterfaces(value?: ResourceSectionConfig["RestrictNetworkInterfaces"]): this {
    this.section.RestrictNetworkInterfaces = value;
    return this;
  }

  /**
   * Set resource NFTSet
   * @see {@link ResourceSectionConfig.NFTSet}
   */
  public setNFTSet(value?: ResourceSectionConfig["NFTSet"]): this {
    this.section.NFTSet = value;
    return this;
  }

  /**
   * Set resource IPIngressFilterPath
   * @see {@link ResourceSectionConfig.IPIngressFilterPath}
   */
  public setIPIngressFilterPath(value?: ResourceSectionConfig["IPIngressFilterPath"]): this {
    this.section.IPIngressFilterPath = value;
    return this;
  }

  /**
   * Set resource IPEgressFilterPath
   * @see {@link ResourceSectionConfig.IPEgressFilterPath}
   */
  public setIPEgressFilterPath(value?: ResourceSectionConfig["IPEgressFilterPath"]): this {
    this.section.IPEgressFilterPath = value;
    return this;
  }

  /**
   * Set resource BPFProgram
   * @see {@link ResourceSectionConfig.BPFProgram}
   */
  public setBPFProgram(value?: ResourceSectionConfig["BPFProgram"]): this {
    this.section.BPFProgram = value;
    return this;
  }

  /**
   * Set resource DeviceAllow
   * @see {@link ResourceSectionConfig.DeviceAllow}
   */
  public setDeviceAllow(value?: ResourceSectionConfig["DeviceAllow"]): this {
    this.section.DeviceAllow = value;
    return this;
  }

  /**
   * Set resource DevicePolicy
   * @see {@link ResourceSectionConfig.DevicePolicy}
   */
  public setDevicePolicy(value?: ResourceSectionConfig["DevicePolicy"]): this {
    this.section.DevicePolicy = value;
    return this;
  }

  /**
   * Set resource Slice
   * @see {@link ResourceSectionConfig.Slice}
   */
  public setSlice(value?: ResourceSectionConfig["Slice"]): this {
    this.section.Slice = value;
    return this;
  }

  /**
   * Set resource Delegate
   * @see {@link ResourceSectionConfig.Delegate}
   */
  public setDelegate(value?: ResourceSectionConfig["Delegate"]): this {
    this.section.Delegate = value;
    return this;
  }

  /**
   * Set resource DelegateSubgroup
   * @see {@link ResourceSectionConfig.DelegateSubgroup}
   */
  public setDelegateSubgroup(value?: ResourceSectionConfig["DelegateSubgroup"]): this {
    this.section.DelegateSubgroup = value;
    return this;
  }

  /**
   * Set resource DisableControllers
   * @see {@link ResourceSectionConfig.DisableControllers}
   */
  public setDisableControllers(value?: ResourceSectionConfig["DisableControllers"]): this {
    this.section.DisableControllers = value;
    return this;
  }

  /**
   * Set resource ManagedOOMSwap
   * @see {@link ResourceSectionConfig.ManagedOOMSwap}
   */
  public setManagedOOMSwap(value?: ResourceSectionConfig["ManagedOOMSwap"]): this {
    this.section.ManagedOOMSwap = value;
    return this;
  }

  /**
   * Set resource ManagedOOMMemoryPressure
   * @see {@link ResourceSectionConfig.ManagedOOMMemoryPressure}
   */
  public setManagedOOMMemoryPressure(value?: ResourceSectionConfig["ManagedOOMMemoryPressure"]): this {
    this.section.ManagedOOMMemoryPressure = value;
    return this;
  }

  /**
   * Set resource ManagedOOMMemoryPressureLimit
   * @see {@link ResourceSectionConfig.ManagedOOMMemoryPressureLimit}
   */
  public setManagedOOMMemoryPressureLimit(value?: ResourceSectionConfig["ManagedOOMMemoryPressureLimit"]): this {
    this.section.ManagedOOMMemoryPressureLimit = value;
    return this;
  }

  /**
   * Set resource ManagedOOMMemoryPressureDurationSec
   * @see {@link ResourceSectionConfig.ManagedOOMMemoryPressureDurationSec}
   */
  public setManagedOOMMemoryPressureDurationSec(value?: ResourceSectionConfig["ManagedOOMMemoryPressureDurationSec"]): this {
    this.section.ManagedOOMMemoryPressureDurationSec = value;
    return this;
  }

  /**
   * Set resource ManagedOOMPreference
   * @see {@link ResourceSectionConfig.ManagedOOMPreference}
   */
  public setManagedOOMPreference(value?: ResourceSectionConfig["ManagedOOMPreference"]): this {
    this.section.ManagedOOMPreference = value;
    return this;
  }

  /**
   * Set resource MemoryPressureWatch
   * @see {@link ResourceSectionConfig.MemoryPressureWatch}
   */
  public setMemoryPressureWatch(value?: ResourceSectionConfig["MemoryPressureWatch"]): this {
    this.section.MemoryPressureWatch = value;
    return this;
  }

  /**
   * Set resource MemoryPressureThresholdSec
   * @see {@link ResourceSectionConfig.MemoryPressureThresholdSec}
   */
  public setMemoryPressureThresholdSec(value?: ResourceSectionConfig["MemoryPressureThresholdSec"]): this {
    this.section.MemoryPressureThresholdSec = value;
    return this;
  }

  /**
   * Set resource CoredumpReceive
   * @see {@link ResourceSectionConfig.CoredumpReceive}
   */
  public setCoredumpReceive(value?: ResourceSectionConfig["CoredumpReceive"]): this {
    this.section.CoredumpReceive = value;
    return this;
  }
}
