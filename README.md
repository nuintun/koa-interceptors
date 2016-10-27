koa-interceptors
================

>An interceptors middleware for koa2

>[![NPM Version][npm-image]][npm-url]
>[![Download Status][download-image]][npm-url]
>[![Dependencies][david-image]][david-url]

###Introduction:
The interceptor automatically associates the router with the controller.

###Usage
`app.js`
```js
'use strict';

// modules
const koa = require('koa');
const convert = require('koa-convert');
const session = require('koa-session');
const Interceptors = require('koa-interceptors');

// app
const app = new koa();
// interceptors
const interceptors = new Interceptors();

// use session
interceptors.use(convert(session()));

// load routes
app.use(interceptors.routes());
```

`/routers/home/login.js`
```js
'use strict';

module.exports = {
  '/login': [
    {
      action: 'login' // page action
    },
    {
      method: 'post', // if get can be omitted
      action: 'validate-login' // page action
    }
  ]
};
```

`/controllers/home/login.js`
```js
'use strict';

module.exports = {
  login: ctx=>{
    // page action logic
  },
  'validate-login': ctx=>{
    // page action logic
  },
};
```

###Install
```
$ npm install koa-interceptors --save
```

###API
#####Interceptors([routers, controllers, options])
- `routers`: the routers base dir.
- `controllers`: the controllers base dir.
- `options`: the [koa-router][koa-router-url] options.

##### Others see: [koa-router][koa-router-url]

###Notice
The interceptor will add a property `routeData` on koa ctx.

[npm-image]: http://img.shields.io/npm/v/koa-interceptors.svg?style=flat-square
[npm-url]: https://www.npmjs.org/package/koa-interceptors
[download-image]: http://img.shields.io/npm/dm/koa-interceptors.svg?style=flat-square
[david-image]: http://img.shields.io/david/nuintun/koa-interceptors.svg?style=flat-square
[david-url]: https://david-dm.org/nuintun/koa-interceptors
[koa-router-url]: https://github.com/alexmingoia/koa-router
