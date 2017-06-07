var avatars = [
    "/faceImages/0.png",
    "/faceImages/1.png",
    "/faceImages/2.png",
    "/faceImages/3.png",
    "/faceImages/4.png",
    "/faceImages/5.png",
    "/faceImages/6.png",
    "/faceImages/7.png",
    "/faceImages/8.png",
    "/faceImages/9.png",
    "/faceImages/10.png",
    "/faceImages/11.png",
    "/faceImages/12.png",
    "/faceImages/13.png",
    "/faceImages/14.png",
    "/faceImages/15.png",
    "/faceImages/16.png",
    "/faceImages/17.png",
    "/faceImages/18.png",
    "/faceImages/19.png",
    "/faceImages/20.png",
    "/faceImages/21.png",
    "/faceImages/22.png",
    "/faceImages/23.png",
    "/faceImages/24.png",
    "/faceImages/25.png",
    "/faceImages/26.png",
    "/faceImages/27.png",
    "/faceImages/28.png",
    "/faceImages/29.png",
    "/faceImages/30.png",
    "/faceImages/31.png",
    "/faceImages/32.png",
    "/faceImages/33.png",
    "/faceImages/34.png",
    "/faceImages/35.png",
    "/faceImages/36.png",
    "/faceImages/37.png",
    "/faceImages/38.png",
    "/faceImages/39.png",
    "/faceImages/40.png",
    "/faceImages/41.png",
    "/faceImages/42.png",
    "/faceImages/43.png",
    "/faceImages/44.png",
    "/faceImages/45.png",
    "/faceImages/46.png",
    "/faceImages/47.png",
    "/faceImages/48.png",
];
/**
 * 获取随机数
 * @param Min 最大值
 * @param Max 最小值
 * @returns {*}
 * @constructor
 */
function getRandomNum(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}

/**
 * 生成token
 * @param userid
 * @param expires
 * @returns {String|ArrayBuffer}
 */
exports.getRandomAvatar =  function () {
    return avatars[getRandomNum(0, avatars.length - 1)];
}

// test
//for(var i = 0; i < 20; i ++){
//    console.log(this.getRandomAvatar());
//}
