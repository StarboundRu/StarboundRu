function Starbound(userId, username) {
    this.userId = userId;
    this.username = username;
    this.init();
}
Starbound.PX = 2;
Starbound.changed = false;
Starbound.changing = false;
Starbound.prototype = {
    init: function() {
        this.gameActive = false;
        console.log('init game');
        
        this.canvas = document.getElementById('starboundgame');
        if (!this.canvas.getContext) {
            // didn't support lol
            this.canvas.style.display = 'none';
            $('#browser-support').show();
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        var ts = new Date().getTime();
        
        this.movables = [];
        
        this.players = {};
        
        this.player = this.createPlayer(this.userId, this.username);
        this.player.setAction(Character.IDLE, ts);
        this.movables.push(this.player);
        
        /*
        var self = this;
        setTimeout(function() {
            var tmp = new Character(this, 'robot', 'female');
            tmp.ts = 0;
            tmp.x = 40;
            tmp.name = 'Ghost';
            tmp.move(true, 1, true);
            self.movables.push(tmp);
        }, 5000);
        */
        
        this.lastRender = ts;
        var self = this;
        setInterval(function() {self.render();}, 80);
        
        this.background = Sprite.get('back.jpg');
        this.canvas.onclick = function() {
            self.gameActive = true;
            Starbound.changed = true;
        };
        
        window.onkeydown = function(e) {
            //if (e.bubbles) return;
            //console.log(e);
            if (!self.gameActive) return;
            if (e.keyCode == 38) {
                // up
                e.preventDefault();
                userKnows = true;
                if (self.player.my == 0) {
                    self.player.jump();
                    self.push();
                }
            }
            else if (e.keyCode == 39) {
                // right
                e.preventDefault();
                userKnows = true;
                if (self.player.mx <= 0) {
                    self.player.move(true, 1);
                    self.push();
                }
            }
            else if (e.keyCode == 40) {
                // down
                e.preventDefault();
                userKnows = true;
                if (!self.player.ducked) {
                    self.player.duck(true);
                    self.push();
                }
            }
            else if (e.keyCode == 37) {
                // left
                e.preventDefault();
                userKnows = true;
                if (self.player.mx >= 0) {
                    self.player.move(true, -1);
                    self.push();
                }
            }
            else if (e.keyCode == 32) {
                e.preventDefault();
                self.gameActive = false;
            }
        };
        window.onkeyup = function(e) {
            if (e.keyCode == 39 || e.keyCode == 37) {
                e.preventDefault();
                self.player.move(false);
                self.push();
            }
            else if (e.keyCode == 40) {
                e.preventDefault();
                self.player.duck(false);
                self.push();
            }
        };
        window.onresize = function(e) {
            self.resize();
            Starbound.changed = true;
        };
        Starbound.changed = true;
        
        /*
        var userKnows = false;
        setTimeout(function() {
            if (userKnows) return;
            
            Starbound.changing = true;
            self.player.setAction(Character.WALK, null, {direction: 1});
            
            setTimeout(function() {
                if (userKnows) return;
                
                self.player.setAction(Character.IDLE);
                Starbound.changing = false;
                Starbound.changed = true;
            }, 5000);
        }, 5000);
        */
    },
    push: function() {
        if (this.handler) {
            this.handler(this.player);
        }
    },
    setPlayer: function(userId, username) {
        this.player.name = username;
        this.players['p'+userId] = this.player;
    },
    createPlayer: function(userId, username) {
        var xp = 'p' + userId;
        var p;
        if (this.players[xp] == undefined) {
            p = new Character(this, 'human', 'male');
            this.players[xp] = p;
            this.movables.push(p);
            p.name = username;
        }
        else {
            p = this.players[xp];
        }
        return p;
    },
    movePlayer: function(player, x, y, mx, my, flags) {
        var p = this.createPlayer(player.userId, player.username);
        
        p.x = x;
        p.y = y;
        p.mx = mx;
        if (flags & 4) p.direction = -1;
        else p.direction = 1;
        p.ducked = (flags & 1);
        p.seated = (flags & 2);
        p.my = my;
        p.changed = true;
    },
    resize: function() {
        this.width = $(window).width();
        this.height = 240;
        Starbound.changed = true;
    },
    render: function() {
        if (this.canvas.width != this.width) {
            this.canvas.width = this.width;
            Starbound.changed = true;
        }
        var ts = new Date().getTime();
        
        var nup = Starbound.changed;
        Starbound.changed = false;
        for (var i in this.movables) {
            nup |= this.updateMovable(this.movables[i], ts, i);
        }
        
        if (!nup) return;
        
        
        var l = (-this.width / 2 + this.player.x)|0;
        while (l < 0) l += 1920;
        while (l > 1920) l-= 1920;
        var w = this.width;
        var nw = 0;
        if (l + w > 1920) {
            w = 1920 - l;
            nw = this.width - w;
        }
        this.background.draw(this.ctx, l|0, 0, w, this.height, 0, 0, w, this.height);
        if (nw) {
            this.background.draw(this.ctx, 0, 0, nw, this.height, w, 0, nw, this.height);
        }
        
        //var isd = this.player.ducked && this.player.seated;
        
        for (var i in this.movables) {
            var movable = this.movables[i];
            //if (movable == this.player || (isd && movable.ly < this.player.ly)) continue;
            movable.changed = false;

            this.ctx.save();
            this.ctx.translate(this.transX(movable.x), this.transY(movable.y));
            movable.render(this.ctx, ts);
            this.ctx.restore();
        }

        if (!this.gameActive) {
            this.ctx.fillStyle = '#ffffff';
            var txt = 'Кликни, чтобы начать бегать!';
            this.ctx.font = '10px fpixfont';
            var m = this.ctx.measureText(txt);
            this.ctx.fillText(txt, this.width / 2 - m.width/2, 40);
        }
        
        /*
        this.player.changed = false;
        this.ctx.save();
        this.ctx.translate((this.width / 2)|0, (75-this.player.y)|0);
        this.player.render(this.ctx, ts);
        this.ctx.restore();
        
        for (var i in this.movables) {
            var movable = this.movables[i];
            if (movable == this.player || (movable.ly >= this.player.ly && !isd)) continue;
            movable.changed = false;

            this.ctx.save();
            this.ctx.translate(this.transX(movable.x), this.transY(movable.y));
            movable.render(this.ctx, ts);
            this.ctx.restore();
        }
        */
    },
    updateMovable: function(m, ts, i) {
        var d = (ts - m.ts)/1000;
        m.ts = ts;
        var u = m.changed;
        var f = null;
        if (d <= 0) return u;
        if (m.mx != 0) {
            m.x += m.mx * d;
            while (m.x < 0) m.x += 1920;
            while (m.x > 1980) m.x -= 1920;
            u = true;
            if (m.my == 0) {
                f = this.getFloor(m.x, m.y);
                if (f < m.y) m.my = -0.001;
            }
        }
        if (m.my != 0) {
            var GRAVITY = -500;
            
            f = f == null ? this.getFloor(m.x, m.y) : f;
            
            m.y += d * m.my + d*d/2 * GRAVITY;
            m.my += d * GRAVITY;
            
            if (m.y <= f) {
                m.y = f;
                if (m.land) {
                    m.land(m.my);
                }
                else {
                    m.my = 0;
                    m.ly = m.y;
                }
                this.resortMovable(i);
            }
            
            u = true;
        }
        return u;
    },
    resortMovableChar: function(c) {
        this.resortMovable(this.movables.indexOf(c));
    },
    resortMovable: function(i) {
        var i = parseInt(i);
        //console.log('pre ',this.movables);
        var m = this.movables[i];
        while (i > 0 && m.ly > this.movables[i-1].ly) {
            this.movables[i] = this.movables[i-1];
            this.movables[i-1] = m;
            i--;
        }
        //console.log('f1 ', this.movables);
        var mlen = this.movables.length;
        while (i < mlen-2 && m.ly < this.movables[i+1].ly) {
            this.movables[i] = this.movables[i+1];
            this.movables[i+1] = m;
            i++;
        }
        if (m.ducked && m.seated) {
            while (i > 0 && m.ly == this.movables[i-1].ly) {
                this.movables[i] = this.movables[i-1];
                this.movables[i-1] = m;
                i--;
            }
        }
        else if (m == this.player) {
            //console.log('move me to front!', i+1, this.movables[i+1]);
            while (i < mlen-1 && m.ly == this.movables[i+1].ly) {
                this.movables[i] = this.movables[i+1];
                this.movables[i+1] = m;
                i++;
            }
        }
        
        //console.log('f2 ', this.movables);
        //if (this.movables.seat)
    },
    getFloor: function(x, y) {
        if (x >= 758 && x <= 804) {
            if (y >= 64) return 64;
            else if (y >= 32) return 32;
        }
        else if (x >= 804 && x <= 872) {
            if (y >= 80 && x <= 844) return 80;
            else if (y >= 48) return 48;
        }
        else if (x >= 1016 && x <= 1040) {
            if (y > 16) return 16;
        }
        else if (x >= 1104 && x <= 1128) {
            if (y > 16) return 16;
        }
        return 0;
    },
    transX: function(x) {
        var x = (this.width / 2 + x - this.player.x)|0;
        while (x < 0) x += 1920;
        while (x >= 1920) x -= 1920;
        return x;
    },
    transY: function(y) {
        return (75-y)|0;
    }
};

function Sprite(url, onload) {
    this.init(url, onload);
}
Sprite._sprites = [];
Sprite.get = function(url, onload) {
    if (Sprite._sprites[url] == undefined) {
         Sprite._sprites[url] = new Sprite(url, onload);
    }
    setTimeout(onload, 100);
    return Sprite._sprites[url];
};
Sprite.prototype = {
    init: function(url, onload) {
        this.ready = false;
        var img = new Image();
        var self = this;
        img.onload = function() {
            self.ready = true;
            
            self.width = this.width;
            self.height = this.height;
            
            var tmpSprite = document.createElement('canvas');
            tmpSprite.width = this.width;
            tmpSprite.height = this.height;
            var tCtx = tmpSprite.getContext('2d');
            tCtx.drawImage(this, 0, 0, this.width, this.height);
            
            self.ctx = tCtx;
            Starbound.changing = true;
            if (onload) onload();
        };
        img.src = '/game/sprites/'+url;
        this.img = img;
    },
    draw: function(ctx, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (!this.ready) return;
        ctx.drawImage(this.img, sx, sy, sw, sh, dx, dy, dw, dh);
    }
};

function Character(game, race, sex) {
    this.game = game;
    this.race = race;
    this.sex = sex;
    this.init();
}
Character.IDLE = 0;
Character.WALK = 1;
Character.RUN = 2;
Character.DUCK = 3;
Character.JUMP = 4;

Character.prototype = {
    init: function() {
        this.x = 0;
        this.y = 0;
        this.mx = 0;
        this.my = 0;
        this.ly = 0;
        this.direction = 1;
        this.ducked = 0;
        this.seated = 0;
        this.changed = false;
        this.moveStart = 0;
        this.state = {
           action: 0,
           actionStart: 0,
           direction: 1
        };
        var self = this;
        var rebuild = function() {self.rebuildSprite()};
        this.sprites = {
            body: Sprite.get(this.race + '/body-' + this.sex + '.png', rebuild),
            frontArm: Sprite.get(this.race + '/body-frontArm.png', rebuild),
            backArm: Sprite.get(this.race + '/body-backArm.png', rebuild),
            accessories: Sprite.get(this.race + '/body-accessories.png', rebuild)
        };
        this.sprite = null;
        this.lastUpdate = 0;
    },
    move: function(doMove, d, walk) {
        if (doMove) {
            this.duck(false, true);
            if (this.moveStart == 0) this.moveStart = new Date().getTime();
            this.mx = d * (walk ? 32 : 70);
            this.direction = d;
        }
        else {
            this.moveStart = 0;
            if (this.mx != 0) {
                this.mx = 0;
            }
        }
        this.changed = true;
    },
    jump: function() {
        this.duck(false, true);
        if (this.my == 0) {
            this.jumpStart = new Date().getTime();
            this.my = 200;
        }
        this.changed = true;
    },
    land: function() {
        this.my = 0;
        this.ly = this.y;
    },
    duck: function(doDuck, force) {
        if (doDuck) {
            this.ducked = true;
            this.mx = 0;
            if (this.x >= 1016 && this.x <= 1040 && this.y == 0) {
                this.x = 1032;
                this.changed = true;
                this.direction = 1;
                this.seat(true);
            }
            else if (this.x >= 1104 && this.x <= 1128 && this.y == 0) {
                this.x = 1120;
                this.changed = true;
                this.direction = -1;
                this.seat(true);
            }
            else {
                this.seat(false);
            }
        }
        else {
            if (!this.seated || force) {
                this.ducked = false;
                this.seat(false);
            }
        }
        this.changed = true;
    },
    seat: function(doSeat) {
        if (this.seated != doSeat) {
            this.seated = doSeat;
            this.game.resortMovableChar(this);
        }
    },
    setAction: function(action, time, options) {
        if (time == null) {
            time = new Date().getTime();
        }
        if (options != undefined) {
            for (var o in options) {
                this.state[o] = options[o];
            }
        }
        this.state.action = action;
        this.state.actionStart = time;
        this.lastUpdate = time;
        
        if (action == Character.IDLE) {
            this.mx = 0;
        }
        else if (action == Character.WALK) {
            this.mx = this.state.direction * 100;
        }
        else if (action == Character.RUN) {
            this.mx = this.state.direction * 200;
        }
        else if (action == Character.JUMP) {
            this.my = 10;
        }
    },
    rebuildSprite: function() {
        //console.log('rebuild sprite');
        
        if (this.sprite == null) {
            this.sprite = document.createElement('canvas');
            this.sprite.style.position = 'absolute';
            this.sprite.style.top = '260px';
            this.sprite.style.backgroundColor = '#ffff00';
            //$('#topheader').append(this.sprite);
        }
        this.sprite.width = 43 * Starbound.PX * 8;
        this.sprite.height = 43 * Starbound.PX * 4;
        var ctx = this.sprite.getContext('2d');
        
        // idle, sit & duck
        for (var i = 0; i < 8; i++) {
            if (i == 6) continue;
            var sx = 43 + i * 43;
            var sy = 0;
            var ax = sx;
            var ay = sy;
            if (i == 5) {
                ax = 43;
                ay--;
            }
            
            if (this.sprites.backArm.ready) {
                this._drawSpritePixels(this.sprites.backArm.ctx,  ctx, ax, ay,     43, 43, i * 43 * Starbound.PX, 0, 43 * Starbound.PX, 43 * Starbound.PX);
            }
            if (this.sprites.body.ready) {
                this._drawSpritePixels(this.sprites.body.ctx,     ctx, sx, sy,     43, 43, i * 43 * Starbound.PX, 0, 43 * Starbound.PX, 43 * Starbound.PX);
            }
            if (this.sprites.frontArm.ready) {
                this._drawSpritePixels(this.sprites.frontArm.ctx, ctx, ax, ay,     43, 43, i * 43 * Starbound.PX, 0, 43 * Starbound.PX, 43 * Starbound.PX);
            }
        }
        
        // walk & run
        for (var i = 0; i < 8; i++) {
            var sx = 43 + i * 43;
            var sy = 43;
            var sy_run = 86;
            var sy_jump = 129;
            
            var loop = [1,0,1,2,3,4,3,2];
            var ax = 86 + loop[i] * 43;
            
            if (this.sprites.backArm.ready) {
                this._drawSpritePixels(this.sprites.backArm.ctx,  ctx, ax, sy,     43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX,     43 * Starbound.PX, 43 * Starbound.PX);
                this._drawSpritePixels(this.sprites.backArm.ctx,  ctx, ax, sy_run, 43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX * 2, 43 * Starbound.PX, 43 * Starbound.PX);
                this._drawSpritePixels(this.sprites.backArm.ctx,  ctx, sx, sy_jump, 43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX * 3, 43 * Starbound.PX, 43 * Starbound.PX);
            }
            if (this.sprites.body.ready) {
                this._drawSpritePixels(this.sprites.body.ctx,     ctx, sx, sy,     43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX,     43 * Starbound.PX, 43 * Starbound.PX);
                this._drawSpritePixels(this.sprites.body.ctx,     ctx, sx, sy_run, 43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX * 2, 43 * Starbound.PX, 43 * Starbound.PX);
                this._drawSpritePixels(this.sprites.body.ctx,     ctx, sx, sy_jump, 43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX * 3, 43 * Starbound.PX, 43 * Starbound.PX);
            }
            if (this.sprites.frontArm.ready) {
                this._drawSpritePixels(this.sprites.frontArm.ctx, ctx, ax, sy,     43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX,     43 * Starbound.PX, 43 * Starbound.PX);
                this._drawSpritePixels(this.sprites.frontArm.ctx, ctx, ax, sy_run, 43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX * 2, 43 * Starbound.PX, 43 * Starbound.PX);
                this._drawSpritePixels(this.sprites.frontArm.ctx, ctx, sx, sy_jump, 43, 43, i * 43 * Starbound.PX, 43 * Starbound.PX * 3, 43 * Starbound.PX, 43 * Starbound.PX);
            }
        }
    },
    _drawSpritePixels: function(srcCtx, dstCtx, sx, sy, sw, sh, dx, dy, dw, dh) {
        //dstCtx.fillRect(0, 0, 50, 50)
        var imgData = srcCtx.getImageData(sx, sy, sw, sh).data;
        
        var idx = 0;
        for (var y = 0; y < sh; y++) {
            for (var x = 0; x < sw; x++) {
                var alpha = imgData[idx + 3];
                if (alpha != 0) {
                    var color = this.rgbToHex( imgData[idx], imgData[idx+1], imgData[idx+2]);
                    
                    dstCtx.fillStyle = '#'+color;
                    dstCtx.fillRect(dx + x * Starbound.PX, dy + y * Starbound.PX, Starbound.PX, Starbound.PX);
                    
                }
            
                idx += 4;
            }
        }
    },
    rgbToHex: function( r, g, b  ) {
	var rs = r.toString(16);
	if ( rs.length == 1 )
		rs = "0" + rs;
	var gs = g.toString(16);
	if ( gs.length == 1 )
		gs = "0" + gs;
	var bs = b.toString(16);
	if ( bs.length == 1 )
		bs = "0" + bs;
	return rs + gs + bs;
    },
    update: function(ts) {
        return;
        if (this.lastUpdate == 0) {
            this.lastUpdate = ts;
            return;
        }
        var d = ts - this.lastUpdate;
        if (this.state.action == Character.WALK) {
            this.x += this.state.direction * d / 25;
            while (this.x < 0) this.x += 1920;
            while (this.x > 1920) this.x -= 1920;
        }
        else if (this.state.action == Character.RUN) {
            this.x += this.state.direction * d / 12;
            while (this.x < 0) this.x += 1920;
            while (this.x > 1920) this.x -= 1920;
        }
        else if (this.state.action == Character.JUMP) {
            //console.log(this.y, this.state.speedY);
            var GRAVITY = -0.5;
            d /= 10;
            this.y = this.y + d * this.state.speedY/2 + d*d/2 * GRAVITY;
            this.state.speedY = this.state.speedY + d * GRAVITY;
            
            if (this.y < 0) {
                this.y = 0;
                this.state.speedY = 0;
                this.setAction(Character.IDLE, null);
            }
            //console.log('->', this.y, this.state.speed);
        }
        this.lastUpdate = ts;
    },
    render: function(ctx, ts) {
        if (!this.sprite) return;
        //console.log('render ' + this.name);
        /*
        var bx = 43, ax = 43;
        var by = 0, ay = 0;
        
        if (this.state.action == 1) {
            by = 43;
            ay = 43;
            ax = 86;
            
            var sp = ts - this.state.actionStart;
            var p = ((sp % 1000) / 125) | 0;
            bx += p * 43;
            
            var loop = [1,0,1,2,3,4,3,2];
            ax += loop[p] * 43;
        }
        
        this.sprites.backArm.draw(ctx, ax, ay, 43, 43, 0, 0, 43, 43);
        this.sprites.body.draw(ctx, bx, by, 43, 43, 0, 0, 43, 43);
        this.sprites.frontArm.draw(ctx, ax, ay, 43, 43, 0, 0, 43, 43);
        
        if (this.sprite != null) {
            ctx.drawImage(this.sprite, 0, 0);
        }
        */
       
       ctx.save();
       
       var bx = 0;
       var by = 0;
       
       if (this.my > 0) {
           by = 43 * Starbound.PX * 3;
           bx = (((200 - this.my) / 40)|0);
           //console.log(this.my, bx);
           bx *= 43 * Starbound.PX;
       }
       else if (this.my < 0) {
           by = 43 * Starbound.PX * 3;
           bx = Math.min(5 + ((Math.abs(this.my) / 100)|0), 7);
           //console.log(this.my, bx);
           bx *= 43 * Starbound.PX;
       }
       else if (this.mx != 0) {
           by = 43 * Starbound.PX * (Math.abs(this.mx) > 40 ? 2 : 1);
           var sp = ts - this.moveStart;
           var p = ((sp % 1000) / 125) | 0;
           bx += p * 43 * Starbound.PX;
       }
       else if (this.ducked) {
           by = 0;
           if (this.seated) bx = 43 * Starbound.PX * 5;
           else bx = 43 * Starbound.PX * 7;
       }
       /*
       if (this.state.action == Character.IDLE) {
           by = 0;
           bx = 0;
       }
       if (this.state.action == Character.DUCK) {
           by = 0;
           bx = 43 * Starbound.PX * 7;
       }
       if (this.state.action == Character.WALK || this.state.action == Character.RUN) {
           by = 43*Starbound.PX*this.state.action;
            var sp = ts - this.state.actionStart;
            var p = ((sp % 1000) / 125) | 0;
            bx += p * 43 * Starbound.PX;
        }
        */
        
        ctx.scale(this.direction, 1);
        ctx.translate(-43*1, 0); 
        ctx.drawImage(this.sprite, bx, by, 43*Starbound.PX, 43*Starbound.PX, 0, 0, 43*Starbound.PX, 43*Starbound.PX);
        
        ctx.restore();
    }
};
