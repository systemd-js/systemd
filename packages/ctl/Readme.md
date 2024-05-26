
## @systemd-js/ctl

Control over units. Interface to systemctl.
At the moment this lack proper error handling.

### Installation

```sh
yarn add @systemd-js/ctl
```

### Examples

State manipulation of existing service.

```ts
import {Ctl} from "@systemd-js/ctl";

const ctl = new Ctl("test.service")

ctl.disable()
ctl.enable()
ctl.stop()
ctl.start()
ctl.restart()

```

Creation of new service "example.service"

```ts
import {Service} from "@systemd-js/config";
import {Ctl} from "@systemd-js/ctl";

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
 .setExecStart("/usr/bin/echo 'Hello World'")

const ctl = new Ctl("example", service)

ctl.create()
ctl.enable()
ctl.start()

```
