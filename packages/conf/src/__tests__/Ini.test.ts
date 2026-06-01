import { describe, expect, test } from "vitest";
import { INI } from "../ini.js";
import { Service } from "../service.js";

describe("INI - fromObject and toObject", () => {
  test("should return same object", () => {
    const data = {
      section1: {
        key1: "value1",
        key2: true,
      },
      section2: {
        key3: "value3",
        key4: false,
      },
    };

    const result = INI.fromObject(data).toObject();
    expect(result).toEqual(data);
  });
});

const dataUnit = `
[Unit]
Description=example
After=network.target

[Install]
WantedBy=multi-user.target

[Service]
ExecStartPre=/opt/example/agent start-1
ExecStartPre=/opt/example/agent start-2
ExecStart=/opt/example/agent start
EnvironmentFile=/opt/example/.env
Restart=always
PrivateTmp=yes
User=root
`;

const dataUnitWithBackslash = `
[Unit]
Description=example
After=network.target

[Service]
ExecStartPre=/opt/example/agent start-1
ExecStartPre=/opt/example/agent start-2 \
  --option1=value1 \
  --option2=value2 \
  --option3=value3
User=root
`;

const unitOnlyDesc = `
[Unit]
Description=example
`;

describe("INI - fromString", () => {
  test("should parse INI data", () => {
    const expected = {
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
        PrivateTmp: true,
        User: "root",
      },
    };
    const object = INI.fromString(dataUnit).toObject();
    expect(object).toEqual(expected);
  });

  test("should omit undefined values", () => {
    const obj = {
      Unit: {
        Description: "example",
        After: undefined,
      },
    };
    const ini = INI.fromObject(obj);
    const result = ini.toString();
    expect(result.trim()).toEqual(unitOnlyDesc.trim());
  });

  test("should parse INI data with line dataUnitWithBackslash", () => {
    const expected = {
      Unit: {
        Description: "example",
        After: "network.target",
      },
      Service: {
        ExecStartPre: [
          "/opt/example/agent start-1",
          "/opt/example/agent start-2   --option1=value1   --option2=value2   --option3=value3",
        ],
        User: "root",
      },
    };
    const object = INI.fromString(dataUnitWithBackslash).toObject();
    expect(object).toEqual(expected);
  });
});

const dataIni = `
[section1]
key1=value1
key2=yes

[section2]
key3=value3
key4=no
`;

describe("INI - fromString and toString", () => {
  test("should return same data", () => {
    const result = INI.fromString(dataIni).toString();

    expect(result.trim()).toStrictEqual(dataIni.trim());
  });
});

describe("INI - value coercion", () => {
  test("should keep octal / leading-zero values as strings", () => {
    const result = INI.fromString("[X]\nUMask=0077").toObject();

    expect(result).toEqual({ X: { UMask: "0077" } });
  });

  test("should parse 0 and 1 as numbers, not booleans", () => {
    const result = INI.fromString("[X]\nA=0\nB=1\nC=200").toObject();

    expect(result).toEqual({ X: { A: 0, B: 1, C: 200 } });
  });

  test("should keep infinity tokens as strings", () => {
    const result = INI.fromString("[X]\nA=infinity\nB=Infinity\nC=-infinity").toObject();

    expect(result).toEqual({ X: { A: "infinity", B: "Infinity", C: "-infinity" } });
  });

  test("should not throw on a unit with UMask / RestartSec=1 / OOMScoreAdjust=0", () => {
    const unit = [
      "[Unit]",
      "Description=x",
      "[Service]",
      "ExecStart=/bin/true",
      "UMask=0022",
      "RestartSec=1",
      "OOMScoreAdjust=0",
    ].join("\n");

    const service = Service.fromINI(INI.fromString(unit));
    const ini = service.toINIString();

    expect(ini).toContain("UMask=0022");
    expect(ini).toContain("RestartSec=1");
    expect(ini).toContain("OOMScoreAdjust=0");
  });
});
