var lowScoreArray = ["Good", "Not bad", "Good Job" ]
var highScoreArray = ["Well Done", "Perfect", "Good Job", "Great", "Amazing", "Genius"];
var prices = [10,10,20,20,50,50,100,100,200,200,500,500,750,750,1000,1000,1250,1250,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500,1500];



cc.Class({
    extends: cc.Component,

    properties: {
        menu: cc.Node,
        menuIcon: cc.Node,
        menuShop: cc.Node,
        shop: cc.Node,
        shopClose: cc.Node,
        menuShare: cc.Node,
        menuMusic: cc.Node,
        startFirst: cc.Node,
        startSecond: cc.Node,
        startBottle: cc.Node,
        platformSprite: {
            default: [],
            type: cc.SpriteFrame
        },
        platformPrefab: cc.Prefab,
        gameLayer: cc.Node,
        bottleLayer: cc.Node,
        successPrefab: cc.Prefab,
        uilayer: cc.Node,
        scoreLabel: cc.Label,
        gemLabel: cc.Label,
        bestLabel: cc.Label,
        gemPrefab: cc.Prefab,
        bonusPrefab: cc.Prefab,
        manPrefab: cc.Prefab,
        bottlePrefab: {
            default: [],
            type: cc.Prefab,
        },
        bottleSprite: {
            default: [],
            type: cc.SpriteFrame
        },
        shopItem:cc.Sprite,
        leftArrow: cc.Node,
        rightArrow: cc.Node,
        sbuyBtn: cc.Node,
        splayBtn: cc.Node,
        guide: cc.Node,
        gem_panel: cc.Node,
        timer_label: cc.Label,
        giftIcon: cc.Node,
        giftSFrame: {
            default:[],
            type: cc.SpriteFrame
        },
        coinPrefab: cc.Prefab,
        gameOver: cc.Node,
        continueGraphics: cc.Graphics,
        rankBtn: cc.Node,
        ranking: cc.Node,
        rankClose: cc.Node,
        rankView: cc.Sprite,
        
        // Audio Clips
        audiobg: {
            default: null,
            type: cc.AudioClip,
        },
        audiodie: {
            default: null,
            type: cc.AudioClip,
        }, 
        audiojump: {
            default: null,
            type: cc.AudioClip,
        },
        endMenu: cc.Node,
        endRank: cc.Node,
        endShop: cc.Node,
        endRestart: cc.Node,



    },

    onLoad () {
        cc.director.getCollisionManager().enabled = true;

        var self = this;
        self.menuIcon.on("touchend", function(){
            if(self.menuOn) {
                self.menu.active = false;
                self.menuOn = false;
            } else {
                self.menu.active = true;
                self.menuOn = true;
            } 
            
        });
        self.gameLayer.on("touchstart", function(event) {
            var touches = event.getTouches();
            self.firstLoc = touches[0].getLocation();
            if(self.menuOn) self.menu.active = false;

        });
        self.gameLayer.on("touchend", function(event) {
            var touches = event.getTouches();
            var offX = self.firstLoc.x - touches[0].getLocation().x;
            var offY = self.firstLoc.y - touches[0].getLocation().y;
            if(offY < -80 && self.isAction == false) {
                self.jumpAudio();
                var moveUp = cc.moveBy(0.6,0,540);
                var jump = cc.jumpBy(0.7, cc.v2(0, 0), 180, 1);
                self.bottle.runAction(cc.sequence(
                    moveUp,
                    jump,
                    cc.callFunc(self.posValidate, self),
                    cc.callFunc(self.stopAction, self),
                    cc.delayTime(0.5),
                    cc.callFunc(self.moveAll, self)
                ));
                self.isAction = true;
                self.bottle.runAction(cc.moveBy(0.3, offX * -2, 0));
                self.bottle.getComponent(cc.Animation).play();
                self.firstPlat.getComponent(cc.Animation).play("fade_down");
                if(!self.startGame) self.guide.active = false;
            }
            
        });
        self.menuShop.on("touchend", function() {
            self.shop.active = true;
            self.menu.active = false;
            self.menuOn = false;
            self.skinNum = self.curSkin;
            self.showShopData();
            if(self.skinNum == 0) {
                self.leftArrow.active = false;
                self.shop.children[2].active = true;
            }
        });
        self.shopClose.on("touchend", function() {
            self.shop.active = false;
        });
        self.menuMusic.on("touchend", function() {
            self.toggleMusic();
        });
        self.menuShare.on("touchend", function() {
            console.log ("click share button");
            // actively pull up the sharing interface 
            var canvas = cc.game.canvas;
            var width  = cc.winSize.width;
            // var height  = cc.winSize.height;
            canvas.toTempFilePath({
                x: 0,
                y: 0,
                width: width,
                height: 500,
                destWidth: 500,
                destHeight: 500,
                success (res) {
                    //.可以保存该截屏图片
                    console.log(res)
                    wx.shareAppMessage({
                        title: "Let's play Bottle Flip!",
                        imageUrl: res.tempFilePath,
                        success(res){ 
                        }, 
                        fail(res){                             
                        }
                    })
                }
            });

        });
        self.leftArrow.on("touchend", function() {
            if(self.skinNum == 1) {
                self.leftArrow.active = false;
                self.shop.children[2].active = true;
            }
            if(self.skinNum == 29) {
                self.rightArrow.active = true;
            }
            self.skinNum -= 1;
            self.showShopData();
        });
        self.rightArrow.on("touchend", function() {
            if(self.skinNum == 28) {
                self.rightArrow.active = false;
                self.shop.children[4].active = true;
            }
            if(self.skinNum == 0) {
                self.leftArrow.active = true;
            }
            self.skinNum += 1;
            self.showShopData();
        });
        self.sbuyBtn.on("touchend", function() {
            self.buySkin();
        });
        self.splayBtn.on("touchend", function() {
            self.shopSkinPlay();
        });
        self.gem_panel.on("touchend", function() {
            self.shop.active = true;
            self.menu.active = false;
            self.menuOn = false;
            self.skinNum = self.curSkin;
            if(self.skinNum == 0) {
                self.leftArrow.active = false;
                self.shop.children[2].active = true;
            }
        });
        self.giftIcon.on("touchend", function() {
            if(self.isTimer) return;
            var coin = cc.instantiate(self.coinPrefab);
            coin.parent = self.uilayer;
            coin.runAction(cc.sequence(
                cc.moveBy(0.6, 0, 900),
                cc.callFunc(self.giftProcess, self),
                cc.removeSelf(true)
            ));
        });
        self.gameOver.children[4].on("touchend", function() {
            console.log ("click share button");
            // actively pull up the sharing interface 
            var canvas = cc.game.canvas;
            var width  = cc.winSize.width;
            // var height  = cc.winSize.height;
            canvas.toTempFilePath({
                x: 0,
                y: 0,
                width: width,
                height: width,
                destWidth: 500,
                destHeight: 500,
                success (res) {
                    //.可以保存该截屏图片
                    console.log(res)
                    wx.shareAppMessage({
                        title: "Let's play Bottle Flip!",
                        imageUrl: res.tempFilePath,
                        success(res){ 
                            self.continueGame();
                        }, 
                        fail(res){ 
                            
                        }
                    })
                }
            })
            
        });
        self.rankBtn.on("touchend", function() {
            self.ranking.active = true;
            self.showRankState = true;
        });
        self.rankClose.on("touchend", function() {
            self.ranking.active = false;
            self.showRankState = false;
        });
        self.endRank.on("touchend", function() {
            self.ranking.active = true;
            self.showRankState = true;
        });
        self.endShop.on("touchend", function() {
            self.shop.active = true;
            self.skinNum = self.curSkin;
            self.showShopData();
            if(self.skinNum == 0) {
                self.leftArrow.active = false;
                self.shop.children[2].active = true;
            }
        });
        self.endRestart.on("touchend", function() {
            self.endMenu.active = false;
            self.restartGame();
        });
    },

    start () {
        this.firstPlat = this.startFirst;
        this.secondPlat = this.startSecond;
        this.skinNum = 0;
        this.initStorage()
        this.init();
        // this.node.children[2].runAction(cc.repeatForever(cc.sequence(
        //     cc.delayTime(5),
        //     cc.fadeIn(7.0),
        //     cc.fadeOut(7.0)                        
        // )));
        this.skinSet();
        if (CC_WECHATGAME) {
            window.wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
            this.tex = new cc.Texture2D();
            window.sharedCanvas.width = 504;
            window.sharedCanvas.height = 864;
        };
        this.backMusic = cc.audioEngine.play(this.audiobg, true);        
    },
    jumpAudio() { 
        if(this.musicOn) cc.audioEngine.play(this.audiojump, false);
    },
    update (dt) {
        if(this.drawIt) this.updateDraw(dt);
        if(this.showRankState) this._updateSubDomainCanvas();
        this.delta += dt;
        if(this.delta < 1) return;
        this.runTimer();
        this.delta = 0;
    },
    init() {
        this.startGame = false;
        this.score = 0;
        this.topScore = 0;
        this.gemNum = 0;
        this.isMoving = false;
        this.isAction = false;
        this.menuOn = false;        
        this.bottle = this.startBottle; 
        this.isEnd = false;
        this.comboNum = 1;
        this.musicOn = true;        
        this.shopChecked = false;
        this.curSkin = 0;
        this.skins = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        this.dueTime = new Date().getTime() + (1000 * 60 * 5);
        this.isTimer = true;
        this.getData();
        this.showScore();
        this.musicOn = true;
        this.showRankState = false;
        this.revives = 0;
        
    },
    moveAll() {
        if(this.isEnd ) return;
        this.isMoving = true;
        this.secondPlat.runAction(cc.sequence(
            cc.callFunc(this.moveDown, this),
            cc.delayTime(0.6),
            cc.callFunc(this.afterMove, this)
        ));  
        if(this.comboNum > 1) {
            var manSheet = cc.instantiate(this.manPrefab);
            manSheet.parent = this.gameLayer;
            manSheet.runAction(cc.sequence(
                cc.delayTime(0.3),
                cc.moveBy(0.3, 460 , -150).easing(cc.easeInOut(2.0)),
                cc.delayTime(2),
                cc.moveBy(0.3, 480, 0),
                cc.removeSelf(true)
            ));
        }
    },
    moveDown() {
        this.secondPlat.runAction(cc.moveBy(0.6, 0, -540));
        this.bottle.runAction(cc.moveBy(0.6, 0, -540));
        this.newPlat.runAction(cc.moveBy(0.6, 0, -540));
    },
    afterMove() {
        if(this.pNum === 0) {
            this.newPlat.getComponent(cc.Animation).play("left_right");
        }else if(this.pNum ===1 && this.comboNum < 3) {
            this.newPlat.getComponent(cc.Animation).play("scale");
        }
        this.isAction = false;
        this.firstPlat.destroy();
        this.firstPlat = this.secondPlat;
        this.secondPlat = this.newPlat;
        this.isMoving = false;
        
    },
    genPlat() {
        
        var platform = cc.instantiate(this.platformPrefab);
        var ran = Math.floor(Math.random() * 5);
        this.pNum = Math.floor(Math.random() * 3);
        platform.parent = this.gameLayer;
        if(this.pNum === 0) {
            platform.setPosition(cc.v2( 0, 760));
        } else {
            var ranX = 190 - Math.random() * 380;
            platform.setPosition(cc.v2(ranX, 760));
        }        
        platform.getComponent(cc.Sprite).spriteFrame = this.platformSprite[ran]; 
        this.newPlat = platform;
        // gem generate section
        if(this.comboNum > 2) {
            for (var i = 0; i < 3; i++) {
                var gem = cc.instantiate(this.gemPrefab);
                gem.setPosition(cc.v2(0, 45 + 80 * i));
                gem.parent = platform;
            }
        }  
    },
    stopAction() {
        this.secondPlat.getComponent(cc.Animation).stop();
        this.genPlat();

    },
    posValidate() {
        var diffX = this.secondPlat.x - this.bottle.x;
        var offset = Math.abs(diffX) - 140 * this.secondPlat.scaleX - this.bottle.width / 2;
        if(offset > 0){
            this.bottle.runAction(cc.sequence(cc.moveBy(0.8, 0, -1200), cc.callFunc(this.endGame, this)));
            this.isEnd = true;
        }else {
            var diff = Math.abs(diffX) - 140 * this.secondPlat.scaleX;
            if(diff > 0){
                this.isEnd = true;
                if(diffX > 0) {
                    this.bottle.anchorX = 0.5 + diff/this.bottle.width;
                    this.bottle.x = this.bottle.x + diff;
                    this.bottle.runAction(cc.sequence(
                        cc.rotateBy(0.8, -80),
                        cc.spawn(cc.rotateBy(1.2, -180), cc.moveBy(1.2, -200 , -1000)),
                        cc.callFunc(this.endGame, this)
                    ));
                } else {
                    this.bottle.anchorX = 0.5 - diff/this.bottle.width;
                    this.bottle.x = this.bottle.x - diff;
                    this.bottle.runAction(cc.sequence(
                        cc.rotateBy(0.8, 80),
                        cc.spawn(cc.rotateBy(1.2, 180), cc.moveBy(1.2, 200 , -1000).easing(cc.easeIn(2.0))),
                        cc.delayTime(1.5),
                        cc.callFunc(this.endGame, this)

                    ));
                }
            }else{
                if(Math.abs(diffX) < 15) this.combo();
                else this.success();
            }
        }
    },
    success() {
        var successText = cc.instantiate(this.successPrefab);
        var ran2 = Math.floor(Math.random() * 2);
        successText.getComponent(cc.Label).string = lowScoreArray[ran2] + ", +1";
        successText.parent = this.uilayer;
        successText.runAction(cc.sequence(
            cc.delayTime(1),
            cc.removeSelf(true)
        ));
        this.comboNum = 1;
        this.score +=1;
        if(this.score > this.topScore) this.topScore = this.score;
        this.showScore();
    },
    combo() {
        this.comboNum +=1;
        var successText = cc.instantiate(this.successPrefab);
        var ran6 = Math.floor(Math.random() * 6);
        successText.getComponent(cc.Label).string = highScoreArray[ran6] + ", +" + this.comboNum;
        successText.parent = this.uilayer;
        successText.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.removeSelf(true)
        ));
        this.score += this.comboNum;
        if(this.score > this.topScore) this.topScore = this.score;
        this.showScore();
        if(this.comboNum > 2) {
            var bonuslbl = cc.instantiate(this.bonusPrefab);
            bonuslbl.parent = this.uilayer;
            bonuslbl.runAction(cc.sequence(
                cc.delayTime(2),
                cc.removeSelf(true)
            ));
        }
        
    },
    showScore() {
        this.scoreLabel.string = this.score;
        this.gemLabel.string = this.gemNum;
        this.bestLabel.string = "Best:" + this.topScore;
    },
    showShopData() {
        this.shopItem.spriteFrame = this.bottleSprite[this.skinNum];
        if(this.skins[this.skinNum] == 1) {
            this.shop.children[8].active = false;
            this.splayBtn.active = true;
            this.sbuyBtn.active = false;
            this.shop.children[10].active = false;
        }else {
            this.shop.children[8].active = true;
            this.shop.children[8].children[0].getComponent(cc.Label).string = prices[this.skinNum];
            if(prices[this.skinNum] > this.gemNum) {
                this.splayBtn.active = false;
                this.sbuyBtn.active = false;
                this.shop.children[10].active = true;
            }else{
                this.splayBtn.active = false;
                this.sbuyBtn.active = true;
                this.shop.children[10].active = false;
            }            
        }
    },
    buySkin() {
        this.skins[this.skinNum] = 1;
        this.gemNum -= prices[this.skinNum];
        this.splayBtn.active = true;
        this.sbuyBtn.active = false;
        this.shop.children[8].active = false;
        this.showScore();
    },
    endGame() {
        this.playAudio(this.audiodie);
        this.bottle.destroy();
        this.saveData();
        if(this.revives > 2) {
            this.endMenu.active = true;
            this.endMenu.children[0].getComponent(cc.Label).string = this.score;
            return;
        }
        this.gameOver.active = true;
        this.gameOver.children[0].getComponent(cc.Label).string = this.score;
        this.gameOver.children[2].getComponent(cc.Sprite).spriteFrame = this.bottleSprite[this.skinNum];
        
        this.updateShape();
        wx.postMessage({
            msgType: 1,
            score:this.topScore,
        });
    },
    shopSkinPlay() {
        if(this.isEnd) {
            this.shop.active = false;
            this.curSkin = this.skinNum;
            console.log("current skin changed: " + this.curSkin);
            return;
        }        
        this.curSkin = this.skinNum;
        
        var orgPos = this.bottle.getPosition();
        this.bottle.destroy();
        var newBottle = cc.instantiate(this.bottlePrefab[this.skinNum]);
        newBottle.setPosition(orgPos);
        newBottle.parent = this.bottleLayer;
        this.shop.active = false;
        this.bottle = newBottle;
    },
    toggleMusic() {
        if(this.musicOn) {
            cc.audioEngine.pause(this.backMusic);
            this.musicOn = false;
            this.menuMusic.children[1].active = true;
        } else {
            cc.audioEngine.resume(this.backMusic);
            this.musicOn = true;
            this.menuMusic.children[1].active = false;
        }
    },
    checkShopState() {
        if(this.shopChecked) return;
        var lowestPrice = 0;
        for( var i = 0; i < 30; i++) {
            if(this.skins[i] == 0) {
                lowestPrice = prices[i];
                this.shopChecked = true;
                break;
            }
        }
        if(lowestPrice < this.gemNum) {
            var available = this.uilayer.children[8];
            available.active = true;
            available.runAction(cc.sequence(
                cc.delayTime(1),
                cc.fadeOut(3),
                cc.callFunc(function() {
                    available.active = false;
                }),
                cc.callFunc(this.returnCheckState, this)
            ));
            var seq = cc.repeat(
                cc.sequence(
                    cc.moveBy(0.5, 0, 10),
                    cc.moveBy(0.5, 0, -10)
                ), 3);
            this.gem_panel.children[2].runAction(seq);
        }
    },
    returnCheckState() {
        this.uilayer.children[8].opacity = 255;
        this.shopChecked = false;
    },
    runTimer() {
        if(this.isTimer === false) return;
        var now = new Date().getTime();
        var distance = this.dueTime - now;
        if(distance < 0) {
            this.isTimer = false;
            this.giftIcon.getComponent(cc.Animation).play();
            this.timer_label.string = "Gift";
            return;
        }
        var minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60) );
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        this.timer_label.string = this.pad(minutes) + ":" + this.pad(seconds);
    },

    pad(d) {
        return (d < 10) ? '0' + d.toString() : d.toString();
    },
    giftProcess() {
        var gifts = [50, 100, 150, 200]
        var ran4 = Math.floor(Math.random() * gifts.length);
        var ranGem = gifts[ran4];
        this.gemNum += ranGem;
        this.showScore();
        this.resetTimer();
        this.checkShopState();
    },
    resetTimer() {
        this.giftIcon.getComponent(cc.Animation).stop();
        this.dueTime = new Date().getTime() + (1000 * 60 * 5);
        this.giftIcon.getComponent(cc.Sprite).spriteFrame = this.giftSFrame[0];
        this.isTimer = true;
    },
    updateShape() {
        this.drawIt = true;
        this.deltaTime = 0;
    },
    drawShape(diff) {
        var graphics = this.continueGraphics;
        graphics.clear();
        graphics.arc(0,0,180, 0 * Math.PI, diff * Math.PI, true);
        graphics.lineTo(0,0);
        graphics.fill();
    },
    updateDraw(dt) {
        this.deltaTime += dt;
        if(this.deltaTime > 6) {
            this.drawIt = false;
            this.gameOver.active = false;
            this.endMenu.active = true;
            this.endMenu.children[0].getComponent(cc.Label).string = this.score;
        }
        this.drawShape(this.deltaTime / 3);
    },
    restartGame() {
        this.revives = 0;
        this.score = 0;
        this.isEnd = false;
        this.isAction = false;
        this.gameOver.active = false;
        this.drawIt = false;
        var plat = cc.instantiate(this.platformPrefab);
        plat.setPosition(cc.v2(0, -320));
        plat.parent = this.gameLayer;
        this.firstPlat = plat;
        var newBottle = cc.instantiate(this.bottlePrefab[this.curSkin]);
        newBottle.setPosition(cc.v2(0, -312));
        newBottle.parent = this.bottleLayer;
        this.bottle = newBottle;
        this.secondPlat.x = 0;
        this.scoreLabel.string = this.score;
        this.dueTime = new Date().getTime() + (1000 * 60 * 5);
        this.isTimer = true;
        this.showRankState = false;
    },
    initStorage() {
        var isD = cc.sys.localStorage.getItem("bottle_isData");
        if(isD == null || isD == 0 || isD == undefined){
            console.log("local data init");
            var userData = {
                top: 0,
                gems: 0,
                skins: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                cur_skin: 0,
            };
            cc.sys.localStorage.setItem("bottleFlip_userData", JSON.stringify(userData));
            cc.sys.localStorage.setItem("bottle_isData", 1);
        }
    },
    getData() {
        if(cc.sys.localStorage.getItem("bottleFlip_userData") != null && cc.sys.localStorage.getItem("bottleFlip_userData") != undefined) {
            var userData = JSON.parse(cc.sys.localStorage.getItem("bottleFlip_userData"));
            this.topScore = userData.top;
            this.skins = userData.skins;
            this.gemNum = userData.gems;
            this.curSkin = userData.cur_skin;
        }
    },

    saveData() {
        if(this.score > this.best_score) this.best_score = this.score;
        var userData = {
            top: this.topScore,
            gems: this.gemNum,
            skins: this.skins,
            cur_skin: this.curSkin,
        };
        cc.sys.localStorage.setItem("bottleFlip_userData", JSON.stringify(userData));
        cc.sys.localStorage.setItem("bottle_isData", 1);
    },
    continueGame() {
        this.revives += 1;
        this.isEnd = false;
        this.isAction = false;
        this.gameOver.active = false;
        this.drawIt = false;
        var plat = cc.instantiate(this.platformPrefab);
        plat.setPosition(cc.v2(0, -320));
        plat.parent = this.gameLayer;
        this.firstPlat = plat;
        this.bottle.destroy();
        var newBottle = cc.instantiate(this.bottlePrefab[this.curSkin]);
        newBottle.setPosition(cc.v2(0, -312));
        newBottle.parent = this.bottleLayer;
        this.bottle = newBottle;
        this.secondPlat.x = 0;

    },
    skinSet() {
        if(this.curSkin != 0) {
            this.bottle.destroy();
            var newBottle = cc.instantiate(this.bottlePrefab[this.curSkin]);
            newBottle.setPosition(cc.v2(0, -312));
            newBottle.parent = this.bottleLayer;
            this.bottle = newBottle;
        }
    },
    _updateSubDomainCanvas () {
       
        if (window.sharedCanvas != undefined) {
            this.tex.initWithElement(window.sharedCanvas);
            this.tex.handleLoadedTexture();
            this.rankView.spriteFrame = new cc.SpriteFrame(this.tex);
        }
    },

    playAudio(audio) {
        if(this.musicOn) {
            cc.audioEngine.playEffect(audio, false);
        }
    }

});
