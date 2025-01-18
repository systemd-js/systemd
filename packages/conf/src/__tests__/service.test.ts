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
});
