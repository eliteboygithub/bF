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
        manSheet: cc.Node,
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
        self.node.on("touchstart", function(event) {
            var touches = event.getTouches();
            self.firstLoc = touches[0].getLocation();
            if(self.menuOn) self.menu.active = false;

        });
        self.node.on("touchend", function(event) {

            var touches = event.getTouches();
            var offX = self.firstLoc.x - touches[0].getLocation().x;
            var offY = self.firstLoc.y - touches[0].getLocation().y;
            if(offY < -80 && self.isAction == false) {
                if(offX > 120) offX = 120;
                else if(offX < -120) offX = -120;
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
                if(self.comboNum > 1) self.manSheet.runAction(cc.sequence(
                    cc.moveBy(0.3, 450, 0),
                    cc.callFunc(function() { self.manSheet.setPosition(cc.v2(-460, 150))})
                ));
            }
            
            
        });
        self.menuShop.on("touchend", function() {
            self.shop.active = true;
            self.menu.active = false;
            self.menuOn = false;
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
            
        });
        self.splayBtn.on("touchend", function() {

        });
        

    },

    start () {
        this.init();
        this.node.children[2].runAction(cc.repeatForever(cc.sequence(
            cc.delayTime(5),
            cc.fadeIn(7.0),
            cc.fadeOut(7.0)                        
        )));
    },

    // update (dt) {},
    init() {
        this.score = 0;
        this.topScore = 0;
        this.gemNum = 1000;
        this.isMoving = false;
        this.isAction = false;
        this.menuOn = false;
        this.firstPlat = this.startFirst;
        this.secondPlat = this.startSecond;
        this.bottle = this.startBottle; 
        this.isEnd = false;
        this.comboNum = 1;
        this.musicOn = true;
        this.skinNum = 0;
        this.showScore();
        this.skins = [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        
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
            this.manSheet.runAction(cc.sequence(
                cc.delayTime(0.3),
                cc.moveBy(0.3, 460 , -150).easing(cc.easeInOut(2.0))
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
                        cc.spawn(cc.rotateBy(1.2, -180), cc.moveBy(1.2, -200 , -1000))
                    ));
                } else {
                    this.bottle.anchorX = 0.5 - diff/this.bottle.width;
                    this.bottle.x = this.bottle.x - diff;
                    this.bottle.runAction(cc.sequence(
                        cc.rotateBy(0.8, 80),
                        cc.spawn(cc.rotateBy(1.2, 180), cc.moveBy(1.2, 200 , -1000).easing(cc.easeIn(2.0)))
                    ));
                }
            }else{
                if(Math.abs(diffX) < 30) this.combo();
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
        this.showScore();
        if(this.comboNum > 2) {
            var bonuslbl = cc.instantiate(this.bonusPrefab);
            bonuslbl.parent = this.uilayer;
            bonuslbl.runAction(cc.sequence(
                cc.delayTime(1.5),
                cc.removeSelf(true)
            ));
        }
    },
    showScore() {
        this.scoreLabel.string = this.score;
        this.gemLabel.string = this.gemNum;
    },
    showShopData() {
        this.shopItem.spriteFrame = this.bottleSprite[this.skinNum];
        if(this.skins[this.skinNum] == 1) {
            this.shop.children[8].active = false;
            this.splayBtn.active = true;
            this.sbuyBtn.active = false;
        }else {
            this.shop.children[8].active = true;
            this.shop.children[8].children[0].getComponent(cc.Label).string = prices[this.skinNum];
            if(prices[this.skinNum] < this.gemNum) {
                this.splayBtn.active = false;
                this.sbuyBtn.active = false;
            }else{
                this.splayBtn.active = false;
                this.sbuyBtn.active = true;
            }
            
        }
    },
    endGame() {
        console.log("end game");
    },
    shopSkin() {

    },
    toggleMusic() {
        if(this.musicOn) {
            this.musicOn = false;
            this.menuMusic.children[1].active = true;
        } else {
            this.musicOn = true;
            this.menuMusic.children[1].active = false;
        }
    },

});
