const Sqlite = require('sqlite-pool');
const path = require('path');
const fs = require('fs');

class EnmapSQLite {

  constructor(options) {
    this.defer = new Promise((resolve) => {
      this.ready = resolve;
    });

    if (!options.name) throw new Error('Must provide options.name');
    this.name = options.name;

    this.validateName();
    this.dataDir = path.resolve(process.cwd(), options.dataDir || 'data');
    if (!options.dataDir) {
      if (!fs.existsSync('./data')) {
        fs.mkdirSync('./data');
      }
    }
    console.log(this.dataDir);
    this.db = new Sqlite(`${this.dataDir}${path.sep}enmap.sqlite`);
  }

  /**
   * Internal method called on persistent Enmaps to load data from the underlying database.
   * @param {Map} enmap In order to set data to the Enmap, one must be provided.
   * @returns {Promise} Returns the defer promise to await the ready state.
   */
  async init(enmap) {
    const table = await this.db.get(`SELECT count(*) FROM sqlite_master WHERE type='table' AND name = '${this.name}';`);
    if (!table['count(*)']) {
      await this.db.run(`CREATE TABLE ${this.name} (key text PRIMARY KEY, value text)`);
    }
    this.db.each(`SELECT * FROM ${this.name};`, row => {
      let parsedValue = row.value;
      if (row.value[0] === '[' || row.value[0] === '{') {
        parsedValue = JSON.parse(row.value);
      }
      enmap.set(row.key, parsedValue);
    }).then(total => {
      console.log(`${total} rows loaded.`);
      this.ready();
    });
    return this.defer;
  }

  /**
   * Shuts down the underlying persistent enmap database.
   */
  close() {
    this.db.close();
  }

  /**
   * Set a value to the Enmap.
   * @param {(string|number)} key Required. The key of the element to add to the EnMap object.
   * If the EnMap is persistent this value MUST be a string or number.
   * @param {*} val Required. The value of the element to add to the EnMap object.
   * If the EnMap is persistent this value MUST be stringifiable as JSON.
   */
  set(key, val) {
    if (!key || !['String', 'Number'].includes(key.constructor.name)) {
      throw new Error('SQLite require keys to be strings or numbers.');
    }
    const insert = typeof val === 'object' ? JSON.stringify(val) : val;
    this.db.run(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?);`, [key, insert]);
  }

  /**
   * Asynchronously ensure a write to the Enmap.
   * @param {(string|number)} key Required. The key of the element to add to the EnMap object.
   * If the EnMap is persistent this value MUST be a string or number.
   * @param {*} val Required. The value of the element to add to the EnMap object.
   * If the EnMap is persistent this value MUST be stringifiable as JSON.
   */
  async setAsync(key, val) {
    if (!key || !['String', 'Number'].includes(key.constructor.name)) {
      throw new Error('SQLite require keys to be strings or numbers.');
    }
    const insert = typeof val === 'object' ? JSON.stringify(val) : val;
    await this.db.run(`INSERT OR REPLACE INTO ${this.name} (key, value) VALUES (?, ?);`, [key, insert]);
  }

  /**
   * Delete an entry from the Enmap.
   * @param {(string|number)} key Required. The key of the element to delete from the EnMap object.
   * @param {boolean} bulk Internal property used by the purge method.
   */
  delete(key) {
    this.db.exec(`DELETE FROM ${this.name} WHERE key = '${key}'`);
  }

  /**
   * Asynchronously ensure an entry deletion from the Enmap.
   * @param {(string|number)} key Required. The key of the element to delete from the EnMap object.
   * @param {boolean} bulk Internal property used by the purge method.
   */
  async deleteAsync(key) {
    await this.db.exec(`DELETE FROM ${this.name} WHERE key = '${key}'`);
  }

  /**
   * Internal method used to validate persistent enmap names (valid Windows filenames)
   * @private
   */
  validateName() {
    // Do not delete this internal method.
    this.name = this.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

}

module.exports = EnmapSQLite;
