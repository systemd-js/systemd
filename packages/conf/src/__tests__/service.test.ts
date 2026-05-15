import { describe, expect, it } from "vitest";
import { Service } from "../service.js";
import { INI } from "../ini.js";

const serviceObj = {
  Unit: {
    Description: "example",
    After: "network.target",
  },
  Install: {
    WantedBy: "multi-user.target",
  },
  Service: {
    ExecStartPre: [
      "/opt/example/agent start-1",
      "/opt/example/agent start-2",
    ],
    ExecStart: "/opt/example/agent start",
    EnvironmentFile: "/opt/example/.env",
    Restart: "always",
    WorkingDirectory: "/opt/example",
    KillMode: "mixed",
    PrivateTmp: true,
    User: "root",
  },
};
describe("Service", () => {
  describe("constructor", () => {
    it("should create a new service", () => {
      const service = new Service(serviceObj);
      expect(service.toObject()).toMatchObject(serviceObj);
    });

    it("should throw if service is not valid", () => {
      const invalidServiceObj = {
        ...serviceObj,
        Service: {
          ...serviceObj.Service,
          PrivateInvalid: "yes",
        },
      };
      expect(() => new Service(invalidServiceObj)).toThrow();
    });
  });

  describe("fromObject", () => {
    it("should create a new service from object", () => {
      const service = Service.fromObject(serviceObj);
      expect(service.toObject()).toMatchObject(serviceObj);
    });

    it("should throw if service is not valid", () => {
      const invalidServiceObj = {
        ...serviceObj,
        Service: {
          ...serviceObj.Service,
          PrivateInvalid: "yes",
        },
      };
      expect(() => Service.fromObject(invalidServiceObj)).toThrow();
    });
  });

  describe("fromString", () => {
    it("should create a new service from string", () => {
      const service = Service.fromINI(INI.fromObject(serviceObj));
      expect(service.toObject()).toMatchObject(serviceObj);
    });
    it("should throw if service is not valid", () => {
      const invalidServiceObj = {
        ...serviceObj,
        Service: {
          ...serviceObj.Service,
          PrivateInvalid: "yes",
        },
      };
      expect(() => Service.fromINI(INI.fromObject(invalidServiceObj))).toThrow();
    });
  });

  describe("builder", () => {
    it("should create a new service", () => {
      const service = new Service();
      service
        .getServiceSection()
        .setExecStartPre([
          "/opt/example/agent start-1",
          "/opt/example/agent start-2",
        ])
        .setExecStart("/opt/example/agent start")
        .setEnvironmentFile("/opt/example/.env")
        .setRestart("always")
        .setWorkingDirectory("/opt/example")
        .setKillMode("mixed")
        .setPrivateTmp(true)
        .setUser("root");

      service
        .getUnitSection()
        .setDescription("example")
        .setAfter("network.target");

      service
        .getInstallSection()
        .setWantedBy("multi-user.target")
        .setRequiredBy();

      expect(service.toObject()).toMatchObject(serviceObj);
    });
  });

  describe("v257 directives", () => {
    const baseObj = {
      Unit: { Description: "v257 test" },
      Service: {
        Type: "simple" as const,
        ExecStart: "/bin/true",
      },
    };

    it("round-trips notify-reload type with ExecReloadPost", () => {
      const obj = {
        ...baseObj,
        Service: {
          ...baseObj.Service,
          Type: "notify-reload" as const,
          ExecReload: "/bin/reload",
          ExecReloadPost: ["/bin/post1", "/bin/post2"],
          ReloadSignal: "SIGUSR1",
        },
      };
      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });

    it("round-trips RestartMode=debug", () => {
      const obj = {
        ...baseObj,
        Service: {
          ...baseObj.Service,
          Restart: "always" as const,
          RestartMode: "debug" as const,
        },
      };
      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });

    it("accepts numeric time-duration fields", () => {
      const obj = {
        ...baseObj,
        Service: {
          ...baseObj.Service,
          RestartSec: 30,
          TimeoutStartSec: 10,
          WatchdogSec: 5,
        },
      };
      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });

    it("accepts time-span string forms (5min 20s, infinity)", () => {
      const obj = {
        ...baseObj,
        Service: {
          ...baseObj.Service,
          RestartSec: "5min 20s",
          RuntimeMaxSec: "1h30min",
          RestartMaxDelaySec: "infinity",
          TimeoutStopSec: "30s",
          TimeoutAbortSec: "infinity",
        },
      };
      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });

    it("rejects unknown Type", () => {
      expect(() => new Service({
        ...baseObj,
        Service: { ...baseObj.Service, Type: "magic" as never },
      })).toThrow();
    });

    it("rejects unknown RestartMode", () => {
      expect(() => new Service({
        ...baseObj,
        Service: { ...baseObj.Service, RestartMode: "fancy" as never },
      })).toThrow();
    });

    it("exposes setExecReloadPost on the builder", () => {
      const svc = new Service();
      svc.getUnitSection().setDescription("builder test");
      svc.getServiceSection()
        .setType("notify-reload")
        .setExecStart("/bin/true")
        .setExecReload("/bin/reload")
        .setExecReloadPost(["/bin/post"])
        .setRestartMode("debug");

      expect(svc.toObject()).toMatchObject({
        Service: {
          Type: "notify-reload",
          ExecReloadPost: ["/bin/post"],
          RestartMode: "debug",
        },
      });
    });
  });
});
