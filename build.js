var fs = require('fs')
  , path = require('path')
  , walkdir = require('walkdir')
  , smoosh = require('smoosh')
  , semver = require('semver')
  , blog = require( path.resolve( __dirname, 'blog', 'blog-subprint.js') )
  , semverUtil = require( path.resolve( __dirname, 'util', 'semver-util.js') )
  , pkgjsonPath = path.resolve( __dirname, 'package.json' ) 
  ;

// On every deployment we need to write the new templates 
// for the blog
function writeHeaderTemplate(templatePath, cb){
  
  var stream = fs.createReadStream(templatePath)
    , outerdata = ''
    , oldVersion = require(pkgjsonPath).version
    ;

  // Increment the version
  semverUtil.incrementVersion( pkgjsonPath, 'build', function(){

    stream.on('readable', function(){
      while (data = stream.read()) {
        outerdata += data
      }
    })

    stream.once('end', function(){

      var writeStream = fs.createWriteStream(templatePath)
        , newVersion = require(pkgjsonPath).version
        , updatedTemplate = outerdata.replace(oldVersion, newVersion )
        ;

      if(updatedTemplate){
        writeStream.write(updatedTemplate)
        writeStream.end()
      }
      else console.warn('There is nothing to write. Something went wrong creating the header template.')

      cb && typeof cb === 'function' && cb()
    }) // end once()

  }) // end incrementVersion()
  
}


function buildBlog(){

  var srcDir = path.resolve( __dirname, 'public/blog/md') 
    , outDir = path.resolve( __dirname, 'public/blog/html')
    , blogRootDir = path.resolve( __dirname, 'public/blog')
    , rssDir = path.resolve( __dirname, 'public')
    , headerTemplatePath = path.resolve(__dirname, 'blog', 'templates', 'head-tmpl.html')
    , commentsTemplatePath = path.resolve(__dirname, 'blog', 'templates', 'comments-tmpl.html')
    , socialTemplatePath = path.resolve(__dirname, 'blog', 'templates', 'social-tmpl.html')
    , footerTemplatePath = path.resolve(__dirname, 'blog', 'templates', 'footer-tmpl.html')
    , tableOfContentsTemplatePath = path.resolve(__dirname, 'blog', 'templates', 'toc-list-item-tmpl.html')
    ;

  // Now that the version is updated, write the the header template...
  writeHeaderTemplate( headerTemplatePath, function writeHeaderTemplateCb(){

    console.log("Wrote the new header template.")

    // Setup blog properties...    
    blog
      .setHeadPath( headerTemplatePath  )
      .setFooterPath( footerTemplatePath )
      .setCommentsPath( commentsTemplatePath )
      .setSocialPath( socialTemplatePath )
      .setTableOfContentsListItemPath( tableOfContentsTemplatePath )
      .setBlogRootDirectory(blogRootDir)
      .setRssRootDirectory(rssDir)
      .setBlogPostUrlPrefix('/blog/')
      .setBlogFileIndexDescription('A collection of articles written by Joe McCann on technology, mobile, big data and the future.')
      .setBlogFileIndexTitle('A collection of articles written by Joe McCann for subPrint')

    blog.createAllHtmlFilesFromDir(srcDir, outDir, function createAllHtmlFilesFromDirCb(){

      console.log("Created all blog html files.")

      blog.createTableOfContents(outDir)
      console.log("Created table of contents.")

      blog.createRssFile({
        title: 'subPrint by Joe McCann',
        description: 'subPrint™ • Creative Technology and Live Events by Joe McCann',
        feed_url: 'http://subprint.com/rss.xml',
        site_url: 'http://subprint.com',
        image_url: 'http://subprint.com/ico/apple-touch-icon-114-precomposed.png',
        author: 'Joe McCann',
        articlesDir: outDir
      })
      console.log("Created RSS file.")

    })

  }) // end writeHeaderTemplate
}

// Pass in a path of a directory to walk and a 
// regex to match against.  The file(s) matching
// the patter will be deleted.
function walkAndUnlink(dirPath, regex){

  var emitter = walkdir(dirPath)

  emitter.on('file',function(filename,stat){
    if( regex.test(filename) ){
      console.log("Removing old file: " + filename)
      fs.unlinkSync( path.resolve( dirPath, filename) )
    }
  })

}

// Removes old css/js files.
function cleaner(){
  walkAndUnlink( path.join(__dirname, 'public', 'css'), new RegExp(/style-/) )
  walkAndUnlink( path.join(__dirname, 'public', 'js'), new RegExp(/subprint-/) )
}

// Concats, minifies js and css for production
function smoosher(){

  var version = require('./package.json').version
  
  // Smoosh the things
  
  smoosh.make({
    "VERSION": version,
    "JSHINT_OPTS": {
      "browser": true,
      "evil":true, 
      "boss":true, 
      "asi": true, 
      "laxcomma": true, 
      "expr": true, 
      "lastsemic": true, 
      "laxbreak":true,
      "regexdash": true,
    },
    "JAVASCRIPT": {
      "DIST_DIR": "./public/js",
      "subprint": [ "./public/js/subprint.js" ]
    },
    "CSS": {
      "DIST_DIR": "./public/css",
      "style": [ "./public/css/style.css" ]
    }
  })
  .done(function(){
    // Write boot.prod-VERSION.js
    var js = fs.readFileSync( path.resolve(__dirname, 'public', 'js', 'boot.js'), 'utf-8')
    
    var newProdFile = 'subprint-'+ version +'.min'
    
    var write = js.replace('subprint', newProdFile)
    
    fs.writeFile( path.resolve(__dirname, 'public', 'js', 'boot.prod.js'), write, 'utf-8', function(err,data){
     if(err) return console.error(err)
     
     console.log("Wrote the latest version: " + newProdFile)
      
    })
    console.log('\nSmoosh done.\n')
  })
      
}

// // Concat/minify
cleaner()
setTimeout(smoosher,750) // pure laziness...
buildBlog()