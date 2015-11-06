var p = new pubfood();
var reporter = function(event){
  console.log('my reporter', event.data);
};
p.observe(reporter);
