import { describe, expect, it } from "vitest";
import { Service } from "../service.js";

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
    // PrivateTmp: true,
    User: "root",
  },
};
describe("Service", () => {
  describe('constructor', () => {
    it('should create a new service', () => {
      const service = new Service(serviceObj);
      expect(service.toObject()).toMatchObject(serviceObj);
    });

    it('should throw if service is not valid', () => {
      const invalidServiceObj = {
        ...serviceObj,
        Service: {
          ...serviceObj.Service,
          PrivateInvalid: "yes"
        }
      }
      expect(() => new Service(invalidServiceObj)).toThrow();
    })
  });
});
