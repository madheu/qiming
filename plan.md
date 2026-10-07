# 实施计划

1. 首页 index.html：改 title/meta/social 文案，新增静态名字示例、FAQ 和生肖入口；引用 culture.css；WebApplication JSON-LD。验证唯一H1、canonical和原有生成逻辑。
2. tools/check_zodiac.js：先编写生肖边界测试，1900–2100、闰日、无效日期、2026/2027新年、仅年份不精确与Intl不支持分支。
3. zodiac.js：浏览器/Node共用小型纯函数，预计算农历新年日期表与表单结果（Intl在2027边界失败，已替换）；年份/月日输入清晰报错，生肖结果链接马年对应章节，不记录生日。
4. chinese-zodiac/index.html 与 chinese-zodiac/year-of-the-horse-2026/index.html：交由单个子代理在独立写范围实现，lead负责复核。静态十二生肖内容、FAQ、文化与反思声明。
5. culture.css 与 culture-events.js：沿用项目设计变量，原生HTML交互；无第三方追踪的新页面统计，只记录事件及生肖、不保存生日。
6. sitemap.xml、README.md：登记新页面与测试方式。
7. 运行原生成器测试、生肖测试、静态HTML/链接/schema检查；复核内容与无障碍；记录 review.md / final_report.md。不部署、不commit。
