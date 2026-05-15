import { describe, expect, it } from "vitest";
import { INI } from "../ini.js";
import { Service } from "../service.js";

const baseObj = {
  Unit: { Description: "rsrc test" },
  Service: {
    Type: "simple" as const,
    ExecStart: "/bin/true",
  },
};

describe("Resource section", () => {
  describe("round-trip", () => {
    it("preserves multi-assignment directives through INI string", () => {
      const obj = {
        ...baseObj,
        Service: {
          ...baseObj.Service,
          IODeviceWeight: ["/dev/sda 200", "/dev/sdb 100"],
          IOReadBandwidthMax: "/dev/sda 5M",
          IPAddressAllow: ["10.0.0.0/8", "::1"],
          IPAddressDeny: "any",
          SocketBindAllow: ["ipv6:tcp", "ipv4:udp:10000-65535"],
          RestrictNetworkInterfaces: ["eth0", "eth1"],
          DeviceAllow: ["/dev/null rw", "char-pts rw"],
          BPFProgram: "egress:/sys/fs/bpf/egress-hook",
        },
      };

      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });

    it("preserves single-value enum and boolean directives", () => {
      const obj = {
        ...baseObj,
        Service: {
          ...baseObj.Service,
          DevicePolicy: "strict" as const,
          Delegate: "cpu io",
          DelegateSubgroup: "supervisor",
          ManagedOOMSwap: "kill" as const,
          ManagedOOMMemoryPressure: "kill" as const,
          ManagedOOMMemoryPressureLimit: "60%",
          ManagedOOMMemoryPressureDurationSec: "5s",
          ManagedOOMPreference: "avoid" as const,
          MemoryPressureWatch: "auto" as const,
          MemoryPressureThresholdSec: "150ms",
          MemoryZSwapWriteback: false,
          CoredumpReceive: true,
          IPAccounting: true,
          Slice: "system.slice",
        },
      };

      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });

    it("accepts ResourceLimit suffix variants", () => {
      const obj = {
        ...baseObj,
        Service: {
          ...baseObj.Service,
          MemoryMax: "512M" as const,
          MemoryHigh: "1G" as const,
          MemoryLow: "10%" as const,
          MemoryMin: "infinity" as const,
          MemorySwapMax: "256M" as const,
          TasksMax: "50%" as const,
        },
      };

      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });

    it("accepts Delegate as boolean", () => {
      const obj = {
        ...baseObj,
        Service: { ...baseObj.Service, Delegate: true },
      };

      const svc = new Service(obj);
      const round = Service.fromINI(INI.fromString(svc.toINIString()));
      expect(round.toObject()).toMatchObject(obj);
    });
  });

  describe("validation", () => {
    it("rejects garbage TasksMax", () => {
      expect(() => new Service({
        ...baseObj,
        Service: { ...baseObj.Service, TasksMax: "garbage" as never },
      })).toThrow();
    });

    it("rejects invalid ResourceLimit suffix", () => {
      expect(() => new Service({
        ...baseObj,
        Service: { ...baseObj.Service, MemoryMax: "10Q" as never },
      })).toThrow();
    });

    it("rejects unknown DevicePolicy", () => {
      expect(() => new Service({
        ...baseObj,
        Service: { ...baseObj.Service, DevicePolicy: "open" as never },
      })).toThrow();
    });

    it("rejects unknown ManagedOOMPreference", () => {
      expect(() => new Service({
        ...baseObj,
        Service: { ...baseObj.Service, ManagedOOMPreference: "preferred" as never },
      })).toThrow();
    });
  });

  describe("builder", () => {
    it("sets new resource directives via setters", () => {
      const svc = new Service();
      svc.getUnitSection().setDescription("rsrc builder");
      svc.getServiceSection()
        .setType("simple")
        .setExecStart("/bin/true")
        .setIODeviceWeight(["/dev/sda 200", "/dev/sdb 100"])
        .setIPAddressAllow(["10.0.0.0/8"])
        .setDevicePolicy("strict")
        .setDelegate("cpu io")
        .setManagedOOMSwap("kill")
        .setMemoryZSwapWriteback(false)
        .setCoredumpReceive(true)
        .setTasksMax("50%");

      expect(svc.toObject()).toMatchObject({
        Service: {
          Type: "simple",
          ExecStart: "/bin/true",
          IODeviceWeight: ["/dev/sda 200", "/dev/sdb 100"],
          IPAddressAllow: ["10.0.0.0/8"],
          DevicePolicy: "strict",
          Delegate: "cpu io",
          ManagedOOMSwap: "kill",
          MemoryZSwapWriteback: false,
          CoredumpReceive: true,
          TasksMax: "50%",
        },
      });
    });
  });
});
