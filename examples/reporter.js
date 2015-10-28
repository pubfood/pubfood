var p = new pubfood();
var reporter = function(event){
  console.log('my reporter', event.data);

  //create csv from event.data
};
p.observe(reporter);
