/* Conditional load of zepto or jquery */
var $lib = ('__proto__' in {} ? 'zepto.min' : 'jquery.min')
require(["log",  $lib, "fastclick" ], function(l, zepto){
  log($lib + ', Fastclick and Log loaded...')
  require(["guesswho-0.0.1-3.min"], function(guesswho){
	  new FastClick(document.body)
		log('FastClick enabled on document.')
		log('All JS files loaded...')
  })
})