const db = require(__dirname + "/db_connect");
// //404頁面
// const HttpError = require("../models/http-error");
const express = require("express");
const router = express.Router();
const moment = require("moment");

//history order required
const GetApi = async (req) => {
  const perPage = 5;
  let page = parseInt(req.params.page) || 1;
  const output = {
    // page: page,
    perPage: perPage,
    totalRows: 0, // 總共有幾筆資料
    totalPages: 0, //總共有幾頁
    rows: [],
  };
  const [r1] = await db.query("SELECT COUNT(1) num FROM orders");
  output.totalRows = r1[0].num;
  output.totalPages = Math.ceil(output.totalRows / perPage);
  if (page < 1) page = 1;
  if (page > output.totalPages) page = output.totalPages;
  if (output.totalPages === 0) page = 0;
  output.page = page;

  if (!output.page) {
    return output;
  }
  const sql =
    "SELECT * FROM orderitemlist INNER JOIN orders WHERE `orders`.`created_at` = `orderitemlist`.`create_time`";

  const [r2] = await db.query(sql);
  if (r2) output.rows = r2;
  for (let i of r2) {
    // console.log(i.created_at)
    i.created_at = moment(i.created_at).format("YYYY-MM-DD");
  }
  return output;
};

//test route
router.get("/test", async (req, res) => {
  console.log(req.body);
  const output = {
    success: false,
  };
  const sql = "SELECT * FROM `OrderTb`";
  db.query(sql).then(([r]) => {
    output.results = r;
    if (r.affectedRows && r.insertId) {
      output.success = true;
    }
    res.json(output);
  });
});

router.post("/orderList", async (req, res) => {
  // console.log(req.body.paymentdata)
  // console.log(req.body.orderDelivery.data)
  // console.log(req.body.selectCartItems)
  // console.log(req.body.selectCartTotal)
  //新增req.body.selectCartTotal至selectCartItems,欄位名稱Total
  for (let i of req.body.selectCartItems) {
    i.Total = req.body.selectCartTotal;
  }
  // console.log(req.body.selectCartItems)
  // console.log(Items)
  // const orderId = req.session.orderId;
  const creditcardSQL = "INSERT INTO creditcards set ?";
  const [creditcarddata] = await db.query(creditcardSQL, [
    req.body.paymentdata,
  ]);

  const orderDeliverySQL = "INSERT INTO ordercheckoutpage set ?";
  const [orderDelivery] = await db.query(orderDeliverySQL, [
    req.body.orderDelivery.data,
  ]);

  const orderItemSQL = "INSERT INTO orderitemlist set ?";
  req.body.selectCartItems.forEach((el) => {
    db.query(orderItemSQL, [el]);
  });

  // data[0].forEach((element) => {
  //   element.classTime = moment(element.classTime).format("YYYY/MM/DD");
  // });
  // res.json(data);
});

module.exports = router;
