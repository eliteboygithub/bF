cc.Class({
    extends: cc.Component,
    properties: {
        badge: cc.Sprite,
        rankLabel: cc.Label,
        avatarImgSprite: cc.Sprite,
        nickLabel: cc.Label,
        topScoreLabel: cc.Label,
        badgeSprite: {
            default:[],
            type: cc.SpriteFrame,
        }
    },

    init: function (rank, data) {
        if (rank == 0) {
            this.badge.spriteFrame = this.badgeSprite[0];
        } else if (rank == 1) {
            this.badge.spriteFrame = this.badgeSprite[1];
        } else if (rank == 2) {
            this.badge.spriteFrame = this.badgeSprite[2];
        } else{
            this.badge.node.active = false;
        }
        var avatarUrl = data.avatarUrl; 
        var nick = data.nickname;
        var grade = data.KVDataList.length != 0 ? data.KVDataList[0].value : 0;
        this.rankLabel.string = (rank + 1).toString();
        this.createImage(avatarUrl);
        this.nickLabel.string = nick;
        this.topScoreLabel.string = grade.toString();
    },
    createImage(avatarUrl) {
        if (CC_WECHATGAME) {
            try {
                let image = wx.createImage();
                image.onload = () => {
                    try {
                        let texture = new cc.Texture2D();
                        texture.initWithElement(image);
                        texture.handleLoadedTexture();
                        this.avatarImgSprite.spriteFrame = new cc.SpriteFrame(texture);
                    } catch (e) {
                        cc.log(e);
                        this.avatarImgSprite.node.active = false;
                    }
                };
                image.src = avatarUrl;
            }catch (e) {
                cc.log(e);
                this.avatarImgSprite.node.active = false;
            }
        } else {
            cc.loader.load({
                url: avatarUrl, type: 'jpg'
            }, (err, texture) => {
                this.avatarImgSprite.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }

});
