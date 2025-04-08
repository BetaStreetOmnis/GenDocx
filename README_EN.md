# GenDoc 📝

An intelligent document creation assistant based on advanced LLM APIs, capable of first automatically generating structured outlines from user-provided topics, then creating complete Word documents based on those outlines.

## ✨ Features

- 🤖 Generate high-quality, structured outlines using advanced LLM APIs (like ARK)
- 📑 Smart two-stage processing: first create outline framework, then generate detailed document content
- 🎯 Intelligent topic analysis to create logical chapter and section structures
- 📊 Intuitive and elegant web interface for simple and efficient operation
- 📄 One-click export of generated content to Word documents (.doc)
- ⚡ High-performance backend built with FastAPI
- 🔄 Support for outline adjustments and document regeneration

## 📋 Requirements

- Python 3.8+
- Valid LLM API key

## 🚀 Installation Guide

1. Clone this repository:
   ```bash
   git clone [repository URL]
   cd generator_doc
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your API key in the `.env` file

4. Start the server:
   ```bash
   python run.py
   ```
   or
   ```bash
   uvicorn app:app --reload
   ```

5. Access in your browser: http://localhost:8000

## 📖 User Guide

1. Enter the topic you want to create a document for in the main page input field
2. Set relevant parameters (such as outline depth, style, etc.)
3. Click the "Generate Outline" button
4. Review the generated outline content, make adjustments if necessary
5. After confirming the outline, click the "Generate Document" button, and the system will create a detailed document based on the outline
6. Review the generated complete document content
7. When satisfied, click the "Export to Doc" button to save the document in Word format

## 🤝 Contribution Guidelines

Issues and suggestions for improvement are welcome! To contribute code, please follow these steps:

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details 