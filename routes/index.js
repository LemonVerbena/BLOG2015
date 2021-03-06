//var express = require('express');
//var router = express.Router();  //创建路由实例
//
///* GET home page. */
//router.get('/', function(req, res) {   //捕获访问主页的GET请求
//  res.render('index', { title: 'Express' });
//});
//
//module.exports = router;//导出路由，并在app中以app.use('/',routes)加载
//
var crypto = require('crypto'),   //引入crypto模块（生成散列值来加密密码）
    User = require('../models/user.js'),  //引入user.js用户模型文件
    Post = require('../models/post.js');  //引入post.js发表文章模型文件

module.exports = function(app){
///   '/'的get请求

//  app.get('/',function(req,res){
//    res.render('index',{
//      title: '主页',
//      user: req.session.user,
//      success: req.flash('success').toString(),
//      error: req.flash('error').toString()
//    });
//  });
  app.get('/', function (req, res) {
    Post.getAll(null, function (err, posts) { //第一个参数为“null”，则遍历所有已发表的文章，在主页显示。
      if (err) {
        posts = [];
      }
      res.render('index', {
        title: '主页',
        user: req.session.user,
        posts: posts,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });
  });

///   '/reg'的get请求
  app.get('/reg', checkNotLogin);
  app.get('/reg',function(req,res){
    res.render('reg',{
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
///   '/reg'的post请求
  app.post('/reg', checkNotLogin);
  app.post('/reg',function(req,res){
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body['password-repeat'];
    //检验用户两次输入的密码是否一致
    if (password_re != password) {
      req.flash('error', '两次输入的密码不一致!');
      return res.redirect('/reg');//返回注册页;        redirect:重定向，实现页面跳转。
    }
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: name,
      password: password,
      email: req.body.email
    });
    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      if (user) {
        req.flash('error', '用户已存在!');
        return res.redirect('/reg');//返回注册页
      }
      //如果不存在则新增用户
      newUser.save(function (err, user) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg');//注册失败返回注册页
        }
        req.session.user = user;//用户信息存入 session
        req.session.name = name;
        req.flash('success', '注册成功!');
        res.redirect('/');//注册成功后返回主页
      });
    });
  });


///   '/login'的get请求
  app.get('/login', checkNotLogin);
  app.get('/login',function(req,res){
    res.render('login',{
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
///   '/login'的post请求
  app.post('/login', checkNotLogin);
  app.post('/login',function(req,res){
    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    //检查用户是否存在
    User.get(req.body.name, function (err, user) {
      if (!user) {
        req.flash('error', '用户不存在!');
        return res.redirect('/login');//用户不存在则跳转到登录页
      }
      //检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误!');
        return res.redirect('/login');//密码错误则跳转到登录页
      }
      //用户名密码都匹配后，将用户信息存入 session
      req.session.user = user;
      req.session.name = req.body.name;
      req.flash('success', '登陆成功!');
      res.redirect('/');//登陆成功后跳转到主页
    });
  });

  app.get('/post', checkLogin);
  app.get('/post',function(req,res){
    res.render('post',{
      title:'发表文章',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post',function(req,res){
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/');//发表成功跳转到主页
    });
  });

  app.get('/logout', checkLogin);
  app.get('/logout',function(req,res){
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
  });

  app.get('/upload',checkLogin);
  app.get('/upload',function(req,res){
    res.render('upload',{
      title: '文件上传',
      user: req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
  app.post('/upload',checkLogin);
  app.post('/upload',function(req,res){
    req.flash('success','文件上传成功！');
    res.redirect('/upload');
  });

  app.get('/u/:name',function(req,res){
    User.get(req.params.name,function(err,user){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      if(!user){
        req.flash('error','用户不存在！');
        return  res.redirect('/');
      }
      Post.getAll(user.name,function(err,docs){
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        res.render('user',{
          title: user.name,
          posts: docs,
          user: req.session.user,
          success: req.flash('success').toString(),
          error: req.flash('error').toString()
        })
      });
    });
  });

  app.get('/u/:name/:day/:title',function(req,res){
    Post.getOne(req.params.name,req.params.day,req.params.title,function(err,doc){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('article',{
        title:req.params.title,
        user: req.session.user,
        post: doc,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    })

  });


  app.get('/edit/:name/:day/:title',checkLogin);
  app.get('/edit/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.edit(currentUser.name,req.params.day,req.params.title,function(err,doc){
      if(err){
        req.flash('error',err);
        return res.redirect('/');
      }
      res.render('edit',{
        title: '编辑',
        post: doc ,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      })
    })
  });

  app.post('/edit/:name/:day/:title',checkLogin);
  app.post('/edit/:name/:day/:title',function(req,res){
    var currentUser = req.session.user;
    Post.update(currentUser.name,req.params.day,req.params.title,req.body.post,function(err){
      var url = encodeURI('/u/'+ currentUser.name + '/' + req.params.day + '/' + req.params.title);
      if(err){
        req.flash('error', err);
        return res.redirect(url);//出错！返回文章页
      }
      req.flash('success', '修改成功!');
      res.redirect(url);//成功！返回文章页
    } )
  });


  app.get('/remove/:name/:day/:title', checkLogin);
  app.get('/remove/:name/:day/:title', function (req, res) {
    var currentUser = req.session.user;
    Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('back');
      }
      req.flash('success', '删除成功!');
      res.redirect('/');
    });
  });

///  checkLogin()
  function checkLogin(req, res, next) {
    if (!req.session.user) {
      req.flash('error', '未登录!');
      res.redirect('/login');
    }
    next();
  }
///   checkNotLogin()
  function checkNotLogin(req, res, next) {
    if (req.session.user) {
      req.flash('error', '已登录!');
      res.redirect('back');//返回之前的页面
    }
    next();
  }
};

