

cc.Class({
    extends: cc.Component,

    properties: {
        menu: cc.Node,
        menuIcon: cc.Node,
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
                self.bottle.getComponent(cc.Animation).play("water_bottle");
                self.firstPlat.getComponent(cc.Animation).play("fade_down");
                
            }
        })
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
        this.gemNum = 0;
        this.isMoving = false;
        this.isAction = false;
        this.menuOn = false;
        this.firstPlat = this.startFirst;
        this.secondPlat = this.startSecond;
        this.bottle = this.startBottle; 
        this.isEnd = false;
        this.comboNum = 1;
        this.lowScoreArray = ["Good", "Not bad", "Good Job" ]
        this.highScoreArray = ["Well Done", "Perfect", "Good Job", "Great", "Amazing", "Genius"];
        this.showScore();
        
    },
    moveAll() {
        if(this.isEnd ) return;
        this.isMoving = true;
        this.secondPlat.runAction(cc.sequence(
            cc.callFunc(this.moveDown, this),
            cc.delayTime(0.6),
            cc.callFunc(this.afterMove, this)
        ));  
    },
    moveDown() {
        this.secondPlat.runAction(cc.moveBy(0.6, 0, -540));
        this.bottle.runAction(cc.moveBy(0.6, 0, -540));
        this.newPlat.runAction(cc.moveBy(0.6, 0, -540));
    },
    afterMove() {
        if(this.pNum === 0) {
            this.newPlat.getComponent(cc.Animation).play("left_right");
        }else if(this.pNum ===1 && this.combo < 3) {
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
            let firstPos = 45;
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
        var offset = Math.abs(diffX) - 170 * this.secondPlat.scaleX - this.bottle.width / 2;
        if(offset > 0){
            this.bottle.runAction(cc.sequence(cc.moveBy(0.8, 0, -1200), cc.callFunc(this.endGame, this)));
            this.isEnd = true;
        }else {
            var diff = Math.abs(diffX) - 170 * this.secondPlat.scaleX;
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
        successText.getComponent(cc.Label).string = this.lowScoreArray[ran2] + ", +1";
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
        successText.getComponent(cc.Label).string = this.highScoreArray[ran6] + ", +" + this.comboNum;
        successText.parent = this.uilayer;
        successText.runAction(cc.sequence(
            cc.delayTime(1),
            cc.removeSelf(true)
        ));
        this.score += this.comboNum;
        this.showScore();
    },
    showScore() {
        this.scoreLabel.string = this.score;
        this.gemLabel.string = this.gemNum;
    },
    endGame() {
        console.log("end game");
    }
});
