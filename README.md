# huawei-lte-api

A Node.js library for interacting with Huawei LTE modems and routers.

## Installation

```bash
npm install huawei-lte-api
```

## Usage

### CommonJS

```javascript
const HuaweiLTEAPI = require('huawei-lte-api');
```

### ES6 Modules

```javascript
import HuaweiLTEAPI from 'huawei-lte-api';
```

### Initialize

```javascript
const api = new HuaweiLTEAPI('192.168.8.1','admin','admin'); // Replace with your modem's IP, username and password, default 'admin'
```

## Examples

### Read SMS

```javascript
const messages = await api.readSMS();
console.log(messages);
```

### Send SMS

```javascript
const result = await api.sendSMS('1234567890', 'Hello, world!');
console.log(result);
```

### Delete SMS

```javascript
const result = await api.deleteSMS(1); // Delete SMS with index 1
console.log(result);
```

### Get Device Information

```javascript
const info = await api.getDeviceInformation();
console.log(info);
```

### Get Connection Status

```javascript
const status = await api.getConnectionStatus();
console.log(status);
```

### Get Traffic Statistics

```javascript
const stats = await api.getTrafficStatistics();
console.log(stats);
```

### Get Signal Strength

```javascript
const signal = await api.getSignalStrength();
console.log(signal);
```

### Get DDNS Settings

```javascript
const ddns = await api.getDDNSSettings();
console.log(ddns);
```

## Note

This library is designed to work with Huawei LTE modems and routers. It has been tested with the B311-221 model but should work with other similar models. Some API endpoints may vary depending on the specific firmware version of your device.

## License

MIT

## Contributing

Contributions are welcome!