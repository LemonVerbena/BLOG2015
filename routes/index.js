var express = require('express');
var router = express.Router();  //创建路由实例

/* GET home page. */
router.get('/', function(req, res) {   //捕获访问主页的GET请求
  res.render('index', { title: 'Express' });
});

module.exports = router;//导出路由，并在app中以app.use('/',routes)加载
