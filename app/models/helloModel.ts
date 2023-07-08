import db from "./db";

class HelloModel {
  fetchAll(result: Function) {
    const sql = `SELECT * FROM test`;

    db.query(sql, (err, res) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, res);
      return;
    });
  }
}

export default HelloModel;
