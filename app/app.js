;(function() {

var view = require('./view.js').get
var ctrl = require('./controller.js').get

//initialize the application
m.mount(document.getElementById('app'), { controller: ctrl, view: view })

})();