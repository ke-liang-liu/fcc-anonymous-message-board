/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectId;
const DB_CONNECTION_STR = process.env.DB;

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(function(req, res) {
      MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
        const db = client.db('test2');
        db.collection('fcc-anonymous-message-board').find({board: req.params.board}).toArray(function(err, docs) {
          if (err) { console.error(err)}
          console.log(req.params.board);
          console.log(docs);
          res.json(docs);
        })
      })
    }) // end of .get
  
    .post(function(req, res) {
      let newThread = {
        board: req.body.board,
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        replies: []
      }    
      MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
        if (err) { console.err(err) }
        const db = client.db('test2');
        db.collection('fcc-anonymous-message-board').insertOne(newThread, function(err, result) {
          if (err) { console.err(err) }
          db.close();          
          res.redirect('/b/' + req.body.board + '/');
        })
      })
    
    
  }) // end of .post
    
  app.route('/api/replies/:board')
    .get(function(req, res) {
        let _id = ObjectId(req.query.thread_id);
        MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
          if (err) { console.error(err) }
          const db = client.db('test2');
          db.collection('fcc-anonymous-message-board').findOne({_id: _id}, function(err, doc) {
            if(err) {console.error(err)}
            console.log(doc);
            res.json(doc);
            db.close();
          })
        })
    
    
  }) // end of .get  
  
  
    .post(function(req, res) {
      let newReply = {
        _id: new ObjectId(),
        text: req.body.text,
        delete_password: req.body.delete_password,
        created_on: new Date(),
        reported: false
      }
      MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
        if (err) { console.error(err) }
        const db = client.db('test2');
        db.collection('fcc-anonymous-message-board').update({_id: ObjectId(req.body.thread_id)}, 
          {
            $push: {'replies': newReply},
            $set: {'bumped_on': new Date()}
          }, function(err, result) {
                if(err){console.error(err)} 
                res.redirect('/b/' + req.body.board + '/' + req.body.thread_id)
          })
        
      })
  }) // end of .post

};
