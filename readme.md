# config 配置

## token

搜索$TOKEN,然后填上你自己的机器人的 token

# 相关命令

1. 私聊机器人"pumanguard",成为它的主人
   1. 请查看/config/base.ts
2. 把机器人拉入想要守卫的群,并且给它管理员权限
3. 在群中对它说 wake,它将开始守卫这个群
4. 禁止在群内发图,发视频

# 白名单和敏感词

- 私聊机器人
- /ability/guard.ts

0. 列出所有敏感词
   eg: 所有敏感词

1. 增加敏感词(支持多个,中间用空格隔开)
   eg: +敏感词 发财 注册
   解释: 把"发财","注册"加入敏感词

2. 删除敏感词(支持多个,中间用空格隔开)
   eg: -敏感词 发财 注册
   解释: 删除"发财","注册"敏感词
   /

3. 列出所有白名单
   eg: 所有白名单

4. 增加白名单(支持多个,中间用空格隔开)
   eg: +白名单 pumandashi tea
   解释: 把"pumandashi","tea"加入白名单

5. 删除白名单(支持多个,中间用空格隔开)
   eg: -白名单 pumandashi tea
   解释: 删除"pumandashi","tea"白名单

# 前提

- node v16
- npm -g i yarn
- npm -g pm2

# 运行

- yarn
- npx tsc
- pm2 start pm2.json
