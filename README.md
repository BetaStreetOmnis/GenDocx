# GenDocx 📝

一个基于先进大模型API的智能文档创作助手，能够根据用户输入的主题先自动生成结构化大纲，然后基于大纲生成完整的Word文档。

## ✨ 功能特点

- 🤖 基于大模型API生成高质量、结构化大纲
- 📑 智能二阶段处理：先生成大纲框架，再根据大纲生成详细文档内容
- 🎯 智能分析主题，生成合理的章节和小节结构
- 📊 直观美观的Web界面，操作简单高效
- 📄 支持一键将生成的内容导出为Word文档(.doc)
- ⚡ 基于FastAPI构建的高性能后端
- 🔄 支持大纲调整和文档再生成

## 📋 环境要求

- Python 3.8+
- 有效的大模型API密钥

## 🚀 安装指南

1. 克隆此仓库到本地：
   ```bash
   git clone [仓库地址]
   cd generator_doc
   ```

2. 安装所需依赖：
   ```bash
   pip install -r requirements.txt
   ```

3. 配置环境变量：
   - 复制`.env.example`为`.env`
   - 在`.env`文件中填入您的API密钥

4. 启动服务器：
   ```bash
   python run.py
   ```
   或
   ```bash
   uvicorn app:app --reload
   ```

5. 在浏览器中访问：http://localhost:8000

## 📖 使用说明

1. 在主页输入框中输入您想要创建文档的主题
2. 设置相关参数（如大纲深度、风格等）
3. 点击"生成大纲"按钮
4. 查看生成的大纲内容，必要时可进行调整
5. 确认大纲后，点击"生成文档"按钮，系统将基于大纲内容生成详细文档
6. 查看生成的完整文档内容
7. 满意后，点击"导出为Doc"按钮将文档保存为Word格式

## 🤝 贡献指南

欢迎提交问题和改进建议！如需贡献代码，请遵循以下步骤：

1. Fork 此仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m '添加了一些很棒的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件 