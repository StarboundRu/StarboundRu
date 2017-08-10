function StarboundClient(site, session, userId, signature) {
    this.site = site;
    this.session = session;
    this.userId = userId;
    this.signature = signature;
    this.init();
}
StarboundClient.VERSION = 2;
StarboundClient.MSG = {
    // 0 - int8, 1 - int16, 2 - int32, 3 - string8, 4 - string16, 5 - float, 1000 - array
    version: [1, 1],
    register: [2, 3, 2, 3],
    pong: [3, 2],
    chat: [4, 2, 4],
    info: [5, 4],
    page: [6, 4],
    //coords: [7, 2, 5, 5, 5, 5, 1]
};
StarboundClient.MSG_REPLY = [
    null,
    ['onVersion', 1],
    ['onRegister', 2, 4],
    ['onError', 2, 4],
    ['onJoin', 2, 4],
    ['onPart', 2],
    ['onChat', 2, 2, 4],
    ['onPlayers', 100],
    ['onPing', 2],
    ['onChatHistory', 2, 4, 4],
    ['onCoords', 2, 2, 5, 5, 5, 5, 1]
];
StarboundClient.prototype = {
    init: function() {
        this.buffer = new ArrayBuffer(1024);
        this.bb = new DataView(this.buffer);
        this.bl = 0;
        this.connectTry = 0;
	this.connect();
    },
    connect: function() {
        var self = this;
        this.socket = new WebSocket(this.site.wsUrl, ['game']);
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = function() {self._onConnect();};
        this.socket.onmessage = function(event) {self._onMessage(event);};
        this.socket.onclose = function(event) {self._onClose(event)};
        this.socket.onerror = function(event) {self._onError(event)};
    },
    _onConnect: function() {
        console.log('connected');
        this.connected = true;
        this.site.connected();
        this.send('version', [StarboundClient.VERSION]);
        this.send('register', [this.session, this.userId, this.signature]);
        this.socket.send(navigator.userAgent);
    },
    register: function(userId, signature) {
        this.userId = userId;
        this.signature = signature;
        this.send('register', [this.session, this.userId, this.signature]);
    },
    coords: function(player) {
        //this.send('coords', [0, player.x, player.y, player.mx, player.my, (player.ducked ? 1 : 0) | (player.seated ? 2 : 0) | (player.direction == -1 ? 4 : 0)]);
    },
    _onMessage: function(event) {
        var ba = event.data;
        if (ba.byteLength >= 2) {
            this.db = new DataView(ba);
            this.dl = 0;

            var code = this._getInt16();
            //console.log('  code', code);
            if (code >= 0 && code < StarboundClient.MSG_REPLY.length) {
                var ff = StarboundClient.MSG_REPLY[code];
                if (ff != null) {
                    var params = [];
                    for (var i = 1; i < ff.length; i++) {
                        params.push(this._getType(ff[i]));
                    }
                    console.log('< ' + ff[0], params);
                    this[ff[0]].apply(this, params);
                }
            }
        }
    },
    _onClose: function(event) {
        console.log('disconnect', event);
        var self = this;
        if (this.connected) {
            this.site.disconnected();
        }
        self.connectTry++;
        this.connected = false;
        if (self.connectTry == 1) {
            setTimeout(function() {self.connect();}, 500);
        }
        else if (self.connectTry > 10) {
            setTimeout(function() {self.connect();}, 30000);
        }
        else {
            setTimeout(function() {self.connect();}, 1000);
        }
    },
    _onError: function(event) {
        console.log('error', event);
    },
    onVersion: function(version) {
                    
    },
    onRegister: function(userId, username, flags) {
        this.connectTry = 0;
        this.site.setUser(userId, username, flags);
        this.flags = flags;
    },
    onError: function(errorCode, error) {
        console.log('error', errorCode, error);
        this.site.chatError(errorCode, error);
    },
    onJoin: function(user_id, username) {
        this.site.addPlayer({userId: user_id, username: username});
    },
    onPart: function(user_id) {
        this.site.removePlayer(user_id);
    },
    onChat: function(from_id, to_id, text) {
        this.site.addMessage(from_id, to_id, text);
    },
    onChatHistory: function(from_id, from, text) {
        this.site.addMessage(from_id, 0, text, from);
    },
    onPlayers: function(players) {
        this.site.setPlayers(players);
    },
    onPing: function(seq) {
        this.send('pong', [seq]);
    },
    onCoords: function(from_id, ts, x, y, mx, my, flags) {
        this.site.movePlayer(from_id, x, y, mx, my, flags);
    },
    send: function(msg, body) {
        console.log('> ' + msg, body);
        this.bl = 0;
        if (msg == 'version') {
            this._addInt16(1);
            this._addInt16(body[0]);
        }
		
        else {
            var desc = StarboundClient.MSG[msg];
            this._addInt16(desc[0]);
            var n = 0;
            for (var s in body) {
                n++;
                this._addType(desc[n], body[s]);
            }
        }
		
        this.socket.send(this.buffer.slice(0, this.bl));
    },
    sendChat: function(message) {
        this.send('chat', [0, message]);
    },
    _getType: function(tp) {
        if (tp >= 1000) {
            return this._getArray(tp - 1000);
        }
        else {
            switch (tp) {
                case 0:
                    return this._getInt8();
                case 1:
                    return this._getInt16();
                case 2:
                    return this._getInt32();
                case 3:
                    return this._getString8();
                case 4:
                    return this._getString16();
                case 5:
                    return this._getFloat();
                case 100: {
                    var ps = this._getInt16();
                    var players = [];
                    for (var i = 0; i < ps; i++) {
                        players.push({
                            userId: this._getInt32(),
                            username: this._getString16(),
                            bits: this._getInt8(),
                            latency: this._getInt16()
                        });
                    }
                    return players;
                }
            }
        }
        return null;
    },
    _addType: function(tp, val) {
        if (tp >= 1000) {
            this._addArray(tp - 1000, val);
        }
        else {
            switch (tp) {
                case 0:
                    this._addInt8(val);
                    break;
                case 1:
                    this._addInt16(val);
                    break;
                case 2:
                    this._addInt32(val);
                    break;
                case 3:
                    this._addString8(val);
                    break;
                case 4:
                    this._addString16(val);
                    break;
                case 5:
                    this._addFloat(val);
                    break;
            }
        }
    },
    _addArray: function(tp, val) {
        var len=val.length;
        this.bb.setInt16(this.bl, len);
        this.bl += 2;
        this.bb.setInt8(this.bl, tp);
        this.bl += 1;
		
        for (var i=0; i<len; i++) {
            this._addType(tp, val[i]);
        }
    },
    _addInt8: function(val) {
        this.bb.setInt8(this.bl, val);
        this.bl += 1;
    },
    _getInt8: function() {
        var val = this.db.getInt8(this.dl);
        this.dl += 1;
        return val;
    },
    _addInt16: function(val) {
        this.bb.setInt16(this.bl, val);
        this.bl += 2;
    },
    _getInt16: function() {
        var val = this.db.getInt16(this.dl);
        this.dl += 2;
        return val;
    },
    _addInt32: function(val) {
        this.bb.setInt32(this.bl, val);
        this.bl += 4;
    },
    _getInt32: function() {
        var val = this.db.getInt32(this.dl);
        this.dl += 4;
        return val;
    },
    _addFloat: function(val) {
        this.bb.setFloat32(this.bl, val);
        this.bl += 4;
    },
    _getFloat: function() {
        var val = this.db.getFloat32(this.dl);
        this.dl += 4;
        return val;
    },
    _addString8: function(val) {
        var strLen=val.length;
        this.bb.setInt16(this.bl, strLen);
        this.bl += 2;
        for (var i=0; i<strLen; i++) {
            this.bb.setInt8(this.bl, val.charCodeAt(i));
            this.bl++;
        }
    },
    _addString16: function(val) {
        var strLen=val.length;
        this.bb.setInt16(this.bl, strLen);
        this.bl += 2;
        for (var i=0; i<strLen; i++) {
            this.bb.setInt16(this.bl, val.charCodeAt(i));
            this.bl += 2;
        }
    },
    _getString16: function() {
        var strLen = this._getInt16();
        var string = "";
        for (var i = 0; i < strLen; i++) {
            var cc = this._getInt16();
            string += String.fromCharCode(cc);
        }
        return string;
    }
};
