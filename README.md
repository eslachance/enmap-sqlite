# Enmap-SQLite

Enmap-SQLite is a provider for the [Enmap](https://www.npmjs.com/package/enmap) module. 

## Installation

To install Enmap-SQLite simply run `npm i enmap-sqlite`.

## Usage

```js
// Load Enmap
const Enmap = require('enmap');
 
// Load EnmapSQLite
const EnmapSQLite = require('enmap-sqlite');
 
// Initialize the provider
const provider = new EnmapSQLite({ name: 'test' });
 
// Initialize the Enmap with the provider instance.
const myColl = new Enmap({ provider: provider });
```

Shorthand declaration: 

```js
const Enmap = require('enmap');
const EnmapSQLite = require('enmap-sqlite');
const myColl = new Enmap({ provider: new EnmapSQLite({ name: 'test' }); });
```

## Options

```js
// Example with all options.
const level = new EnmapSQLite({ 
  dataDir: './enmap.sqlite'
});
```

### dataDir 

Indicates the directory where to hold the sqlite file. If multiple enmap use the same file, a new table is created for each. The filename is always `enmap.sqlite`.
