koa-interceptors
================

>An interceptors middleware for koa2

>[![NPM Version][npm-image]][npm-url]
>[![Download Status][download-image]][npm-url]
>[![Dependencies][david-image]][david-url]

###Introduction:
The interceptor automatically associates the router with the controller.

###Usage
```
app.js
```
```js
'use strict';

// modules
const koa = require('koa');
const convert = require('koa-convert');
const session = require('koa-session');
const Interceptors = require('koa-interceptors');

// app
const app = new koa();
// routers and controllers is optional parameter
const interceptors = new Interceptors('/routers', '/controllers');

// use session
interceptors.use(convert(session()));

// load routes
app.use(interceptors.routes());
```

```
/routers/home/index.js
```
```js
'use strict';

module.exports = {
  '/': [
    {
      action: 'index'
    }
  ]
};
```

```
/controllers/home/index.js
```
```js
'use strict';

module.exports = {
  index: ctx=>{
    // action logic
  }
};
```

###Install
```
$ npm install koa-interceptors --save
```

[npm-image]: http://img.shields.io/npm/v/koa-interceptors.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/koa-interceptors
[download-image]: http://img.shields.io/npm/dm/koa-interceptors.svg?style=flat-square
[david-image]: http://img.shields.io/david/nuintun/koa-interceptors.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/koa-interceptors
