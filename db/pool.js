const sqlite3 = require("sqlite3").verbose();

module.exports = new sqlite3.Database("./root.db", (error) => {
  if (error) {
    return console.error(error.message);
  }
});
