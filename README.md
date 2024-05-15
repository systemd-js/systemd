# Systemd

INI parser for systemd config files. Set of fluent builders to create and modify unit files.
Based on systemd v255.4

## Installation

```sh
yarn add @chyzwar/systemd
```

## Examples

Parse systemd ini file into object.

Note: Ini parser is not fully implemented, lacks support for escaping and quoting.

```ts
import {INI} from "@chyzwar/systemd";

const unit = `
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

const ini = INI.fromString(unit).toObject();

{
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

```

Create service unit for ini string and modify service user definition.

```ts
const unit = `
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

const ini = INI.fromString(unit)
const service = Service.fromINI(ini)

service
  .getServiceSection()
  .setUser("test")

service.toINIString();
```

Create service unit using fluent builder

```ts
import {Service} from "@chyzwar/systemd";

const service = new Service();

service
  .getUnitSection()
  .setDescription("This is a example unit")

service
  .getInstallSection()
  .setWantedBy("multi-user.target")
  
service
 .getServiceSection()
 .setType("simple")
 .setWorkingDirectory("/tmp")
 .setRestart("always")
 .setExecStartPre("/usr/bin/echo 'Before'")
 .setExecStart("/usr/bin/echo 'Hello World'")
 .setExecStartPost("/usr/bin/echo 'After'")
```

Create timer unit using fluent builder

```ts
const timer = new Timer()

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
```
