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
