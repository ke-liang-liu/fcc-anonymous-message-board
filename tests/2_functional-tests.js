/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var ObjectId = require("mongodb").ObjectID;

var newThreadId = '';

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('post a thread', function(done) {
        this.timeout(3000);
        chai.request(server)
          .post('/api/threads/testboard')
          .send({text: 'testtext', 
            delete_password: 123})
          .end(function(err, res) {
            if (err) {done(err)}
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, '_id', 'should have _id field');
            assert.property(res.body, 'text', 'should have text field');
            assert.property(res.body, 'delete_password', 'should have delete_password field');
            assert.property(res.body, 'reported', 'should have reported field')
            assert.property(res.body, 'replies', 'should have replies field');
            assert.isString(res.body._id);
            newThreadId = res.body._id;
            //
            assert.equal(res.body.text, 'testtext');
            assert.equal(res.body.delete_password, '123');
            assert.equal(res.body.reported, false);
            assert.isArray(res.body.replies);
            done();
        })
      })
    });
    
    suite('GET', function() {
      //I can GET an array of the most recent 10 bumped threads on the board with only the most recent 3 replies each from /api/threads/{board}. 
      //The reported and deletepasswords_ fields will not be sent to the client.
      test('GET an array of the most recent 10 bumped threads on the board', function(done) {
        chai.request(server)
          .get('/api/threads/testboard')
          .end(function(err, res) {
            if (err) {done(err)}
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.isAtMost(res.body.length, 10);
            for(let i=0; i<res.body.length-1; i++){
              assert.notProperty(res.body[i], 'delete_password' );
              assert.notProperty(res.body[i], 'reported' );
              assert.property(res.body[i], '_id');
              assert.property(res.body[i], 'text');
              assert.property(res.body[i], 'replies');
              assert.isArray(res.body[i].replies);
              assert.isAtMost(res.body[i].replies.length, 3);
              assert.isTrue(res.body[i].bumped_on > res.body[i+1].bumped_on);
            }
            done();
        })
      })
    });
    
    suite('DELETE', function() {
      // delete a thread completely if I send a DELETE request to /api/threads/{board} and pass along the threadid_ & deletepassword_. 
      // (Text response will be 'incorrect password' or 'success')
      test('Delete a thread', function(done) {
        this.timeout(3000);
        chai.request(server)
          .delete('/api/threads/testboard')
          .send({
            thread_id: newThreadId,
            // thread_id: ObjectId('5ed07dbdd6366723d1141c0f'),
            delete_password: 123
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, '"success"');
            done();
          })
      })
        
    });
    
    suite('PUT', function() {
      // report a thread and change its reported value to true by sending a PUT request to /api/threads/{board} and pass along the threadid_. (Text response will be 'success')
      test('Report a thread', function(done) {
        chai.request(server)
          .put('/api/threads/testboard')
          .send({
            thread_id: '5ed0a9000a6e43060e958109'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, '"success"');
            done()
          })
      })
    });
  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      // POST a reply to a thread on a specific board by passing form data text, deletepassword_, & threadid_ to /api/replies/{board} 
      // and it will also update the bumped_on date to the comments date.
      // (Recommend res.redirect to thread page /b/{board}/{thread_id}) In the thread's replies array will be saved _id, text, createdon_, deletepassword_, & reported.
      test('Post a reply', function(done) {
        chai.request(server)
          .post('/api/replies/testboard')
          .send({
            thread_id: '5ed0a9000a6e43060e958109',
            text: 'test post a reply',
            delete_password: 'reply'
          })
          .end(function(err, res) {
            if (err) {console.error(err)}
            console.log(res.body);
            assert.equal(res.status, 200);
            assert.equal(res.body.nModified, 1);
            assert.equal(res.body.ok, 1);
            done();
          })
      })
    });
    
    suite('GET', function() {
      //GET an entire thread with all its replies from /api/replies/{board}?thread_id={thread_id}. Also hiding the same fields the client should be see.
      test('GET an entire thread with all its replies', function(done) {
        this.timeout(3000);
        chai.request(server)
          .get('/api/replies/testboard?thread_id=' + '5ed0699658cf48114c09899f')
          .end(function(err, res) {
            if (err) {console.error(err)}
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.notProperty(res.body, 'delete_password');
            assert.notProperty(res.body, 'reported');
            assert.property(res.body, '_id');
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'replies');
            assert.isArray(res.body.replies);
            done();
          })
      
      })
    });
    
    suite('PUT', function() {
      // report a reply and change its reported value to true by sending a PUT request to /api/replies/{board} and 
      // pass along the threadid_ & replyid_. (Text response will be 'success')
      test('report a reply and change its reported value to true', function(done) {
        this.timeout(5000);
        chai.request(server)
          .put('/api/replies/testboard')
          .send({
            thread_id: '5ed0699658cf48114c09899f',
            reply_id: '5ed09bc83f49ff0087d57e8d'
          })
          .end(function(err, res) {
            if (err) {console.error(err)}
            assert.equal(res.status, 200);
            assert.equal(res.text, '"success"');
            done();
          })
      })
      
    });
    
    suite('DELETE', function() {
      // delete a post(just changing the text to '[deleted]' instead of removing completely like a thread) 
      // if I send a DELETE request to /api/replies/{board} and pass along the threadid_, replyid_, & deletepassword_. (Text response will be 'incorrect password' or 'success')
      test.only('Delete a post', function(done) {
        this.timeout(3000);
        chai.request(server)
          .delete('/api/replies/testboard')
          .send({
            thread_id: '5ed0699658cf48114c09899f',
            reply_id: '5ed09bc83f49ff0087d57e8d',
            delete_password: '2two'
        })
          .end(function(err, res) {
            if (err) {console.error(err)}
            assert.equal(res.status, 200);
            assert.equal(res.text, '"success"');
            done();
        })
        
      })
      
    });
    
  });

});
