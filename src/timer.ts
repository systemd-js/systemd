import type { ZodType} from "zod";
import { z } from "zod";
import type { ExecSectionConfig} from "./exec.js";
import { ExecSectionBuilder, ExecSectionSchema } from "./exec.js";
import { applyMixins, implement } from "./utils.js";
import type { InstallSectionConfig} from "./install.js";
import { InstallSectionBuilder, InstallSectionSchema } from "./install.js";
import type { UnitSection} from "./unit.js";
import { UnitSectionBuilder, UnitSectionSchema } from "./unit.js";
import { INI } from "./ini.js";

/**
 * Timer section of a systemd unit file.
 * @see https://manpages.ubuntu.com/manpages/noble/en/man5/systemd.timer.5.html
 */
export interface TimerSectionConfig {
  /**
  OnActiveSec=, OnBootSec=, OnStartupSec=, OnUnitActiveSec=, OnUnitInactiveSec=
    Defines monotonic timers relative to different starting points:

    Table 1. Settings and their starting points
    ┌───────────────────┬──────────────────────────────────┐
    │Setting            │ Meaning                          │
    ├───────────────────┼──────────────────────────────────┤
    │OnActiveSec=       │ Defines a timer relative to the  │
    │                   │ moment the timer unit itself is  │
    │                   │ activated.                       │
    ├───────────────────┼──────────────────────────────────┤
    │OnBootSec=         │ Defines a timer relative to when │
    │                   │ the machine was booted up. In    │
    │                   │ containers, for the system       │
    │                   │ manager instance, this is mapped │
    │                   │ to OnStartupSec=, making both    │
    │                   │ equivalent.                      │
    ├───────────────────┼──────────────────────────────────┤
    │OnStartupSec=      │ Defines a timer relative to when │
    │                   │ the service manager was first    │
    │                   │ started. For system timer units  │
    │                   │ this is very similar to          │
    │                   │ OnBootSec= as the system service │
    │                   │ manager is generally started     │
    │                   │ very early at boot. It's         │
    │                   │ primarily useful when configured │
    │                   │ in units running in the per-user │
    │                   │ service manager, as the user     │
    │                   │ service manager is generally     │
    │                   │ started on first login only, not │
    │                   │ already during boot.             │
    ├───────────────────┼──────────────────────────────────┤
    │OnUnitActiveSec=   │ Defines a timer relative to when │
    │                   │ the unit the timer unit is       │
    │                   │ activating was last activated.   │
    ├───────────────────┼──────────────────────────────────┤
    │OnUnitInactiveSec= │ Defines a timer relative to when │
    │                   │ the unit the timer unit is       │
    │                   │ activating was last deactivated. │
    └───────────────────┴──────────────────────────────────┘
    Multiple directives may be combined of the same and of different types, in which case
    the timer unit will trigger whenever any of the specified timer expressions elapse.
    For example, by combining OnBootSec= and OnUnitActiveSec=, it is possible to define a
    timer that elapses in regular intervals and activates a specific service each time.
    Moreover, both monotonic time expressions and OnCalendar= calendar expressions may be
    combined in the same timer unit.

    The arguments to the directives are time spans configured in seconds. Example:
    "OnBootSec=50" means 50s after boot-up. The argument may also include time units.
    Example: "OnBootSec=5h 30min" means 5 hours and 30 minutes after boot-up. For details
    about the syntax of time spans, see systemd.time(7).

    If a timer configured with OnBootSec= or OnStartupSec= is already in the past when the
    timer unit is activated, it will immediately elapse and the configured unit is
    started. This is not the case for timers defined in the other directives.

    These are monotonic timers, independent of wall-clock time and timezones. If the
    computer is temporarily suspended, the monotonic clock generally pauses, too. Note
    that if WakeSystem= is used, a different monotonic clock is selected that continues to
    advance while the system is suspended and thus can be used as the trigger to resume
    the system.

    If the empty string is assigned to any of these options, the list of timers is reset
    (both monotonic timers and OnCalendar= timers, see below), and all prior assignments
    will have no effect.

    Note that timers do not necessarily expire at the precise time configured with these
    settings, as they are subject to the AccuracySec= setting below.
  */
  OnActiveSec?: number | string;
  OnBootSec?: number | string;
  OnStartupSec?: number | string;
  OnUnitActiveSec?: number | string;
  OnUnitInactiveSec?: number | string;

  /**
  OnCalendar=
    Defines realtime (i.e. wallclock) timers with calendar event expressions. See
    systemd.time(7) for more information on the syntax of calendar event expressions.
    Otherwise, the semantics are similar to OnActiveSec= and related settings.

    Note that timers do not necessarily expire at the precise time configured with this
    setting, as it is subject to the AccuracySec= setting below.

    May be specified more than once, in which case the timer unit will trigger whenever
    any of the specified expressions elapse. Moreover calendar timers and monotonic timers
    (see above) may be combined within the same timer unit.

    If the empty string is assigned to any of these options, the list of timers is reset
    (both OnCalendar= timers and monotonic timers, see above), and all prior assignments
    will have no effect.

    Note that calendar timers might be triggered at unexpected times if the system's
    realtime clock is not set correctly. Specifically, on systems that lack a
    battery-buffered Realtime Clock (RTC) it might be wise to enable
    systemd-time-wait-sync.service to ensure the clock is adjusted to a network time
    source before the timer event is set up. Timer units with at least one OnCalendar=
    expression are automatically ordered after time-sync.target, which
    systemd-time-wait-sync.service is ordered before.

    When a system is temporarily put to sleep (i.e. system suspend or hibernation) the
    realtime clock does not pause. When a calendar timer elapses while the system is
    sleeping it will not be acted on immediately, but once the system is later resumed it
    will catch up and process all timers that triggered while the system was sleeping.
    Note that if a calendar timer elapsed more than once while the system was continuously
    sleeping the timer will only result in a single service activation. If WakeSystem=
    (see below) is enabled a calendar time event elapsing while the system is suspended
    will cause the system to wake up (under the condition the system's hardware supports
    time-triggered wake-up functionality).

    Added in version 197.
  */
  OnCalendar?: string;

  /**
  AccuracySec=
    Specify the accuracy the timer shall elapse with. Defaults to 1min. The timer is
    scheduled to elapse within a time window starting with the time specified in
    OnCalendar=, OnActiveSec=, OnBootSec=, OnStartupSec=, OnUnitActiveSec= or
    OnUnitInactiveSec= and ending the time configured with AccuracySec= later. Within this
    time window, the expiry time will be placed at a host-specific, randomized, but stable
    position that is synchronized between all local timer units. This is done in order to
    optimize power consumption to suppress unnecessary CPU wake-ups. To get best accuracy,
    set this option to 1us. Note that the timer is still subject to the timer slack
    configured via systemd-system.conf(5)'s TimerSlackNSec= setting. See prctl(2) for
    details. To optimize power consumption, make sure to set this value as high as
    possible and as low as necessary.

    Note that this setting is primarily a power saving option that allows coalescing CPU
    wake-ups. It should not be confused with RandomizedDelaySec= (see below) which adds a
    random value to the time the timer shall elapse next and whose purpose is the
    opposite: to stretch elapsing of timer events over a longer period to reduce workload
    spikes. For further details and explanations and how both settings play together, see
    below.

    Added in version 209.
  */
  AccuracySec?: number | string;

  /**
  RandomizedDelaySec=
    Delay the timer by a randomly selected, evenly distributed amount of time between 0
    and the specified time value. Defaults to 0, indicating that no randomized delay shall
    be applied. Each timer unit will determine this delay randomly before each iteration,
    and the delay will simply be added on top of the next determined elapsing time, unless
    modified with FixedRandomDelay=, see below.

    This setting is useful to stretch dispatching of similarly configured timer events
    over a certain time interval, to prevent them from firing all at the same time,
    possibly resulting in resource congestion.

    Note the relation to AccuracySec= above: the latter allows the service manager to
    coalesce timer events within a specified time range in order to minimize wakeups,
    while this setting does the opposite: it stretches timer events over an interval, to
    make it unlikely that they fire simultaneously. If RandomizedDelaySec= and
    AccuracySec= are used in conjunction, first the randomized delay is added, and then
    the result is possibly further shifted to coalesce it with other timer events
    happening on the system. As mentioned above AccuracySec= defaults to 1 minute and
    RandomizedDelaySec= to 0, thus encouraging coalescing of timer events. In order to
    optimally stretch timer events over a certain range of time, set AccuracySec=1us and
    RandomizedDelaySec= to some higher value.

    Added in version 229.
  */
  RandomizedDelaySec?: number | string;

  /**
  FixedRandomDelay=
    Takes a boolean argument. When enabled, the randomized offset specified by
    RandomizedDelaySec= is reused for all firings of the same timer. For a given timer
    unit, the offset depends on the machine ID, user identifier and timer name, which
    means that it is stable between restarts of the manager. This effectively creates a
    fixed offset for an individual timer, reducing the jitter in firings of this timer,
    while still avoiding firing at the same time as other similarly configured timers.

    This setting has no effect if RandomizedDelaySec= is set to 0. Defaults to false.

    Added in version 247.
  */
  FixedRandomDelay?: boolean;

  /**
  OnClockChange=, OnTimezoneChange=
    These options take boolean arguments. When true, the service unit will be triggered
    when the system clock (CLOCK_REALTIME) jumps relative to the monotonic clock
    (CLOCK_MONOTONIC), or when the local system timezone is modified. These options can be
    used alone or in combination with other timer expressions (see above) within the same
    timer unit. These options default to false.

    Added in version 242.
  */
  OnClockChange?: boolean;

  /**
  Unit=
    The unit to activate when this timer elapses. The argument is a unit name, whose
    suffix is not ".timer". If not specified, this value defaults to a service that has
    the same name as the timer unit, except for the suffix. (See above.) It is recommended
    that the unit name that is activated and the unit name of the timer unit are named
    identically, except for the suffix.
    */
  Unit?: string;

  /**
  Persistent=
    Takes a boolean argument. If true, the time when the service unit was last triggered
    is stored on disk. When the timer is activated, the service unit is triggered
    immediately if it would have been triggered at least once during the time when the
    timer was inactive. Such triggering is nonetheless subject to the delay imposed by
    RandomizedDelaySec=. This is useful to catch up on missed runs of the service when the
    system was powered down. Note that this setting only has an effect on timers
    configured with OnCalendar=. Defaults to false.

    Use systemctl clean --what=state ...  on the timer unit to remove the timestamp file
    maintained by this option from disk. In particular, use this command before
    uninstalling a timer unit. See systemctl(1) for details.

    Added in version 212.
  */
  Persistent?: boolean;

  /**
  WakeSystem=
    Takes a boolean argument. If true, an elapsing timer will cause the system to resume
    from suspend, should it be suspended and if the system supports this. Note that this
    option will only make sure the system resumes on the appropriate times, it will not
    take care of suspending it again after any work that is to be done is finished.
    Defaults to false.

    Note that this functionality requires privileges and is thus generally only available
    in the system service manager.

    Note that behaviour of monotonic clock timers (as configured with OnActiveSec=,
    OnBootSec=, OnStartupSec=, OnUnitActiveSec=, OnUnitInactiveSec=, see above) is altered
    depending on this option. If false, a monotonic clock is used that is paused during
    system suspend (CLOCK_MONOTONIC), if true a different monotonic clock is used that
    continues advancing during system suspend (CLOCK_BOOTTIME), see clock_getres(2) for
    details.

    Added in version 212.
  */
  WakeSystem?: boolean;

  /**
  RemainAfterElapse=
    Takes a boolean argument. If true, a timer will stay loaded, and its state remains
    queryable even after it elapsed and the associated unit (as configured with Unit=, see
    above) deactivated again. If false, an elapsed timer unit that cannot elapse anymore
    is unloaded once its associated unit deactivated again. Turning this off is
    particularly useful for transient timer units. Note that this setting has an effect
    when repeatedly starting a timer unit: if RemainAfterElapse= is on, starting the timer
    a second time has no effect. However, if RemainAfterElapse= is off and the timer unit
    was already unloaded, it can be started again, and thus the service can be triggered
    multiple times. Defaults to true.

    Added in version 229.

  Check systemd.unit(5), systemd.exec(5), and systemd.kill(5) for more settings.
  */
  RemainAfterElapse?: boolean;
}

export type TimerSection = ExecSectionConfig & TimerSectionConfig;

export interface TimerUnit {
  Unit: UnitSection
  Install?: InstallSectionConfig;
  Timer: TimerSection
}

export const TimerSectionConfigSchema = implement<TimerSectionConfig>().with({
  OnActiveSec: z.union([z.number(), z.string()]).optional(),
  OnBootSec: z.union([z.number(), z.string()]).optional(),
  OnStartupSec: z.union([z.number(), z.string()]).optional(),
  OnUnitActiveSec: z.union([z.number(), z.string()]).optional(),
  OnUnitInactiveSec: z.union([z.number(), z.string()]).optional(),
  OnCalendar: z.string().optional(),
  AccuracySec: z.union([z.number(), z.string()]).optional(),
  RandomizedDelaySec: z.union([z.number(), z.string()]).optional(),
  FixedRandomDelay: z.boolean().optional(),
  OnClockChange: z.boolean().optional(),
  Unit: z.string().optional(),
  Persistent: z.boolean().optional(),
  WakeSystem: z.boolean().optional(),
  RemainAfterElapse: z.boolean().optional(),
})

/**
 * @see {@link TimerSectionConfigSchema}
 * @see {@link ExecSectionConfig}
 */
export const TimerSectionSchema: ZodType<TimerSection> = TimerSectionConfigSchema
  .merge(ExecSectionSchema)
  .strict();

/**
 * Systemd Service schema in Zod
 */
export const TimerUnitSchema = implement<TimerUnit>().with({
  /**
   * @see {@link UnitSection}
   */
  Unit: UnitSectionSchema,
  /**
   * @see {@link InstallSectionConfig}
   */
  Install: InstallSectionSchema.optional(),
  /**
   * Combined Timer and Exec section
   * @see {@link TimerSectionConfig}
   * @see {@link ExecSectionConfig}
   */
  Timer: TimerSectionSchema,
});

export class TimerSectionBuilder {
  public section: ExecSectionConfig & TimerSection = {};

  public constructor(section: TimerSection = {}) {
    this.section = TimerSectionSchema.parse(section);
  }

  /**
   * Validate and return the UnitSection
   * @returns {TimerSection}
   */
  public toObject() {
    return TimerSectionSchema.parse(this.section);
  }

  /**
   * Set timer OnActiveSec
   * @see {@link TimerSection.OnActiveSec}
   */
  public setOnActiveSec(
    onActiveSec: TimerSection["OnActiveSec"]
  ) {
    this.section.OnActiveSec = onActiveSec;
    return this;
  }

  /**
   * Set timer OnBootSec
   * @see {@link TimerSection.OnBootSec}
   */
  public setOnBootSec(
    onBootSec: TimerSection["OnBootSec"]
  ) {
    this.section.OnBootSec = onBootSec;
    return this;
  }

  /**
   * Set timer OnStartupSec
   * @see {@link TimerSection.OnStartupSec}
   */
  public setOnStartupSec(
    onStartupSec: TimerSection["OnStartupSec"]
  ) {
    this.section.OnStartupSec = onStartupSec;
    return this;
  }

  /**
   * Set timer OnUnitActiveSec
   * @see {@link TimerSection.OnUnitActiveSec}
   */
  public setOnUnitActiveSec(
    onUnitActiveSec: TimerSection["OnUnitActiveSec"]
  ) {
    this.section.OnUnitActiveSec = onUnitActiveSec;
    return this;
  }

  /**
   * Set timer OnUnitInactiveSec
   * @see {@link TimerSection.OnUnitInactiveSec}
   */
  public setOnUnitInactiveSec(
    onUnitInactiveSec: TimerSection["OnUnitInactiveSec"]
  ) {
    this.section.OnUnitInactiveSec = onUnitInactiveSec;
    return this;
  }

  /**
   * Set timer OnCalendar
   * @see {@link TimerSection.OnCalendar}
   */
  public setOnCalendar(
    onCalendar: TimerSection["OnCalendar"]
  ) {
    this.section.OnCalendar = onCalendar;
    return this;
  }

  /**
   * Set timer AccuracySec
   * @see {@link TimerSection.AccuracySec}
   */
  public setAccuracySec(
    accuracySec: TimerSection["AccuracySec"]
  ) {
    this.section.AccuracySec = accuracySec;
    return this;
  }

  /**
   * Set timer RandomizedDelaySec
   * @see {@link TimerSection.RandomizedDelaySec}
   */
  public setRandomizedDelaySec(
    randomizedDelaySec: TimerSection["RandomizedDelaySec"]
  ) {
    this.section.RandomizedDelaySec = randomizedDelaySec;
    return this;
  }

  /**
   * Set timer FixedRandomDelay
   * @see {@link TimerSection.FixedRandomDelay}
   */
  public setFixedRandomDelay(
    fixedRandomDelay: TimerSection["FixedRandomDelay"]
  ) {
    this.section.FixedRandomDelay = fixedRandomDelay;
    return this;
  }

  /**
   * Set timer OnClockChange
   * @see {@link TimerSection.OnClockChange}
   */
  public setOnClockChange(
    onClockChange: TimerSection["OnClockChange"]
  ) {
    this.section.OnClockChange = onClockChange;
    return this;
  }

  /**
   * Set timer Unit
   * @see {@link TimerSection.Unit}
   */
  public setUnit(
    unit: TimerSection["Unit"]
  ) {
    this.section.Unit = unit;
    return this;
  }

  /**
   * Set timer Persistent
   * @see {@link TimerSection.Persistent}
   */
  public setPersistent(
    persistent: TimerSection["Persistent"]
  ) {
    this.section.Persistent = persistent;
    return this;
  }

  /**
   * Set timer WakeSystem
   * @see {@link TimerSection.WakeSystem}
   */
  public setWakeSystem(
    wakeSystem: TimerSection["WakeSystem"]
  ) {
    this.section.WakeSystem = wakeSystem;
    return this;
  }

  /**
   * Set timer RemainAfterElapse
   * @see {@link TimerSection.RemainAfterElapse}
   */
  public setRemainAfterElapse(
    remainAfterElapse: TimerSection["RemainAfterElapse"]
  ) {
    this.section.RemainAfterElapse = remainAfterElapse;
    return this;
  }
}

/* eslint-disable-next-line @typescript-eslint/no-empty-interface */
export interface TimerSectionBuilder extends ExecSectionBuilder {}

applyMixins(TimerSectionBuilder, [
  ExecSectionBuilder,
]);

export class Timer {
  private readonly unitSection: UnitSectionBuilder;
  private readonly timerSection: TimerSectionBuilder;
  private readonly installSection: InstallSectionBuilder;

  public constructor(timer: TimerUnit | unknown = {
    Unit: {},
    Timer: {},
  }) {
    const {Unit, Install, Timer: TimerObj} = TimerUnitSchema.parse(timer); 
    this.timerSection = new TimerSectionBuilder(TimerObj);
    this.unitSection = new UnitSectionBuilder(Unit);
    this.installSection = new InstallSectionBuilder(Install); 
  }

  public getTimerSection() {
    return this.timerSection;
  }

  public getUnitSection() {
    return this.unitSection;
  }

  public getInstallSection() {
    return this.installSection;
  }
  
  public toObject() {
    const object = {
      Unit: this.unitSection.toObject(),
      Install: this.installSection.toObject(),
      Timer: this.timerSection.toObject(),
    };

    return INI
      .fromObject(object)
      .toObject();
  }

  public toINIString() {
    const object = {
      Unit: this.unitSection.toObject(),
      Install: this.installSection.toObject(),
      Service: this.timerSection.toObject(),
    };

    return INI
      .fromObject(object)
      .toString();
  }

  /**
   * Create an service from an object
   */
  public static fromObject(obj: unknown) {
    if (obj instanceof Object) {
      const service = TimerUnitSchema.parse(obj);
      return new Timer(service);
    }
    throw new Error("Expected object");
  }

  /**
   * Create an service from an INI instance
   */
  public static fromINI(ini: INI) {
    if (ini instanceof INI) {
      const timer = TimerUnitSchema.parse(ini.toObject());
      return new Timer(timer);
    }
    throw new Error("Expected INI object");
  }
}
