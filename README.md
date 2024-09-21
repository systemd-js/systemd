# Systemd.js

![Publish](https://github.com/systemd-js/systemd/actions/workflows/publish.yaml/badge.svg)

Collection of packages useful when interfacing with systemd.

## @systemd-js/conf

- INI parser for systemd config files.
- Fluent builders to create and modify unit files.

Based on systemd v255.4

### Installation

```sh
yarn add @systemd-js/conf
```

### Examples

Parse systemd ini file into object.

Note: Ini parser is not fully implemented, lacks support for escaping and
quoting.

```ts
import {INI} from "@systemd-js/conf";

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

const ini = INI.fromString(unit);
const service = Service.fromINI(ini);

service
  .getServiceSection()
  .setUser("test");

service.toINIString();
```

Create service unit using fluent builder

```ts
import { Service } from "@systemd-js/config";

const service = new Service();

service
  .getUnitSection()
  .setDescription("This is a example unit");

service
  .getInstallSection()
  .setWantedBy("multi-user.target");

service
  .getServiceSection()
  .setType("simple")
  .setWorkingDirectory("/tmp")
  .setRestart("always")
  .setExecStartPre("/usr/bin/echo 'Before'")
  .setExecStart("/usr/bin/echo 'Hello World'")
  .setExecStartPost("/usr/bin/echo 'After'");
```

Create timer unit using fluent builder

```ts
import { Timer } from "@systemd-js/config";
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
```

## @systemd-js/ctl

Control over units. Interface to systemctl. At the moment this lack proper error
handling.

### Installation

```sh
yarn add @systemd-js/ctl
```

### Examples

State manipulation of existing service.

```ts
import { Ctl } from "@systemd-js/ctl";

const ctl = new Ctl("test.service");

ctl.isActive();
ctl.isEnabled();
ctl.write();
ctl.disable();
ctl.enable();
ctl.stop();
ctl.start();
ctl.restart();
```

Creation of new service "example.service"

```ts
import { Service } from "@systemd-js/config";
import { Ctl } from "@systemd-js/ctl";

const service = new Service();

service
  .getUnitSection()
  .setDescription("This is a example unit");

service
  .getInstallSection()
  .setWantedBy("multi-user.target");

service
  .getServiceSection()
  .setType("simple")
  .setExecStart("/usr/bin/echo 'Hello World'");

const ctl = new Ctl("example", service);

ctl.write();
ctl.enable();
ctl.start();
```

In addition to `Ctl` class, package expose functions to call systemctl directly.

```ts
import { restart, start, stop } from "@systemd-js/ctl";

write("example.service");
stop("example.service");
start("example.service");
enable("example.service");
disable("example.service");
reload("example.service");
restart("example.service");
isActive("example.service");
isEnabled("example.service");
daemonReload();
```
