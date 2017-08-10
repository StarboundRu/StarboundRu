if (typeof console == 'undefined') {
    console = {log: function(msg) {}};
}
var gPlayTrack, goToPage;
function get_cookie(cn) {
  var results = document.cookie.match('(^|;) ?'+cn+'=([^;]*)(;|$)');
  if (results) return (unescape(results[2]));
  else return null;
}
$(function() {
    var $top = $('#topheader');
    var $menu = $('#topheader-menu>ul');
    var $logo = $('#topheader-logo');
    var menuState = 0;
    
    if (window.HTMLAudioElement) {
        var radio = new Audio();

        radio.addEventListener('timeupdate', function() {
            var w = (100*radio.currentTime/radio.duration);
            $('#radio-track-pos').css({'width': w + '%'});
        });
        radio.addEventListener('ended', function() {
            nextTrack();
        });
        var tracks = [
            {name: 'Altair', src: 'Altair.mp3'},
            {name: 'Blue Straggler', src: 'Blue-Straggler.mp3'},
            {name: 'Cygnus-X1', src: 'Cygnus-X1.mp3'},
            {name: 'Epsilon-Indi', src: 'Epsilon-Indi.mp3'},
            {name: 'Europa', src: 'Europa.mp3'},
            {name: 'Glitch', src: 'Glitch.mp3'},
            {name: 'Horsehead Nebula', src: 'Horsehead-Nebula.mp3'},
            {name: 'Hymn to the Stars', src: 'Hymn-to-the-Stars.mp3'},
            {name: 'Inviolate', src: 'Inviolate.mp3'},
            {name: 'Large Magellanic Cloud', src: 'Large-Magellanic-Cloud.mp3'},
            {name: 'Mira', src: 'Mira.mp3'},
            {name: 'On The Beach At Night', src: 'On-The-Beach-At-Night.mp3'},
            {name: 'Procyon', src: 'Procyon.mp3'},
            {name: 'Psyche', src: 'Psyche.mp3'},
            {name: 'Temple of Kluex', src: 'Temple-of-Kluex.mp3'},
            {name: 'Tranquility Base', src: 'Tranquility-Base.mp3'}
        ];
        var lastTrack = null;
        var radioPlaying = false;
        var nextTrack = function() {
            var t;
            do {
                t = (Math.random() * tracks.length)|0;
            } while (t == lastTrack);
            playTrack(t);
        };
        var playRadio = function() {
            $('#radio-download').css({display: 'inline-block'});
            if (lastTrack == null) {
                nextTrack();
            }
            else {
                if (radioPlaying) {
                    radio.pause();
                    radioPlaying = false;
                    $('#radio-play').removeClass('playing');
                }
                else {
                    radio.play();
                    radioPlaying = true;
                    $('#radio-play').addClass('playing');
                }
            }
        };
        var playTrack = function(t) {
            lastTrack = t;

            var track = tracks[t].src;
            if (!radio.canPlayType('audio/mpeg')) {
                track = track.replace(/\.mp3$/, '.ogg');
            }
            //console.log('play ' + track);

            radio.src = '/uploads/ost/'+track;
            $('#radio-download').attr('href', '/uploads/ost/'+tracks[t].src);
            $('#radio-track-name').html(tracks[t].name);
            radio.play();
            radioPlaying = true;
            $('#radio-play').addClass('playing');
        };
        gPlayTrack = function(track) {
            for (var i in tracks) {
                if (tracks[i].src == track) {
                    playTrack(i);
                    return;
                }
            }
            radio.src = '/uploads/ost/'+track;
            $('#radio-download').attr('href', '/uploads/ost/'+track);
            $('#radio-track-name').html(track);
            radio.play();
            radioPlaying = true;
            $('#radio-play').addClass('playing');
        };

        $('#radio-play').click(function(e) {
            playRadio();
            e.preventDefault();
        });
        $('#radio-volume').click(function(e) {
            var offset = $(this).offset();
            var x = Math.max(Math.min((e.clientX - offset.left) - 3, 10), 0);
            document.cookie = 'radio_volume='+x+'; expires=01/01/2020';
            radioSetVolume(x);
            e.preventDefault();
        });
        var radioSetVolume = function(volume) {
            var vp = Math.max(Math.min(((volume / 2)|0) * 20, 80), 0);
            radio.volume = volume/10;
            $('#radio-volume').css({'background-position': '-'+vp+'px -20px'});
        };
        var volume = get_cookie('radio_volume');
        if (volume !== null) {
            radioSetVolume(volume);
        }
    }
    else {
        $('#topheader-radio').hide();
        $('#browser-support').show();
    }
    
    $(window).scroll(function() {
        var top = $(this).scrollTop();
        //console.log(top, menuState);
        if (menuState == 0 && top >= 190) {
            //console.log('fixed!');
            menuState = 1;
            //$menu.css({position:'fixed',top:0});
            $top.css({position:'fixed',top:-190});
            $logo.css({width:'141px',top:'0px'});
            $menu.css({paddingLeft:'180px'});
            $('#topheader-radio').addClass('minimized');
            $('#topheader-radio').css({width:'122px',top:'41px',left:'10px','font-size':'8px'});
        }
        else if (menuState == 1 && top < 190) {
            menuState = 0;
            $top.css({position:'absolute',top:0});
            //$logo.css({width:'331px',top:'20px'});
            //$menu.css({paddingLeft:'0px'});
            $('#topheader-radio').removeClass('minimized');
        }
        if (menuState == 0 && top < 190) {
            // 331
            var w = 331 - top;
            var rw = 300 - top/190*180;
            var t = 20 - top*23/190;
            var rt = 120 - top/190*80;
            var rl = 15 - top/190*5;
            var rs = 12 - top/190*4;
            if (w < 141) w = 141;
            if (t < 0) t = 0;
            var pl = top/190*180;
            $logo.css({width:w+'px',top:t+'px'});
            //if (t < 190) {
                $menu.css({paddingLeft:pl+'px'});
            //}
            $('#topheader-radio').css({width:rw+'px',top:rt+'px',left:rl+'px','font-size':rs+'px'});
        }
    });
    
    var startUrl = document.location.href;
    
    var firstTime = true;
    window.onpopstate = function(e) {
        //console.log(e);
        if (e.state != null) {
            goToPage(e.state.url, true);
        }
        else if (!firstTime) {
            goToPage(startUrl, true);
        }
        firstTime = false;
    };
    
    goToPage = function(url, pop) {
        $('#loading').show();
        $.ajax({
            type: 'GET',
            url: url,
            data: {ajax: 1},
            success: function(result) {
                //console.log('success');
                $('#content').html(result.html);
                $('#loading').hide();
                $('#content a').click(linkHandler);
                document.title = result.title;
                var st = $(document).scrollTop();
                if (!pop) {
                    history.pushState({title: result.title, url: url, scroll: st}, result.title, url);
                }
                if (st > 190) $(document).scrollTop(190);
                site.game.resize();
            },
            error: function(result) {
                alert('Произошла ошибка при загрузке страницы. Пожалуйста, повторите попытку.');
                $('#loading').hide();
            }
        });
    };
    
    var linkHandler = function(e) {
        if (document.location.host == this.host && this.href.substr(-1, 1) == '/' && !this.target) {
            e.preventDefault();
            goToPage(this.href, false);
        }
    };
    
    $('a').click(linkHandler);
    
    //CharGen.Show();
});

function Site(session, userId, signature) {
    this.wsUrl = "ws://starbound.ru/ws/starbound";
    this.session = session;
    this.userId = userId;
    this.signature = signature;
    this.init();
}
Site.prototype = {
    init: function() {
        this.initClient();
        this.initGame();
    },
    initGame: function() {
        var self = this;
        this.game = new Starbound(this.userId, this.username);
        this.game.handler = function(e) {self.playerChanged(e);}
    },
    initClient: function() {
        if (!window.WebSocket) {
            this.sc = null;
            $('#chat').hide();
            $('#browser-support').show();
            return;
        }
        var self = this;
        
        this._connected = false;
        
        this.$chat = $('#chat');
        this.$playerList = $('#chat-players');
        this.$container = $('#chat-container');
        this.$messages = $('#chat-messages');
        this.$chatInput = $('#chat-input');
        this.$scrollButton = $('#chat-scroll-button');
        this.$scrollButton.mousedown(function(e) {
            self.startScrollMove(e.clientY);
            e.preventDefault();
        });
        $(window).mousemove(function(e) {
            self.scrollMove(e.clientY);
        });
        $(window).mouseup(function(e) {
            self.stopScrollMove(e.clientY);
        });
        $('#chat-button-messages').click(function(e) {
            e.preventDefault();
            self.switchTab('messages');
        });
        $('#chat-button-players').click(function(e) {
            e.preventDefault();
            self.switchTab('players');
        });
        this.$chat.click(function() {
            self.$chatInput.focus();
        });
        this.$chatInput.keydown(function(e) {
            if (e.keyCode == 13) {
                var text = self.$chatInput.val();
                if (!self.userId) {
                    self._addComment('* Необходимо войти');
                }
                else if (!self._connected) {
                    self._addComment('* Нет связи с сервером');
                }
                else if (text != '') {
                    self.sendMessage(text);
                    self.$chatInput.val('');
                }
                e.preventDefault();
            }
        });
        this.players = [];
        this.mid = 0;
        
        this.scrollSlow = false;
        this._addComment('* Подключение...');
        this.sc = new StarboundClient(this, this.session, this.userId, this.signature);
        this.switchTab('messages');
        this.scrollDown();
    },
    register: function(userId, signature) {
        this.userId = userId;
        this.signature = signature;
        if (this.sc) this.sc.register(userId, signature);
    },
    currentTab: null,
    switchTab: function(tab) {
        if (tab == this.currentTab) return;
        this.currentTab = tab;
        var h;
        if (tab == 'players') {
            this.$messages.hide();
            this.$playerList.show();
            h = this.$playerList;
        }
        else {
            this.$playerList.hide();
            this.$messages.show();
            h = this.$messages;
        }
        this.updateScroll(h);
    },
    scrollMoving: false,
    scrollData: null,
    scrollDowned: true,
    startScrollMove: function(y) {
        this.scrollData = {
            sp: this.$scrollButton.position().top,
            y: y,
            tab: this.currentTab == 'players' ? this.$playerList : this.$messages,
            ch: this.$container.height()
        };
        this.scrollData.th = this.scrollData.tab.height();
        this.scrollData.sh = this.scrollData.ch - 40;
        if (this.scrollData.th > this.scrollData.ch) {
            this.scrollMoving = true;
        }
    },
    scrollMove: function(y) {
        if (!this.scrollMoving) return;
        var nh = this.scrollData.sp - (this.scrollData.y - y);
        nh = Math.min(Math.max(nh, 0), this.scrollData.sh);
        this.scrollDowned = (this.currentTab == 'messages' && nh == this.scrollData.sh);
        var p = nh / this.scrollData.sh;
        var pp = -(this.scrollData.th - this.scrollData.ch) * p;
        this.scrollData.tab.css({top: pp + 'px'});
        this.$scrollButton.css({top: nh + 'px'});
    },
    stopScrollMove: function(y) {
        if (!this.scrollMoving) return;
        this.scrollMoving = false;
    },
    scrollDown: function() {
        var h = this.$messages.height();
        var ch = this.$container.height();
        var mv = ch-h;
        if (this.scrollSlow) {
            this.$messages.animate({top: mv}, 100);
        }
        else {
            this.$messages.css({top: mv + 'px'});
        }
        this.updateScroll(this.$messages);
    },
    updateScroll: function(tab) {
        var h = tab.height();
        var t = tab.position();
        t = -t.top;
        var ch = this.$container.height();
        var mv = h - ch;
        
        var p = t/mv * (ch - 40);
        this.$scrollButton.css({top: p + 'px'});
    },
    setUser: function(userId, username) {
        this.userId = userId;
        this.username = username;
        this.scrollSlow = true;
        
        if (this.game) this.game.setPlayer(userId, username);
    },
    getPlayer: function(user_id) {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].userId == user_id) return this.players[i];
        }
        return null;
    },
    movePlayer: function(from_id, x, y, mx, my, flags) {
        this.game.movePlayer(from_id, x, y, mx, my, flags);
    },
    sendMessage: function(text) {
        this.sc.sendChat(text);
        this._addMessage(this.username, text);
    },
    addMessage: function(from, to, text, username) {
        if (!username) {
            var fromPlayer = this.getPlayer(from);
            if (fromPlayer == null) return;
            username = fromPlayer.username;
        }
        this._addMessage(username, text);
    },
    chatError: function(errorCode, message) {
        if (errorCode == 4) {
            this._addComment('* Вы забанены');
        }
        else {
            this._addComment('* ' + message, 'red');
        }
    },
    addPrefix: function(prefix) {
        this.$chatInput.val(prefix + ', ' + this.$chatInput.val());
    },
    _addMessage: function(from, text) {
        this.mid++;
        var self = this;
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var html = $('<div class="chat-line'+(this.mid%2==0?' odd':'')+'"><a href="/user/">' + from + '</a>: '+text+'</div>');
        html.find('a').click(function(e) {
            e.preventDefault();
            self.addPrefix($(this).html());
        });
        this.$messages.append(html);
        if (this.scrollDowned) {
            this.scrollDown();
        }
    },
    _addComment: function(text, css) {
        this.mid++;
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        var html = $('<div class="chat-line comment'+(this.mid%2==0?' odd':'')+'">'+text+'</div>');
        if (css) html.addClass(css);
        this.$messages.append(html);
        if (this.scrollDowned) {
            this.scrollDown();
        }
    },
    connected: function() {
        this._addComment('* Подключен');
        this._connected = true;
    },
    disconnected: function() {
        this._connected = false;
        this._addComment('* Отключен');
        this.scrollSlow = false;
    },
    setPlayers: function(players) {
        this.$playerList.html('');
        for (var i in players) {
            this.addPlayer(players[i]);
        }
    },
    addPlayer: function(player) {
        var idx = -1;
        var before = null;
        for (var i in this.players) {
            if (this.players[i].username > player.username) {
                idx = i;
                before = this.players[i].userId;
                break;
            }
        }
        if (idx == -1) {
            this.players.push(player);
        }
        else {
            this.players.splice(i, 0, player);
        }
        var playerLine = $('<div class="chat-player id'+player.userId+'">'+player.username+'</div>');
        if (before == null) {
            this.$playerList.append(playerLine);
        }
        else {
            $('#chat-players .id'+before).before(playerLine);
        }
        
        //console.log(this.players);
    },
    removePlayer: function(user_id) {
        for (var i in this.players) {
            if (this.players[i].userId == user_id) {
                this.players.splice(i, 1);
                break;
            }
        }
        $('#chat-players .id'+user_id).remove();
        
        //console.log(this.players);
    },
    playerChanged: function(player) {
        if (!this.sc) return;
        this.sc.coords(player);
    },
    addPost: function() {
        $.ajax({
            type: 'POST',
            url: '/post/',
            data: {'new': 1},
            success: function(res) {
                //document.location.href = res.url;
                goToPage(res.url);
            }
        });
        return false;
    },
    savePost: function(post_id, title, content, icon, news_type, url, hrl) {
        $.ajax({
            type: 'POST',
            url: '/post/',
            data: {'new': 0, post_id: post_id, title: title, content: content, icon: icon, news_type: news_type, url: url, hrl: hrl},
            success: function(res) {
                if (res.result == 'ok') alert('Сохранён');
            }
        });
        return false;
    }
};

var CharGen = {
    Show: function() {
        var cg = $('<div id="chargen"><iframe src="/chargen/" width="500" height="500" seamless="seamless" style="border-style:none"></iframe></div>');
        $('body').append(cg);
    }
};

var SignForm = {
    _method: 'email',
    _labels: {
        header: ['Регистрация', 'Вход'],
        submit: ['Зарегистрироваться', 'Войти'],
        close: 'Закрыть',
        cancel: 'Отмена'
    },
    Register: function() {
        return SignForm._show(0);
    },
    Login: function() {
        return SignForm._show(1);
    },
    Out: function() {
        $.ajax({
            type: 'POST',
            url: '/sign/',
            data: {ajax: 1, mode: 2},
            success: function(r) {
                $('#userinfo .details').hide();
                $('#userinfo .signlinks').show();
                
                site.register(0, r.signature);
            }
        });
        return false;
    },
    _show: function(mode) {
        SignForm._mode = mode;

        $('#registerform .header .text').html(SignForm._labels.header[mode]);
        $('#registerform .ok').html(SignForm._labels.submit[mode]);
        $('#registerform .cancel').html(SignForm._labels.cancel);
        $('#registerform .formline').show();
        
        if (mode) {
            $('#registerform .regonly').hide();
        }
        else {
            $('#registerform .regonly').show();
        }
        
        $('#registerform .ok').show();
        $('#registerform .submitting').hide();
        $('#registerform .error').hide();
        $('#registerform').show();
        var h = $('#registerform .table').height();
        h = ($(window).height() / 2 - h / 2)|0;
        $('#registerform .table').css({top: h + 'px'});
        return false;
    },
    Hide: function() {
        $('#registerform').hide();
        return false;
    },
    Method: function(method) {
        SignForm._method = method;
        $('#registerform .method a').removeClass('selected');
        $('#registerform .method_'+method).addClass('selected');
        if (method == 'vk') {
            $('#registerform .regmail').hide();
            if (SignForm._mode == 1) {
                $('#registerform .signmail').hide();
            }
            $('#reg_username').focus();
        }
        else {
            $('#registerform .regmail').show();
            $('#registerform .signmail').show();
            if (SignForm._mode == 1) {
                $('#registerform .regonly').hide();
            }
            $('#reg_email').focus();
        }
        return false;
    },
    Submit: function() {
        $('#registerform .ok').hide();
        $('#registerform .submitting').show();
        $('#registerform .error').hide();
        
        var data = {
            ajax: 1,
            mode: SignForm._mode,
            method: SignForm._method
        };

        data.password = $('#reg_pass1').val();
        data.username = $('#reg_username').val();
        if (data.mode == 0 && !data.username) {
            SignForm._error({'username': 'Введите имя пользователя.'});
            return false;
        }

        var errors = {};
        var erc=0;
        if (!data.username) {
            erc++;
            errors.username = 'Введите имя.';
        }
        if (data.mode == 0 && data.password && $('#reg_pass2').val() != data.password) {
            erc++;
            errors.password = 'Значения паролей не совпадают.';
        }
        if (!data.password) {
            erc++;
            errors.password = 'Введите пароль.';
        }

        if (!erc) {
            if (SignForm._method == 'vk') {
                VK.Auth.login(function(ret) {
                    if (ret.session) {
                        data.expire = ret.session.expire;
                        data.mid = ret.session.mid;
                        data.secret = ret.session.secret;
                        data.sig = ret.session.sig;
                        data.sid = ret.session.sid;

                        SignForm._submit(data);
                    }
                    else {
                        erc++;
                        errors.vk = 'Ошибка авторизации Вконтакте';
                    }
                });
            }
            else {
                data.email = $('#reg_email').val();
                if (data.mode == 0 && !data.email) {
                    erc++;
                    errors.email = 'Введите E-mail.';
                }
                if (!erc) {
                    SignForm._submit(data);
                }
            }
        }

        return SignForm._error(errors);
    },
    _submit: function(data) {
        //console.log(data);
        $.ajax({
            type: 'POST',
            url: '/sign/',
            data: data,
            success: function(ret) {
                if (ret.result == 'error') {
                    SignForm._error(ret.error);
                }
                else if (ret.result == 'activation') {
                    SignForm._activation();
                }
                else {
                    $('#my_username').html(ret.username);
                    $('#my_username').attr('href', '/user/' + encodeURIComponent(ret.username_safe) + '/');
                    $('#userinfo .details').show();
                    $('#userinfo .signlinks').hide();
                    SignForm.Hide();
                    
                    site.register(ret.user_id, ret.signature);
                }
            },
            error: function() {
                SignForm._error({'net': 'Сервер сбоит :( Попробуйте ещё раз.'});
            }
        });
    },
    _activation: function() {
        $('#registerform .ok').show();
        $('#registerform .submitting').hide();
        $('#registerform .formline').hide();
        $('#registerform .error_info').show();
        $('#registerform .error_info').html('На ваш e-mail отправлено письмо для активации.');
        $('#registerform .cancel').html(SignForm._labels.close);
        $('#registerform .ok').hide();
        return false;
    },
    _error: function(error) {
        $('#registerform .ok').show();
        $('#registerform .submitting').hide();
        var text = '';
        for (var i in error) {
            $('#registerform .error_'+i).show();
            text += error[i] + ' ';
        }
        $('#registerform .error_info').show();
        $('#registerform .error_info').html(text);
        return false;
    }
};
