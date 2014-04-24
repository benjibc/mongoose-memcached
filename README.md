# mongoose memcached 

Use memcached as the query cacher for mongoose. Inspired by Jonathan Brumley's mongoose-cachebox, but compatible with mongoose 3.8 and uses memcached instead of redis. The API is very similar.

## Instalation

``` bash
$ npm install mongoose-memcached
```

## Usage

``` javascript
var mongoose = require('mongoose');

var options = {
  cache: true, // disable caching for all modules by default 
  ttl: 30       // set default time to live to be 30 seconds 
  memServers: 'localhost:11211', // memcached server
  memOptions: null 
};

mongooseMemcached(mongoose, options);
```

Then later any `find` query will be cached for 60 seconds.

You can also enable caching programatically by using the `cache` method directly from the query instance:

``` javascript
var Person = mongoose.model('Person');

Person.find({ active: true })
.cache(true)  // enable cache 
.ttl(50)      // cache for 50 seconds 
.exec(function (err, docs) { /* ... */
  if (err) throw error;
  console.log(docs);
});

```

More documentation for .cache and .ttl will be coming up. For now, check the test cases and the source code for advanced usage

License

(The MIT License)

Copyright (c) 2014 Yufei (Benny) Chen <benny.yufei.chen@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
