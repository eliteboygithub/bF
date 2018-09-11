

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
    onCollisionEnter(other, self) {
        console.log("collision entered");
    }

    // update (dt) {},
});
