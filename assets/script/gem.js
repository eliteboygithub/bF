

cc.Class({
    extends: cc.Component,

    properties: {
        starPrefab: cc.Prefab,
        
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.mainNode = cc.find("Canvas").getComponent("game");
    },
    onCollisionEnter(other, self) {
        var pos = this.node.getPosition();
        var stars = cc.instantiate(this.starPrefab);
        stars.parent = this.node.parent;
        stars.setPosition(pos);
        stars.runAction(cc.sequence(
            cc.delayTime(1.5),
            cc.removeSelf(true)
        ));
        this.node.destroy();
        this.mainNode.gemNum += 1;
        this.mainNode.showScore();
    }

});
