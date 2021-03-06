var util = require('util');
var EventEmitter = require('events').EventEmitter;
var vm = require('vm');
var fs = require('fs');
var io = require('socket.io-client');
var Robot = require('./robot').Robot;

/**
 *
 *create machin instance 
 * @param {Object} app location,
 * @param {Array} test case data
 * @param {String} script
 */
var Machine = function(app,user,script) {
  EventEmitter.call(this);
  this.conf = {};
  this.conf.app = app;
  this.script = script;
  this.socket = null;
  this.user = user;
  this.prepare();
};

util.inherits(Machine, EventEmitter);

var pro = Machine.prototype;

pro.prepare = function() {
	var user = this.user,uri = this.conf.app.host + ":" + this.conf.app.port;
	this.socket = io.connect(uri,{'force new connection':true,'try multiple transports':false});
};

pro.run = function() {
	var self = this;
	var robot = new Robot(self.user, self.socket);
	var initSandbox = {
	      console:console,
	      Iuser:self.user,
	      robot:robot
	};
	robot.on('done',function(msg){
		self.emit('done',msg);
	});
	var context = vm.createContext(initSandbox);
	vm.runInContext(self.script,context);
};
 
exports.Machine = Machine;
