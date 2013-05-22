$(document).ready(function(){
  
  log('Ready...')
  
  // Global
  window.MOTHER = {position:null, hasTouch:true}
  
  // Check for touch events (note: this is not exhaustive) and thanks to the Surface
  // and the Chromebook Pixel
  if( !('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch){
    document.documentElement.className = "no-touch"
    MOTHER.hasTouch = false
  } 
  
})
