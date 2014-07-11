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

Then later any `find` or `findOne` query will be cached for 60 seconds.

You can also enable caching programatically by using the `cache` method directly from the query instance:

``` javascript
var Person = mongoose.model('Person');

Person.find({ active: true })
.cache(true, 50)  // enable cache, for 50 seconds 
.exec(function (err, docs) { /* ... */
  if (err) throw error;
  console.log(docs);
});

```

#API

## public methods

``` javascript
Query.prototype.cache(cache, ttl, key)
```
* `cache`: **String** whether to enable or disable the cache 
* `ttl`: **Number** After how long should the key expire measured in `seconds`
* `key`: **Function** the identifier associated with the cache
* return:**Query** the Query object itself, which means you can chain the calls

all parameters are optional. If `cache` is undefined, it is defaulted to true. If `ttl` is undefined, the time to live is set to ttl defined when the library is initialized. When the key is not defined, it will be generated based on an internal key generating function, `genKeyFromQuery`. Check the documentation if you want to see exactly how the key is generated   

``` javascript
Query.prototype.isFromCache()
```
* return : **Boolean** whether the current queried data is from cache

``` javascript
Query.prototype.isCacheEnabled()
```
* return : **Boolean** whether the current queried will use cache 

``` javascript
mongooseMemcached(mongoose, options);
```
Initialize the plugin on mongoose. The field you can set in options are
* `ttl`: **Number** After how long should the key expire measured in `seconds`. Default: 60 seconds
* `cache`: **Boolean** enable cache globally by default. Default: false
* `memServer`: **String** the memcached server address. Default: 'localhost:11211' 
* `memOptions`: **Object** options to use for memcached server. The library relies on `node-memcached`, and will pass the option to the library directly. Default: null
* genKey: **Function** function for key genration. Default: `genKeyFromQuery`


# License

(The MIT License)

Copyright (c) 2014 Yufei (Benny) Chen <benny.yufei.chen@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
