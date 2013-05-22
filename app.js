
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , request = require('request')
  ;

// Init Express app...
var app = express()

app.configure(function(){

  var package = require(path.resolve(__dirname, './package.json'))
  
  // Setup local variables to be available in the views.
  app.locals.title = "Guess Who Is An Award Winner"
  app.locals.description = "Guess Who Is An Award Winner. We Are."
  app.locals.node_version = process.version.replace('v', '')
  app.locals.app_version = package.version
  app.locals.env = process.env.NODE_ENV
  
  app.set('port', process.env.PORT || 3400)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'ejs')
  app.use(express.favicon())
  app.use(express.logger(app.locals.env === 'production' ? 'tiny' : 'dev' ))
  app.use(express.compress())
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(require('stylus').middleware(__dirname + '/public'))

  // Do this last so the above logic isn't for naught
  app.use(express.static(path.join(__dirname, 'public')))

})

app.configure('development', function(){
  app.use(express.errorHandler())
})

// Handle index page.
app.get('/', routes.index)


// Fire up server...
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
  console.log("\nhttp://127.0.0.1:" + app.get('port'))
})