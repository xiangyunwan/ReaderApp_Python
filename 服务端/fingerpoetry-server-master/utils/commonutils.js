var _ = require('lodash');
/**
 * 获取随机数
 * @param Min 最大值
 * @param Max 最小值
 * @returns {*}
 * @constructor
 */
exports.getRandomNum=function(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}
var specTopics=[
    "趣闻",
    "杂文",
    "故事",
    "段子",
    "诗歌",
    "美文",
    "历史"]
/**
 * 获取所在频道
 */
exports.getTopic=function(topics){
    var topic="";
    for(var index = 0; index < specTopics.length; index++){
        if(_.indexOf(topics, specTopics[index]) != -1){
            topic = specTopics[index];
            break;
        }
    }
    return topic;
}