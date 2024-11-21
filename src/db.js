const sqlite = require('better-sqlite3');
const path = require('path');
const db = new sqlite(path.join(__dirname, './flashcards.db'), {fileMustExist: true});

exports.db = db;
