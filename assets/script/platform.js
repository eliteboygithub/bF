

cc.Class({
    extends: cc.Component,

    properties: {       

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        var mainNode = cc.find("Canvas");
        this.main = mainNode.getComponent("game");
    },
    onBeginContact(contact, selfCollider, otherCollider) {
        // if(this.main.isMoving === true) return;
        // if(otherCollider.body.linearVelocity.y < -200) {
        //     this.node.getComponent(cc.Animation).stop();
        //     this.node.runAction(cc.sequence(
        //         cc.delayTime(0.5),
        //         cc.callFunc(this.moveNode, this)
        //     ));
        // }
    },
    moveNode() {
        this.main.moveAll();
    }

    // update (dt) {},
});
