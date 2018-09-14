
cc.Class({
    extends: cc.Component,

    properties: {
        prefabRankItem: cc.Prefab,
        scrollViewContent: cc.Node,
        my_badge: cc.Sprite,
        my_rankLabel: cc.Label,
        my_avatarImgSprite: cc.Sprite,
        my_nickLabel: cc.Label,
        my_topScoreLabel: cc.Label,
        badgeSprite: {
            default:[],
            type: cc.SpriteFrame,
        }

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        var self = this;
        wx.onMessage(data => {
            if(data.msgType == 1){
                self.submitScore(data.score);
                self.myScore = data.score;
                self.fetchFriendData();
            } 
        });
    },

    start () {
        this.fetchFriendData();
        this.myScore = 0;
    },
    
    fetchFriendData() {
        this.scrollViewContent.removeAllChildren();
        if (CC_WECHATGAME) {
            wx.getUserInfo({
                openIdList: ['selfOpenId'],
                success: (userRes) => {
                    let userData = userRes.data[0];
                    var avatarUrl = userData.avatarUrl; 
                    this.my_nickLabel.string = userData.nickName;
                    this.createImage(avatarUrl);
                    
                    //取出所有好友数据
                    wx.getFriendCloudStorage({
                        keyList: ["bottleFlip_score"],
                        success: res => {
                            console.log("wx.getFriendCloudStorage success", res);
                            let data = res.data;
                            data.sort((a, b) => {
                                if (a.KVDataList.length == 0 && b.KVDataList.length == 0) {
                                    return 0;
                                }
                                if (a.KVDataList.length == 0) {
                                    return 1;
                                }
                                if (b.KVDataList.length == 0) {
                                    return -1;
                                }
                                return b.KVDataList[0].value - a.KVDataList[0].value;
                            });
                            for (let i = 0; i < data.length; i++) {

                                var playerInfo = data[i];
                                if (data[i].nickname == userData.nickName) {
                                    this.my_rankLabel.string = i.toString();
                                    if (i == 0) {
                                        this.my_badge.spriteFrame = this.badgeSprite[0];
                                    } else if (i == 1) {
                                        this.my_badge.spriteFrame = this.badgeSprite[1];
                                    } else if (i == 2) {
                                        this.my_badge.spriteFrame = this.badgeSprite[2];
                                    } else{
                                        this.my_badge.node.active = false;
                                    }
                                    if(playerInfo.KVDataList[0] != undefined) {
                                        if(playerInfo.KVDataList[0].value < this.myScore){
                                            this.my_topScoreLabel.string = this.myScore;
                                            console.log("top score updated");
                                            playerInfo.KVDataList[0].value = this.myScore;
                                        }else{
                                            this.my_topScoreLabel.string = playerInfo.KVDataList[0].value;
                                        }
                                    }                                    
                                }
                                var item = cc.instantiate(this.prefabRankItem);
                                item.getComponent('RankItem').init(i, playerInfo);
                                this.scrollViewContent.addChild(item);
                            }
                        },
                        fail: res => {
                            console.log("wx.getFriendCloudStorage fail", res);
                            this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                        },
                    });
                },
                fail: (res) => {
                    this.loadingLabel.getComponent(cc.Label).string = "数据加载失败，请检测网络，谢谢。";
                }
            });
        }
    },
    submitScore(score) { //提交得分
        var kvDataList = new Array(); 
        kvDataList.push({key:"bottleFlip_score", value : "" + score});
        wx.setUserCloudStorage({KVDataList: kvDataList,
            success: function (res) {
                console.log('setUserCloudStorage', 'success', res)
            },
        })
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
                        this.my_avatarImgSprite.spriteFrame = new cc.SpriteFrame(texture);
                    } catch (e) {
                        cc.log(e);
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
                this.my_avatarImgSprite.spriteFrame = new cc.SpriteFrame(texture);
            });
        }
    }
    // sortList: function(ListData, order) { // Sort (ListData: res.data; order: false descending, true ascending) 
    //     ListData.sort(function(a,b){ 
    //         var AMaxScore = 0; 
    //         var KVDataList = a.KVDataList; 
    //         for(var i = 0; i < KVDataList.length; i++){ 
    //             if(KVDataList[i].key == "bigBall_MaxScore"){ 
    //                 AMaxScore = KVDataList[i].value ; 
    //             } 
    //         } 


    //         var BMaxScore = 0; 
    //         KVDataList = b.KVDataList; 
    //         for(var i = 0; i<KVDataList.length; i++){ 
    //             if(KVDataList[i].key == "bigBall_MaxScore"){ 
    //                 BMaxScore = KVDataList[i].value; 
    //             } 
    //         } 


    //         if(order){ 
    //         return parseInt(AMaxScore) - parseInt(BMaxScore); 
    //         }else{
    //         return parseInt(BMaxScore) - parseInt(AMaxScore); 
    //         } 
    //     }); 
    //     return ListData; 
    // }, 

    // update (dt) {},
});
