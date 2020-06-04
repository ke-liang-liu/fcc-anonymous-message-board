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
        db.collection('fcc-anonymous-message-board').find({ /*board: req.params.board*/ }, {
          delete_password: 0, 
          reported: 0
        }).limit(10).sort({'bumped_on': -1}).toArray(function(err, docs) {
          if (err) { console.error(err)}
          docs.forEach(ele => {
            ele.replies.sort(compareFunction);
            ele.replies = ele.replies.slice(0, 3);
          })
          res.json(docs);
        })
      })
    }) // end of .get
  
    .post(function(req, res) {
      let newThread = {
        board: req.params.board,
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
          res.json(result.ops[0]);
          // res.redirect('/b/' + req.params.board + '/');   //(Recommend res.redirect to board page /b/{board})
        })
      })
  }) // end of .post
  
    .delete(function(req, res) {
      let _id = ObjectId(req.body.thread_id);
      
      MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
        if (err) { console.error(err)}
        const db = client.db('test2');
        const filter = { _id: _id};
        db.collection('fcc-anonymous-message-board').findOne(filter, function(err, doc) {
          if (err) {console.error(err)}
          console.log(req.body.delete_password);
          console.log(doc.delete_password);
          if (req.body.delete_password != doc.delete_password) {
            res.json('incorrect password')
            db.close();
          } else {
            db.collection('fcc-anonymous-message-board').deleteOne(filter, function(err, result) {
              if (err) {console.error(err)}
              if (result.deletedCount === 0) {
                res.json('could not delete')
              } else {
                res.json('success')
              }
            })
            db.close();
          }
        })        
      })
      
    
    })
  
  .put(function(req, res) {
    const _id = ObjectId(req.body.thread_id);
    MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
      if (err) { console.error(err) }
      const db = client.db('test2');
      db.collection('fcc-anonymous-message-board').updateOne({_id: _id}, 
        {
          $set: {'reported': true}  
        
        }, function(err, doc) {
          if (err) {
            console.error(err)
            db.close();
          } else {
            res.json('success');
            db.close();
          }
        })
    })
    
  })
  
  app.route('/api/replies/:board')
    .get(function(req, res) {
        let _id = ObjectId(req.query.thread_id);
        MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
          if (err) { console.error(err) }
          const db = client.db('test2');
          db.collection('fcc-anonymous-message-board').findOne({_id: _id}, {
              delete_password: 0,
              reported: 0
            }, function(err, doc) {
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
                // res.redirect('/b/' + req.body.board + '/' + req.body.thread_id)
                res.json(result);
          })
        
      })
  })
    .put(function(req, res) {
      // report a reply and change its reported value to true by sending a PUT request to /api/replies/{board} and 
      // pass along the threadid_ & replyid_. (Text response will be 'success')
      let threadId = ObjectId(req.body.thread_id);
      let replyId = ObjectId(req.body.reply_id);
      let filter = {
        _id: threadId,
        "replies._id": replyId
      }
      MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
        if (err) {console.error(err)}
        const db = client.db('test2');
        db.collection('fcc-anonymous-message-board').updateOne(filter, {
          $set: { 'replies.$.reported': true}
        }, function(err, result){
          if (err) 
          { 
            console.error(err)
            db.close();
          } else {
            res.json('success');
            db.close();
          }
        }) 
      })
  })

    .delete(function(req, res) {
      // delete a post(just changing the text to '[deleted]' instead of removing completely like a thread) 
      // if I send a DELETE request to /api/replies/{board} and pass along the threadid_, replyid_, & deletepassword_. (Text response will be 'incorrect password' or 'success')
      let threadId = ObjectId(req.body.thread_id);
      let replyId = ObjectId(req.body.reply_id);
      let filter = {
        _id: threadId,
        "replies._id": replyId
      }
      MongoClient.connect(DB_CONNECTION_STR, function(err, client) {
        const db = client.db('test2');
        db.collection('fcc-anonymous-message-board').findOne(filter, {'_id': 1, 'replies.$': 1} ,function(err, doc) {
          if (err) {console.error(err)}
          if (req.body.delete_password === doc.replies[0].delete_password) {
            console.log('one')
            db.collection('fcc-anonymous-message-board').updateOne(filter, {
              $set: { 'replies.$.text': 'deleted'}
            }, function(err, doc){
              if (err) {
                console.error(err);
                res.json('could not delete');
              } else if (doc.result.n===0) {
                res.json('could not delete');
              } else {
                res.json('success')
              }
              db.close()
            })
          } else {
            res.json('incorrect password');
            db.close();
          }
        })
      })
    })

}
function compareFunction(a, b) {
  if (a.created_on > b.created_on) { return -1 };
  if (a.created_on < b.created_on) { return 1  };
  return 0;
}
