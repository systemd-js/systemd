import { describe, expect } from "vitest";
import { INI } from "../ini.js";

describe("INI - fromObject and toObject", () => {
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

describe("INI - fromString", () => {
  const data = `
    [Unit]
    Description=deployer
    After=network.target

    [Install]
    WantedBy=multi-user.target

    [Service]
    ExecPreStart=/opt/deployer/agent start-1
    ExecPreStart=/opt/deployer/agent start-2
    ExecStart=/opt/deployer/agent start
    EnvironmentFile=/opt/deployer/.env
    Restart=always
    PrivateTmp=yes
    User=root
  `;

  const expected = {
    Unit: {
      Description: "deployer",
      After: "network.target",
    },
    Install: {
      WantedBy: "multi-user.target",
    },
    Service: {
      ExecPreStart: [
        "/opt/deployer/agent start-1",
        "/opt/deployer/agent start-2",
      ],
      ExecStart: "/opt/deployer/agent start",
      EnvironmentFile: "/opt/deployer/.env",
      Restart: "always",
      PrivateTmp: true,
      User: "root",
    },
  };

  const object = INI.fromString(data).toObject();
  expect(object).toEqual(expected);
});

describe("INI - fromString and toString", () => {
  const data = `
[section1]
key1=value1
key2=yes

[section2]
key3=value3
key4=no
`;

  const result = INI.fromString(data).toString();
  expect(result.trim()).toEqual(data.trim());
});
