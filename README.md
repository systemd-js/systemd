# Systemd

Fluent builders for systemd unit configs

```ts
import {Service} from "@chywar/systemd";

const service = new Service();

service
  .getUnitSection()
  .setDescription("This is a test unit")

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
