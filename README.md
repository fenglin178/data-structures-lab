# DS.LAB · 数据结构交互学习站

大学数据结构课程的开源交互式学习网站。无需构建工具和第三方依赖。

## 在线访问
GitHub Pages 开启并成功部署后：https://fenglin178.github.io/data-structures-lab/

## 功能
- Infix → Postfix：运算符栈逐步展示优先级、结合性与括号处理
- Postfix Evaluation：数值栈逐步展示入栈、二元运算与中间结果
- 单步前进/后退、自动播放、步骤滑块、自定义算式和输入校验
- 支持非负整数、小数、圆括号及二元 + - * / ^，^ 右结合；不支持一元负号、隐式乘法和科学计数法

示例：9+3*7+(4*5+6)*2 → 9 3 7 * + 4 5 * 6 + 2 * + → 82

## 本地使用
直接用浏览器打开 index.html。算法自动测试需要 Node.js 18+，运行：

    node --test tests/*.test.cjs

## GitHub Pages 部署
在 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
工作流 .github/workflows/pages.yml 在每次推送 main 时先运行测试、再发布网站；pull request 只运行测试。

## 项目结构
- index.html：页面结构及导航
- style.css：主题、布局、响应式样式
- app.js：表达式算法与交互控制
- tests/：自动化算法测试
- ROADMAP.md：后续学习内容

新增模块建议单独组织 JS 文件，并同步添加对应测试。公开仓库不要提交私有信息或密钥。