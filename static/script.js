document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const topicForm = document.getElementById('topicForm');
    const topicInput = document.getElementById('topic');
    const keyPointsInput = document.getElementById('keyPoints');  // 新增重点提要输入框
    const generateBtn = document.getElementById('generateBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const outlineContainer = document.getElementById('outlineContainer');
    const fullTextContainer = document.getElementById('fullTextContainer');
    const outlineEditorContainer = document.getElementById('outlineEditorContainer');
    const outlineEditor = document.getElementById('outlineEditor');
    const editOutlineBtn = document.getElementById('editOutlineBtn');
    const generateFullTextBtn = document.getElementById('generateFullTextBtn');
    const saveOutlineBtn = document.getElementById('saveOutlineBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const exportBtn = document.getElementById('exportBtn');
    const toastContainer = document.getElementById('toastContainer');
    const viewToggleGroup = document.getElementById('viewToggleGroup');
    const viewOutlineBtn = document.getElementById('viewOutlineBtn');
    const viewFullTextBtn = document.getElementById('viewFullTextBtn');
    const generationProgress = document.getElementById('generationProgress');
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const contentTitle = document.getElementById('contentTitle');
    
    // 应用状态
    let state = {
        currentOutline: '',       // 当前大纲内容
        currentFullText: '',      // 当前全文内容
        currentView: 'outline',   // 当前视图（outline或fulltext）
        isEditing: false,         // 是否处于编辑模式
        generationTaskId: null,   // 全文生成任务ID
        isGenerating: false,      // 是否正在生成全文
        keyPoints: ''             // 用户输入的重点提要
    };
    
    // 为输入框添加焦点效果
    topicInput.addEventListener('focus', function() {
        this.parentElement.classList.add('was-validated');
    });
    
    // 提交表单，生成大纲
    topicForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const topic = topicInput.value.trim();
        if (!topic) {
            showToast('请输入主题内容', 'warning');
            topicInput.focus();
            return;
        }
        
        // 显示加载状态
        setLoading(true);
        
        try {
            // 构建FormData对象
            const formData = new FormData();
            formData.append('topic', topic);
            
            // 添加重点提要（如果有）
            const keyPoints = keyPointsInput.value.trim();
            if (keyPoints) {
                formData.append('key_points', keyPoints);
                state.keyPoints = keyPoints;  // 保存到状态中，供后续使用
            }
            
            // 显示准备提示
            outlineContainer.innerHTML = `
                <div class="text-center text-primary py-5 fade-in">
                    <div class="spinner-border mb-3" role="status"></div>
                    <p>正在思考中，请稍候...</p>
                    <p class="small text-muted">正在为"${escapeHtml(topic)}"生成结构化大纲</p>
                </div>
            `;
            
            // 发送请求到后端
            const response = await fetch('/generate-outline', {
                method: 'POST',
                body: formData
            });
            
            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '请求失败');
            }
            
            // 解析响应数据
            const data = await response.json();
            state.currentOutline = data.outline;
            
            // 显示大纲
            displayOutline(state.currentOutline);
            
            // 启用相关按钮
            editOutlineBtn.disabled = false;
            generateFullTextBtn.disabled = false;
            exportBtn.disabled = false;
            
            // 确保处于大纲视图
            switchView('outline');
            
            // 显示成功消息
            showToast('大纲生成成功！', 'success');
        } catch (error) {
            console.error('生成大纲失败:', error);
            showToast(`大纲生成失败: ${error.message}`, 'danger');
            outlineContainer.innerHTML = `
                <div class="text-center text-danger py-5">
                    <i class='bx bx-error-circle' style="font-size: 3rem;"></i>
                    <p class="mt-3">生成大纲时出错</p>
                    <p class="small">${escapeHtml(error.message)}</p>
                </div>
            `;
        } finally {
            // 恢复页面状态
            setLoading(false);
        }
    });
    
    // 切换编辑大纲模式
    editOutlineBtn.addEventListener('click', function() {
        if (state.isEditing) {
            exitEditMode();
        } else {
            enterEditMode();
        }
    });
    
    // 保存编辑的大纲
    saveOutlineBtn.addEventListener('click', function() {
        const editedOutline = outlineEditor.value.trim();
        if (!editedOutline) {
            showToast('大纲内容不能为空', 'warning');
            return;
        }
        
        state.currentOutline = editedOutline;
        displayOutline(state.currentOutline);
        exitEditMode();
        showToast('大纲已更新', 'success');
    });
    
    // 取消编辑
    cancelEditBtn.addEventListener('click', function() {
        exitEditMode(false); // 不更新大纲
    });
    
    // 生成全文
    generateFullTextBtn.addEventListener('click', async function() {
        if (!state.currentOutline) {
            showToast('请先生成大纲', 'warning');
            return;
        }
        
        if (state.isGenerating) {
            showToast('正在生成全文，请稍候...', 'info');
            return;
        }
        
        try {
            state.isGenerating = true;
            setLoading(true);
            
            // 显示生成进度区域
            generationProgress.classList.remove('d-none');
            updateProgressBar(0);
            
            // 准备显示全文容器
            fullTextContainer.innerHTML = `
                <div class="text-center text-primary py-4">
                    <div class="spinner-border mb-3" role="status"></div>
                    <p>正在生成全文，请稍候...</p>
                    <p class="small text-muted">这可能需要一些时间，系统正在处理每个章节</p>
                </div>
            `;
            
            // 切换到全文视图
            switchView('fulltext');
            
            // 开始生成任务
            const formData = new FormData();
            formData.append('outline', state.currentOutline);
            
            // 添加重点提要
            if (state.keyPoints) {
                formData.append('key_points', state.keyPoints);
            }
            
            const response = await fetch('/start-fulltext-generation', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '开始生成任务失败');
            }
            
            const data = await response.json();
            state.generationTaskId = data.task_id;
            
            // 开始处理各个部分
            await processAllSections();
            
        } catch (error) {
            console.error('生成全文失败:', error);
            showToast(`生成全文失败: ${error.message}`, 'danger');
            fullTextContainer.innerHTML = `
                <div class="text-center text-danger py-5">
                    <i class='bx bx-error-circle' style="font-size: 3rem;"></i>
                    <p class="mt-3">生成全文时出错</p>
                    <p class="small">${escapeHtml(error.message)}</p>
                </div>
            `;
        } finally {
            state.isGenerating = false;
            setLoading(false);
        }
    });
    
    // 处理所有部分，逐个生成
    async function processAllSections() {
        let isCompleted = false;
        let fullText = "";
        
        // 提取主题作为标题
        const title = topicInput.value.trim();
        fullText = `# ${title}\n\n`;
        
        while (!isCompleted) {
            try {
                const formData = new FormData();
                formData.append('task_id', state.generationTaskId);
                
                const response = await fetch('/process-next-section', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || '处理章节失败');
                }
                
                const data = await response.json();
                
                // 更新进度
                updateProgressBar(data.progress);
                
                // 如果这个部分已经处理完，添加到全文
                if (data.section_text) {
                    fullText += data.section_text;
                    
                    // 更新显示
                    const formattedFullText = formatFullTextForDisplay(fullText);
                    fullTextContainer.innerHTML = `<div class="fade-in">${formattedFullText}</div>`;
                    
                    // 滚动到底部以查看最新内容
                    fullTextContainer.scrollTop = fullTextContainer.scrollHeight;
                }
                
                // 检查是否全部完成
                isCompleted = data.completed;
                
                // 如果完成，保存结果
                if (isCompleted) {
                    state.currentFullText = fullText;
                    showToast('全文生成成功！', 'success');
                }
                
            } catch (error) {
                console.error('处理章节失败:', error);
                showToast(`处理章节失败: ${error.message}`, 'warning');
                
                // 出错后暂停一下再重试
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        // 更新显示
        displayFullText(state.currentFullText);
        
        // 隐藏进度条
        setTimeout(() => {
            generationProgress.classList.add('d-none');
        }, 1000);
    }
    
    // 更新进度条
    function updateProgressBar(percentage) {
        progressBar.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
    }
    
    // 导出为Word文档
    exportBtn.addEventListener('click', async function() {
        // 确定要导出的内容类型
        const contentType = state.currentView;
        const content = contentType === 'outline' ? state.currentOutline : state.currentFullText;
        
        if (!content) {
            showToast(`没有${contentType === 'outline' ? '大纲' : '全文'}可以导出`, 'warning');
            return;
        }
        
        setLoading(true);
        
        try {
            // 构建FormData对象
            const formData = new FormData();
            formData.append('content', content);
            formData.append('content_type', contentType);
            
            // 显示导出提示
            showToast('正在准备导出文件...', 'info');
            
            // 发送请求，使用blob接收响应
            const response = await fetch('/export-to-doc', {
                method: 'POST',
                body: formData
            });
            
            // 检查响应状态
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '导出失败');
            }
            
            // 获取blob数据
            const blob = await response.blob();
            
            // 创建下载链接
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${contentType === 'outline' ? '大纲' : '完整文档'}.docx`;
            
            // 添加到DOM并触发点击
            document.body.appendChild(a);
            a.click();
            
            // 清理
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // 添加按钮点击动画效果
            exportBtn.classList.add('btn-pulse');
            setTimeout(() => exportBtn.classList.remove('btn-pulse'), 500);
            
            showToast(`${contentType === 'outline' ? '大纲' : '完整文档'}已成功导出为Word文档！`, 'success');
        } catch (error) {
            console.error('导出文档失败:', error);
            showToast(`导出文档失败: ${error.message}`, 'danger');
        } finally {
            setLoading(false);
        }
    });
    
    // 视图切换事件监听
    viewOutlineBtn.addEventListener('click', function() {
        switchView('outline');
    });
    
    viewFullTextBtn.addEventListener('click', function() {
        switchView('fulltext');
    });
    
    // 切换视图（大纲/全文）
    function switchView(view) {
        state.currentView = view;
        
        // 更新按钮状态
        if (view === 'outline') {
            viewOutlineBtn.classList.add('active');
            viewFullTextBtn.classList.remove('active');
            outlineContainer.classList.remove('d-none');
            fullTextContainer.classList.add('d-none');
            contentTitle.textContent = '生成的大纲';
        } else {
            viewOutlineBtn.classList.remove('active');
            viewFullTextBtn.classList.add('active');
            outlineContainer.classList.add('d-none');
            fullTextContainer.classList.remove('d-none');
            contentTitle.textContent = '生成的全文';
        }
        
        // 如果两个视图都有内容，显示切换按钮组
        if (state.currentOutline && state.currentFullText) {
            viewToggleGroup.style.display = 'flex';
        } else {
            viewToggleGroup.style.display = 'none';
        }
    }
    
    // 进入大纲编辑模式
    function enterEditMode() {
        state.isEditing = true;
        outlineEditor.value = state.currentOutline;
        
        // 隐藏展示容器，显示编辑器
        outlineContainer.classList.add('d-none');
        outlineEditorContainer.classList.remove('d-none');
        
        // 更新按钮状态
        editOutlineBtn.innerHTML = '<i class="bx bx-x me-1"></i>取消编辑';
        editOutlineBtn.classList.remove('btn-warning');
        editOutlineBtn.classList.add('btn-danger');
        
        // 禁用其他按钮
        generateFullTextBtn.disabled = true;
        exportBtn.disabled = true;
        
        // 隐藏切换按钮组
        viewToggleGroup.style.display = 'none';
        
        // 添加编辑模式提示
        addEditModeIndicator();
        
        // 聚焦编辑器
        outlineEditor.focus();
    }
    
    // 退出编辑模式
    function exitEditMode(updateOutline = true) {
        state.isEditing = false;
        
        // 显示展示容器，隐藏编辑器
        outlineContainer.classList.remove('d-none');
        outlineEditorContainer.classList.add('d-none');
        
        // 更新按钮状态
        editOutlineBtn.innerHTML = '<i class="bx bx-edit me-1"></i>编辑大纲';
        editOutlineBtn.classList.add('btn-warning');
        editOutlineBtn.classList.remove('btn-danger');
        
        // 启用其他按钮
        generateFullTextBtn.disabled = false;
        exportBtn.disabled = false;
        
        // 如果有全文，显示切换按钮组
        if (state.currentOutline && state.currentFullText) {
            viewToggleGroup.style.display = 'flex';
        }
        
        // 移除编辑模式提示
        removeEditModeIndicator();
    }
    
    // 添加编辑模式指示器
    function addEditModeIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'editModeIndicator';
        indicator.className = 'edit-mode-indicator fade-in';
        indicator.innerHTML = '<i class="bx bx-edit"></i>编辑模式';
        document.body.appendChild(indicator);
    }
    
    // 移除编辑模式指示器
    function removeEditModeIndicator() {
        const indicator = document.getElementById('editModeIndicator');
        if (indicator) {
            indicator.classList.add('fade-out');
            setTimeout(() => {
                indicator.remove();
            }, 300);
        }
    }
    
    // 函数：显示大纲内容
    function displayOutline(outline) {
        // 改进的格式化处理
        let formattedOutline = formatOutlineForDisplay(outline);
        
        // 添加动画效果
        outlineContainer.innerHTML = `<div class="fade-in">${formattedOutline}</div>`;
        
        // 如果生成的内容很长，自动滚动到顶部
        outlineContainer.scrollTop = 0;
    }
    
    // 格式化大纲用于显示
    function formatOutlineForDisplay(outline) {
        if (!outline) return '';
        
        return outline
            .replace(/# (.*)/g, '<h2 class="outline-title">$1</h2>')
            .replace(/## (.*)/g, '<h3 class="outline-section">$1</h3>')
            .replace(/### (.*)/g, '<h4 class="outline-subsection">$1</h4>')
            .replace(/- (.*)/g, '<li>$1</li>')
            .replace(/\n\n/g, '<br>');
    }
    
    // 函数：显示全文内容
    function displayFullText(fullText) {
        if (!fullText) {
            fullTextContainer.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class='bx bx-book-open' style="font-size: 3rem;"></i>
                    <p class="mt-3">全文内容将显示在这里...</p>
                    <p class="small">请先点击"生成全文"按钮</p>
                </div>
            `;
            return;
        }
        
        // 格式化全文用于显示
        let formattedFullText = formatFullTextForDisplay(fullText);
        
        // 添加动画效果
        fullTextContainer.innerHTML = `<div class="fade-in">${formattedFullText}</div>`;
        
        // 如果生成的内容很长，自动滚动到顶部
        fullTextContainer.scrollTop = 0;
    }
    
    // 格式化全文用于显示
    function formatFullTextForDisplay(fullText) {
        if (!fullText) return '';
        
        return fullText
            .replace(/# (.*)/g, '<h1 class="fulltext-title">$1</h1>')
            .replace(/## (.*)/g, '<h2 class="fulltext-chapter">$1</h2>')
            .replace(/### (.*)/g, '<h3 class="fulltext-section">$1</h3>')
            .replace(/#### (.*)/g, '<h4 class="fulltext-subsection">$1</h4>')
            .replace(/- (.*)/g, '<li>$1</li>')
            .replace(/\n\n/g, '<p class="fulltext-paragraph">')
            .replace(/\n/g, '<br>');
    }
    
    // 函数：设置加载状态
    function setLoading(isLoading) {
        if (isLoading) {
            loadingSpinner.classList.remove('d-none');
            generateBtn.disabled = true;
            // 添加按钮加载动画
            generateBtn.classList.add('position-relative');
        } else {
            loadingSpinner.classList.add('d-none');
            generateBtn.disabled = false;
            // 移除按钮加载动画
            generateBtn.classList.remove('position-relative');
        }
    }
    
    // 函数：显示提示消息
    function showToast(message, type = 'info') {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast align-items-center border-0 bg-${type} text-white fade-in`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        // 为不同类型的消息添加不同的图标
        let icon = 'bx-info-circle';
        if (type === 'success') icon = 'bx-check-circle';
        if (type === 'warning') icon = 'bx-error';
        if (type === 'danger') icon = 'bx-x-circle';
        
        // 构建toast内容
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class='bx ${icon} me-2'></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="关闭"></button>
            </div>
        `;
        
        // 添加到容器
        toastContainer.appendChild(toast);
        
        // 初始化bootstrap toast
        const bootstrapToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 4000
        });
        
        // 显示toast
        bootstrapToast.show();
        
        // 监听隐藏事件，在隐藏后移除元素
        toast.addEventListener('hidden.bs.toast', function() {
            toastContainer.removeChild(toast);
        });
    }
    
    // HTML转义函数，防止XSS攻击
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 初始化
    function init() {
        // 设置视图
        switchView('outline');
        
        // 添加初始动画效果
        setTimeout(() => {
            const elements = document.querySelectorAll('.fade-in');
            elements.forEach((el, index) => {
                el.style.animationDelay = (index * 0.1) + 's';
            });
        }, 100);
    }
    
    // 执行初始化
    init();
}); 