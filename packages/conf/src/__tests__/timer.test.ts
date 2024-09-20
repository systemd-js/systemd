import { describe, expect, it } from "vitest";
import { Timer } from "../timer.js";
const timerObj = {
  Unit: {
    Description: "example",
    After: "network.target",
  },
  Install: {
    WantedBy: "multi-user.target",
  },
  Timer: {
    OnCalendar: "daily",
    Unit: "postgresql-dump.target",
  },
};

describe("Timer", () => {
  describe("constructor", () => {
    it("should create a new service", () => {
      const service = new Timer(timerObj);
      expect(service.toObject()).toMatchObject(timerObj);
    });

    it("should throw if timer is not valid", () => {
      const invalidTimerObj = {
        ...timerObj,
        Timer: {
          ...timerObj.Timer,
          PrivateInvalid: "yes",
        },
      };
      expect(() => new Timer(invalidTimerObj)).toThrow();
    });
  });

  describe("fromObject", () => {
    it("should create a new timer from object", () => {
      const timer = Timer.fromObject(timerObj);
      expect(timer.toObject()).toMatchObject(timerObj);
    });

    it("should throw if timer is not valid", () => {
      const invalidTimerObj = {
        ...timerObj,
        Timer: {
          ...timerObj.Timer,
          PrivateInvalid: "yes",
        },
      };
      expect(() => Timer.fromObject(invalidTimerObj)).toThrow();
    });
  });

  describe("builder", () => {
    it("should create a new timer", () => {
      const timer = new Timer();

      timer
        .getUnitSection()
        .setDescription("example")
        .setAfter("network.target");

      timer
        .getInstallSection()
        .setWantedBy("multi-user.target");

      timer
        .getTimerSection()
        .setOnCalendar("daily")
        .setUnit("postgresql-dump.target");

      expect(timer.toObject()).toMatchObject(timerObj);
    });
  });
});
