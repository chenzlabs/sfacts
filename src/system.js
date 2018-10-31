import levelUp from 'levelup';
import levelDown from 'leveldown';
import levelGraph from 'levelgraph';
import levelGraphRecursive from 'levelgraph-recursive';

import expand from './expand';

const clean = function clean(dbName, cb) {
  levelDown.destroy(dbName, (err) => {
    cb(err);
  });
};

const create = function create(dbName, cleanDb, cb) {
  const postClean = () => levelUp(dbName, { db: levelDown }, (err, leveldb) => {
    if (err) {
      return cb(err);
    }
    const db = levelGraphRecursive(levelGraph(leveldb));
    return cb(err, expand(db, leveldb));
  });

  if (cleanDb) {
    return clean(dbName, (err) => {
      if (err) {
        return cb(err);
      }
      return postClean();
    });
  }
  return postClean();
};

// Same as create except you can load additional data into the system
const load = function load(dbName, files, cleanDb, cb) {
  create(dbName, cleanDb, (err, db) => {
    if (err) {
      return cb(err);
    }
    return db.loadFiles(files, (err2) => {
      cb(err2, db);
    });
  });
};

export default {
  clean,
  create,
  load,
};
