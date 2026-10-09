# 实施计划

## 已确定的架构

这是一个单次、无上下文的结构化命名 Agent 增量，不是聊天机器人。浏览器每次只提交一个任务，服务端调用模型一次（JSON 无效时最多重试一次），然后进行 schema 校验；模型不可用时返回确定性的本地 fallback。API key 只在服务端环境变量中，不进入静态前端。

## 阶段一：接口契约与安全边界

1. `api/generate-name.js`：OpenAI-compatible POST 接口；支持 `chinese-name`、`courtesy-name`、`japanese-to-chinese` 三种 task；校验输入、限制长度、禁止未知 task/route/relation/style；不接收或保存上下文。
2. 固定系统提示词：中文名不做直译；表字只生成字、不生成号；日文名区分 conservative/adaptive；片假名只是近似读法；不确定的历史出处不编造。
3. 服务端验证模型 JSON；失败最多重试一次；最终返回本地 fallback。新增 `tools/check_name_api.js` 验证请求、响应和 fallback 契约。
4. `name-agent-client.js`：浏览器只调用同源 API，不含 API key；响应非法或网络失败时使用页面传入的本地 fallback。

## 阶段二：保留现有产品并接入 Agent

5. 保留 `script.js` 的现有本地生成器作为主页面 fallback；只在结果页增加可选 Agent 增强，不改坏 Copy/Share/analytics。
6. 新建 `/courtesy-name-generator/`：已有中文名或先生成中文名后，一次请求获得表字、拼音、关系类型和解释；明确字用于平辈/朋友或文学社交语境，现代法律姓名不使用字。
7. 新建 `/japanese-name-to-chinese-name/`：英文正文 + 日文说明；保守型保留日本姓氏字符，适应型优先中文自然度；输出中文名、拼音、片假名近似读法、保留项和改动项。
8. `name-data.js` 与 `given-names.js` 仅作为本地 fallback、示例和测试样本，不再无限扩展硬编码最终名字。

## 阶段三：SEO 内容与验证

9. 新增 3 篇表字内容页：`/what-is-a-chinese-courtesy-name/`（含 `#zi`）、`/how-to-choose-a-chinese-courtesy-name/`、`/chinese-name-vs-courtesy-name/`；内容解释名/字/号区别，但本轮只生成字。
10. 更新首页导航、页面 metadata、JSON-LD、内部链接、`sitemap.xml`、`tools/check_seo.py`、README 和隐私/失败提示。
11. 新增/更新检查：API contract、原生成器、SEO 链接/schema、页面可访问性与 fallback；最后运行全部检查并写入 `review.md` / `final_report.md`。

## 非目标

- 不生成号。
- 不做多轮对话、用户账户、上下文记忆或数据库。
- 不把 API key 放进浏览器。
- 不部署、不 commit。
