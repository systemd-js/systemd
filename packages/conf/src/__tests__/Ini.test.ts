import { describe, expect, test } from "vitest";
import { INI } from "../ini.js";

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
ExecPreStart=/opt/example/agent start-1
ExecPreStart=/opt/example/agent start-2
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
ExecPreStart=/opt/example/agent start-1
ExecPreStart=/opt/example/agent start-2 \
  --option1=value1 \
  --option2=value2 \
  --option3=value3
User=root
`;

const unitOnlyDesc = `
[Unit]
Description=example
`

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
        ExecPreStart: [
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
  })

  test("should parse INI data with line dataUnitWithBackslash", () => {
    const expected = {
      Unit: {
        Description: "example",
        After: "network.target",
      },
      Service: {
        ExecPreStart: [
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
