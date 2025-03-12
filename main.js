var width = window.innerWidth;
var height = window.innerHeight;

var game = new Phaser.Game(width, height, Phaser.AUTO, '#game');

var states = {
    preload: function() {
        this.preload = function() {
            game.stage.backgroundColor = '#000000';
            game.load.crossOrigin = 'anonymous';
            game.load.image('bg', './assets/images/bg.png');
            game.load.image('cat', './assets/images/cat.png');
            game.load.image('bronze', './assets/images/bronze.png');
            game.load.image('silver', './assets/images/silver.png');
            game.load.image('gold', './assets/images/gold.png');
            game.load.image('bomb', './assets/images/bomb.png');
            game.load.image('five', './assets/images/five.png');
            game.load.image('three', './assets/images/three.png');
            game.load.image('one', './assets/images/one.png');
            game.load.audio('scoreMusic', './assets/audio/addscore.mp3');
            game.load.audio('bombMusic', './assets/audio/boom.mp3');
            var progressText = game.add.text(game.world.centerX, game.world.centerY, '0%', {
                fontSize: '60px',
                fill: '#ffffff'
            });
            progressText.anchor.setTo(0.5, 0.5);
            game.load.onFileComplete.add(function(progress) {
                progressText.text = progress + '%';
            });
            game.load.onLoadComplete.add(onLoad);
            var deadLine = false;
            setTimeout(function() {
                deadLine = true;
            }, 100);
            function onLoad() {
                if (deadLine) {
                    game.state.start('created');
                } else {
                    setTimeout(onLoad, 1000);
                }
            }
        }
    },
    created: function() {
        this.create = function() {
            var bg = game.add.image(0, 0, 'bg');
            bg.width = game.world.width;
            bg.height = game.world.height;
            var title = game.add.text(game.world.centerX, game.world.height * 0.25, 'CoinCat', {
                fontSize: '40px',
                fontWeight: 'bold',
                fill: '#ad342b'
            });
            title.anchor.setTo(0.5, 0.5);
            var remind = game.add.text(game.world.centerX, game.world.centerY, 'Нажмите в любом месте, чтобы начать. Управление курсором', {
                fontSize: '20px',
                fill: '#ad342b'
            });
            remind.anchor.setTo(0.5, 0.5);
            var man = game.add.sprite(game.world.centerX, game.world.height * 0.75, 'cat');
            var manImage = game.cache.getImage('cat');
            man.width = game.world.width * 0.2;
            man.height = man.width / manImage.width * manImage.height;
            man.anchor.setTo(0.5, 0.5);
            game.input.onTap.add(function() {
                game.state.start('play');
            });
        }
    },
    play: function() {
        var man; 
        var coins; 
        var score = 0; 
        var title; 
        var scoreMusic;
        var bombMusic;
        this.create = function() {
            score = 0;
            game.physics.startSystem(Phaser.Physics.Arcade);
            game.physics.arcade.gravity.y = 888;
            scoreMusic = game.add.audio('scoreMusic');
            bombMusic = game.add.audio('bombMusic');
            var bg = game.add.image(0, 0, 'bg');
            bg.width = game.world.width;
            bg.height = game.world.height;
            man = game.add.sprite(game.world.centerX, game.world.height * 0.75, 'cat');
            var manImage = game.cache.getImage('cat');
            man.width = game.world.width * 0.2;
            man.height = man.width / manImage.width * manImage.height;
            man.anchor.setTo(0.5, 0.5);
            game.physics.enable(man);
            man.body.allowGravity = false;
            title = game.add.text(game.world.centerX, game.world.height * 0.25, '0', {
                fontSize: '40px',
                fontWeight: 'bold',
                fill: '#ad342b'
            });
            title.anchor.setTo(0.5, 0.5);
            var touching = false;
            game.input.onDown.add(function(pointer) {
                if (Math.abs(pointer.x - man.x) < man.width / 2) touching = true;
            });
            game.input.onUp.add(function() {
                touching = false;
            });
            game.input.addMoveCallback(function(pointer, x, y, isTap) {
                if (!isTap && touching) man.x = x;
            });
            coins = game.add.group();
            var coinTypes = ['bronze', 'silver', 'gold', 'bomb'];
            var coinTimer = game.time.create(true);
            coinTimer.loop(1000, function() {
                var x = Math.random() * game.world.width;
                var index = Math.floor(Math.random() * coinTypes.length);
                var type = coinTypes[index];
                var coin = coins.create(x, 0, type);
                coin.type = type;
                game.physics.enable(coin);
                var coinImg = game.cache.getImage(type);
                coin.width = game.world.width / 8;
                coin.height = coin.width / coinImg.width * coinImg.height;
                coin.body.collideWorldBounds = true;
                coin.body.onWorldBounds = new Phaser.Signal();
                coin.body.onWorldBounds.add(function(coin, up, down, left, right) {
                    if (down) {
                        coin.kill();
                        if (coin.type !== 'bomb') game.state.start('over', true, false, score);
                    }
                });
            });
            coinTimer.start();
        }
        this.update = function() {
            game.physics.arcade.overlap(man, coins, pickCoin, null, this);
        }
        function pickCoin(man, coin) {
            if (coin.type === 'bomb') {
                bombMusic.play();
                game.state.start('over', true, false, score);
            } else {
                var point = 1;
                var img = 'one';
                if (coin.type === 'silver') {
                    point = 3;
                    img = 'three';
                } else if (coin.type === 'gold') {
                    point = 5;
                    img = 'five';
                }
                var goal = game.add.image(coin.x, coin.y, img);
                var goalImg = game.cache.getImage(img);
                goal.width = coin.width;
                goal.height = goal.width / (goalImg.width / goalImg.height);
                goal.alpha = 0;
                var showTween = game.add.tween(goal).to({
                    alpha: 1,
                    y: goal.y - 20
                }, 100, Phaser.Easing.Linear.None, true, 0, 0, false);
                showTween.onComplete.add(function() {
                    var hideTween = game.add.tween(goal).to({
                        alpha: 0,
                        y: goal.y - 20
                    }, 100, Phaser.Easing.Linear.None, true, 200, 0, false);
                    hideTween.onComplete.add(function() {
                        goal.kill();
                    });
                });
                score += point;
                title.text = score;
                coin.kill();
                scoreMusic.play();
            }
        }
    },
    over: function() {
        var score = 0;
        this.init = function() {
            score = arguments[0];
        }
        this.create = function() {
            var bg = game.add.image(0, 0, 'bg');
            bg.width = game.world.width;
            bg.height = game.world.height;
            var title = game.add.text(game.world.centerX, game.world.height * 0.25, 'Игра окончена!', {
                fontSize: '40px',
                fontWeight: 'bold',
                fill: '#ad342b'
            });
            title.anchor.setTo(0.5, 0.5);
            var scoreStr = 'Ваш счёт：'+score+' очков';
            var scoreText = game.add.text(game.world.centerX, game.world.height * 0.4, scoreStr, {
                fontSize: '30px',
                fontWeight: 'bold',
                fill: '#ad342b'
            });
            scoreText.anchor.setTo(0.5, 0.5);
            var remind = game.add.text(game.world.centerX, game.world.height * 0.6, 'Нажмите в любом месте, чтобы сыграть еще раз.', {
                fontSize: '25px',
                fontWeight: 'bold',
                fill: '#ad342b'
            });
            remind.anchor.setTo(0.5, 0.5);
            game.input.onTap.add(function() {
                game.state.start('play');
            });
        }
    }
};
Object.keys(states).map(function(key) {
    game.state.add(key, states[key]);
});

game.state.start('preload');