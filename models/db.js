/**
 * Created by Administrator on 2014/12/22.
 */
var settings = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports = new Db(settings.db,new Server(settings.host,settings.post),{safe:true});



