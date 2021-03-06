# Winston pre-formatted logger

<ul>
    <li><a href="#install">Install</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#documentation">Documentation</a></li>
</ul>

<a name="install"></a>
# Install
`npm install winston-preformatted-logger`

`yarn add winston-preformatted-logger`

<a name="usage"></a>
# Usage

#### How to initialise the module

In your project, first declare the module
```javascript 1.8
const Logger = require('winston-preformatted-logger');
```

Next, create a new instance
```javascript 1.8
// Example

//Optional - defaults
const logOptions = {
    logFolder: './logs',
    logLevel: 'info',
    logFilename: '%DATE%'

    // ONLY ANSI colors!
    colors: {
        INFO: "\u001B[0m",
        DEBUG: "\u001B[37m",
        WARN: "\u001B[33m",
        ERROR: "\u001B[31m"
    }
}

const log = new Logger(logOptions).logger;
```

#### Using the module
Possible log levels are:

* info
* debug
* warn
* stack //Use this instead of error!

A typical log line will look something like this:
```
log.info("info message");

2018-05-11 12:49:09.641 [INFO]: info message
```
However, it is possible to include 'from', 'label', and 'metadata' (All optional). The log line format is constructed as
```
DATE TIME [LEVEL][FROM]: [LABEL] - info message
{
    extra: "information"
}
```
To fully use all options a basic info log line would look like this:
```
log.info("info message", {from: "readMe.md", label:"example", meta: {author: {firstName: "Max", lastName: "van de Laar"}}});

2018-05-11 13:23:09.044 [INFO][readMe.md]: example - info message
{
    "author": {
        "firstName": "Max",
        "lastName": "van de Laar"
    }
}
```

<a name="documentation"></a>
#Documentation
<a name="Logger"></a>

## Logger
**Kind**: global class  
<a name="new_Logger_new"></a>

### new Logger([module], [settings], [logOptions])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [module] | <code>Object</code> |  | Add the current module to determine the root info |
| [settings] | <code>Object</code> |  | Destination of the generated log files. |
| [settings.logFolder] | <code>string</code> | <code>&quot;./logs&quot;</code> | Destination of the generated log files. |
| [settings.logLevel] | <code>string</code> | <code>&quot;info&quot;</code> | The log level. |
| [settings.logFilename] | <code>string</code> | <code>&quot;%DATE%&quot;</code> | The log file's name. |
| [settings.logFileDatePattern] | <code>string</code> | <code>&quot;YYYY-DD-MM&quot;</code> | The date pattern inside the log file's name. |
| [settings.colors] | <code>Object</code> |  | Colors of the log levels (Uppercase). |
| [logOptions] | <code>Object</code> |  | Sets the 'from' options in the log line. |
| [logOptions.from] | <code>string</code> |  | Sets the 'from' options in the log line. |
| [logOptions.label] | <code>string</code> |  | Sets the 'label' options in the log line. |
| [logOptions.meta] | <code>Object</code> |  | Include default metadata to the log line. |

