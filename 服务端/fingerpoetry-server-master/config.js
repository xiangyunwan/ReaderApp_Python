module.exports = {
  cronmag:'1 */15 8,19 * * *',  // 杂志生成
  croncrawl:'1 */2 0-1,6-23 * * *', // 每分钟检查一次
  croncrawlcontent:'1 */2 * * * *', // 每分钟检查一次
  cronproxy:'1 */15 0-1,10-23 * * *', // 10分钟抓取一次
  cronnotifi:'1 */3 * * * *', // 3分钟通知一次一次
  max_page:3,
  pass:"3cb028cf2810",
  umeng_master_key:"xh0hpg7adsbhvgttignixvugsen0rfgx", //友盟的推送key
  umeng_app_key:"5837c14507fe65096a000b48",
  ips:[],
};
