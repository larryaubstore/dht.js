    var dht = require('../../lib/dht.js'),
    Buffer = require('buffer').Buffer;


describe('DHT.js/Networking', function() {

  var nodes;


  beforeEach(function() {

    var waiting = 20;
    var beforeEachCbCalled = false;

    nodes = [];
    for (var i = 0; i < waiting; i++) {
      nodes[i] = dht.node.create();
      nodes[i].once('listening', finish);
    }

    function finish() {
      if (--waiting !== 0) return;
      beforeEachCbCalled = true;
    }

    waitsFor(function () {
      return beforeEachCbCalled == true;
    }, "Before each called never called", 12500);
  });

  afterEach(function() {
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].close();
    }
  });

  it('should successfully discover peers', function() {
    var infohash = new Buffer([0,5,4,3,2,1,6,7,8,9,
                               0,1,3,5,8,9,6,7,8,9]);

    var callbackCalled = false;

    nodes[0].connect(nodes[1]);
    nodes[1].connect({ address: nodes[2].address, port: nodes[2].port });

    nodes[0].advertise(infohash, 13589);
    nodes[2].on('peer:new', function(ih, peer) {
      if (infohash.toString('hex') !== ih.toString('hex')) return;

      expect(peer.port).toEqual(13589);
      callbackCalled = true;
    });

    nodes[0].announce();

    waitsFor(function () {
      return callbackCalled == true;
    }, "pear:new callback never called", 60000);
  });

});

