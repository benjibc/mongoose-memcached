'use strict';
/**
 * This file tests mongoose-memcached under different settings
 */

var Memcached = require('memcached'); 
var mongooseMemcached = require('../'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    PeopleSchema,
    People,
    _memcached,
    expect = require('expect.js'),
    names = [
      "Jacob","Sophia", "Mason", "Isabella", "William", "Emma", "Jayden",
      "Olivia", "Noah", "Ava", "Michael", "Emily", "Ethan", "Abigail",
      "Alexander", "Madison", "Aiden", "Mia", "Daniel", "Chloe"
    ],
    db;


describe('mongoose-memcached with cache turned on by default', function() {
  before(function(done) {
    // connecting to mongoose
    mongoose.connect('mongodb://127.0.0.1/mongoose-cachebox-testing');

    db = mongoose.connection;

    db.on('error', function (err) {
      done(err);
    });

    db.once('open', done);

    // adding mongoose cachebox
    // I set the port on 11212 because of old habit.
    mongooseMemcached(mongoose, {memServers: "localhost:11212", cache: true});
    _memcached = new Memcached('localhost:11212');
    PeopleSchema = new Schema({
      name: String,
      date: {
        type: String,
        "default": Date.now()
      },
      num: Number,
      test: Boolean
    });

    People = mongoose.model('People', PeopleSchema);
  });

  function generate (amount, fn) {
    var crowd = [];
    var count = 0;
    while (count < amount) {
      crowd.push({
        name: names[Math.floor(Math.random() * names.length)],
        num: Math.random() * 10000
      });
      count++;
    }
    People.create(crowd, fn);
  }


  beforeEach(function(done) {
    _memcached.flush(function(e) {
      if(e) {
        return done(e);
      }
      generate(10, done);
    });
  });

  afterEach(function(done){
    People.remove(done);
  });  

  it('should have `cache` method', function () {
    expect(People.find({}).cache).to.be.a('function');
  });

  it('should cache query even if .cache method is not called', function (done) {
    console.log('should be cached by default in this case');
    var query = People.find({});
    query.exec(function (err, docs) {
      if (err) {
        return done(err);
      }
      query = People.find({});
      query.exec(function (err, docs) {
        if (err) {
          return done(err);
        }
        if (docs) {
          expect(query.isFromCache).to.be(true);
          done();
        }
      });
    });
  });

  it('should cache query if the `cache` method is called', function (done) {
    var self = this;
    var query = People.find({});
    query.cache(true, 2).exec(function (err, docs) {
      var time = Date.now();
      if (err) {
        return done(err);
      }
      People.find({}).exec(function (err, docs) {
        if (err) {
          return done(err);
        }
        People.find({}).exec(function (err, docs) {
          if (err) {
            return done(err);
          }
          People.find({}).exec(function (err, docs) {
          if (err) {
              return done(err);
            }
            People.find({}).exec(function (err, docs) {
              if (err) {
                return done(err);
              }
              query = People.find({}).cache().exec(function (err, docs) {
                if (err) {
                  return done(err);
                }
                if (docs) {
                  time = Date.now() - time;
                  expect(docs).to.be.ok();
                  expect(query.isFromCache).to.be(true);
                  done();
                }
              });
            });
          });
        });
      });
    });
  });

  it('should work with lean enabled', function (done) {
    var query = People.find({});
    query.lean().cache().exec(function (err, docs) {
      if (err) {
        return done(err);
      }
      generate(5, function(e) {
        if(e) {
          return done(err);
        }
        query = People.find({}).lean().cache().exec(function (err, docs) {
          if (err) {
            return done(err);
          }
          if (docs) {
            expect(query.isFromCache).to.be(true);
            // length should be 10 instead of 15 because these are cached docs
            expect(docs).to.have.length(10);
            done();
          }
        });
      });
    });
  });

  it('should cache query with specific ttl is passed to `ttl` method', function (done) {
    var query = People.find({});
    query.cache(true, 50).exec(function (err, docs) {
      if (err) {
        return done(err);
      }
      expect(query._ttl).to.be(50);
      // first time query, should not be from cache
      expect(query.isFromCache).to.be(false);
      query = People.find({}).cache(true, 40).exec(function (err, docs) {
        if (err) {
          return done(err);
        }
        if (docs) {
          expect(query._ttl).to.be(40);
          expect(query.isFromCache).to.be(true);
          done();
        }
      });
    });
  });

  it('should stop caching', function (done) {
    var query = People.find({});
    query.cache().exec(function (err, docs) {
      if (err) {
        return done(err);
      }
      generate(5, function(e) {
        if(e) {
          return done(e);
        }
        query = People.find({});
        query.cache(false).exec(function (err, docs) {
          if (err) {
            return done(err);
          }
          expect(query.isFromCache).to.be(false);
          expect(docs).to.have.length(15);
          done();
        });
      });
    });
  });
});
