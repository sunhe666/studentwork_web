<template>
  <div class="thesis-guide-container">
    <Navbar />
    <main class="main-content">
      <h1 class="page-title">论文指导 - AI助手
         <p style='font-size:12px;color:red'>已接入DeepSeek-R1-联网满血版</p>
      </h1>
   
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessages">
          <!-- 欢迎消息 -->
          <div class="message bot-message">
            <div class="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#42b983" width="40" height="40">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <div class="message-content">
              <p>欢迎使用论文指导AI助手！我可以为您提供论文写作的相关指导。请输入您的问题，我会尽力为您解答。</p>
              <p class="suggestion">例如：</p>
              <ul class="suggestion-list">
                <li @click="sendMessage('如何撰写论文摘要？')">如何撰写论文摘要？</li>
                <li @click="sendMessage('论文引言部分应该包含哪些内容？')">论文引言部分应该包含哪些内容？</li>
                <li @click="sendMessage('怎样选择合适的论文关键词？')">怎样选择合适的论文关键词？</li>
              </ul>
            </div>
          </div>
          
          <!-- 消息列表将动态插入这里 -->
          <div v-for="msg in messages" :key="msg.id" :class="['message', msg.isUser ? 'user-message' : 'bot-message']">
            <div v-if="msg.isUser" class="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#666" width="40" height="40">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <div v-else class="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#42b983" width="40" height="40">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
              </svg>
            </div>
            <div class="message-content">
              <div v-if="msg.isLoading" class="loading-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <div v-else v-html="msg.content"></div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <textarea
            v-model="inputMessage"
            @keyup.enter="handleKeyPress"
            placeholder="请输入您的问题..."
            :disabled="isLoading"
          ></textarea>
          <button @click="sendMessage()" :disabled="isLoading || !inputMessage.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { ElMessage } from 'element-plus';
import axios from '../axios.js';

const router = useRouter();
const messages = ref([]);
const inputMessage = ref('');
const isLoading = ref(false);
const chatMessages = ref(null);

// 预设的AI回答模板
const aiResponses = {
  '如何撰写论文摘要？': `
    <h3>论文摘要撰写指南</h3>
    <p>论文摘要是论文内容的简要概括，通常包括研究目的、方法、结果和结论等核心要素。以下是撰写高质量论文摘要的建议：</p>
    <ol>
      <li><strong>明确目的</strong>：说明研究的背景、问题和目标。</li>
      <li><strong>简述方法</strong>：描述研究采用的主要方法和技术路线。</li>
      <li><strong>展示结果</strong>：呈现研究的主要发现和成果。</li>
      <li><strong>得出结论</strong>：总结研究的意义和价值。</li>
      <li><strong>语言精炼</strong>：避免冗余信息，保持简洁明了，通常200-300字为宜。</li>
      <li><strong>关键词关联</strong>：确保摘要内容与论文关键词紧密相关。</li>
    </ol>
    <p>示例结构："本文针对...问题，采用...方法，研究了...，结果表明...，结论指出..."</p>
  `,
  '论文引言部分应该包含哪些内容？': `
    <h3>论文引言内容指南</h3>
    <p>引言是论文的开篇部分，旨在引导读者了解研究的背景、意义和目的。高质量的引言通常包含以下内容：</p>
    <ol>
      <li><strong>研究背景</strong>：介绍研究领域的现状和发展趋势。</li>
      <li><strong>问题提出</strong>：指出当前研究中存在的不足或有待解决的问题。</li>
      <li><strong>研究目的</strong>：明确说明本研究的目标和要解决的具体问题。</li>
      <li><strong>研究意义</strong>：阐述研究的理论价值和实际应用价值。</li>
      <li><strong>研究方法</strong>：简要介绍研究采用的方法和技术路线。</li>
      <li><strong>论文结构</strong>：概述论文的组织架构，引导读者阅读。</li>
    </ol>
    <p>引言写作要点：逻辑清晰，层次分明，从广泛的背景逐渐聚焦到具体研究问题，避免过于冗长或偏离主题。</p>
  `,
  '怎样选择合适的论文关键词？': `
    <h3>论文关键词选择指南</h3>
    <p>关键词是反映论文核心内容的词语，有助于读者快速了解论文主题和检索相关文献。选择合适的关键词应遵循以下原则：</p>
    <ol>
      <li><strong>准确性</strong>：关键词应准确反映论文的核心内容和主题。</li>
      <li><strong>特异性</strong>：避免使用过于宽泛或通用的词汇，尽量选择具体、针对性强的术语。</li>
      <li><strong>规范性</strong>：优先使用学科领域内公认的规范术语，避免使用口语化或不规范的表达。</li>
      <li><strong>数量适当</strong>：通常选择3-5个关键词，过多或过少都会影响检索效果。</li>
      <li><strong>覆盖全面</strong>：关键词应覆盖论文的主要研究对象、方法和结论。</li>
      <li><strong>参考数据库</strong>：可以参考相关数据库（如CNKI、PubMed）中的主题词表选择规范关键词。</li>
    </ol>
    <p>示例：对于一篇关于"基于深度学习的图像识别"的论文，关键词可以选择"深度学习；图像识别；卷积神经网络；特征提取；模式识别"。</p>
  `,
};

// 系统提示
const systemPrompt = "你是一位友善的论文写作助手，专门帮助大学生解决论文相关问题。\n\n回答要求：\n1. 用简单易懂的语言回答，避免过于复杂的学术术语\n2. 直接回答核心问题，不要过度展开\n3. 回答控制在100-300字以内\n4. 语气亲切友好，像朋友一样交流\n5. 如果涉及具体写作技巧，给出实用的建议和例子\n6. 不使用markdown格式符号（如*、#、-等）\n7. 回答要简洁明了，重点突出\n\n请用通俗的话语帮助学生理解和解决论文写作中的问题。";

// 发送消息
const sendMessage = (predefinedMessage = null) => {
  if (isLoading.value) return;

  let messageText = predefinedMessage || inputMessage.value.trim();
  if (!messageText) return;

  // 添加用户消息
  messages.value.push({
    id: Date.now(),
    content: messageText,
    isUser: true,
    isLoading: false
  });

  // 清空输入框
  inputMessage.value = '';

  // 设置加载状态
  isLoading.value = true;

  // 滚动到底部
  scrollToBottom();

  // 构建请求消息
  const requestMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.value.filter(msg => !msg.isLoading).map(msg => ({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    }))
  ];

  // 调用AI聊天接口
  isLoading.value = true;

  // 添加AI消息（加载中）
  const aiMessageId = Date.now() + 1;
  messages.value.push({
    id: aiMessageId,
    content: '',
    isUser: false,
    isLoading: true
  });

  scrollToBottom();

  // 使用axios发送非流式请求
  axios.post('/ai/chat', {
    messages: requestMessages,
    apiKey: ''  // 如需要API密钥，可在此处填写
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    isLoading.value = false;
    const aiMessageIndex = messages.value.findIndex(msg => msg.id === aiMessageId);
    if (aiMessageIndex !== -1) {
      // 更新AI消息内容并处理特殊符号、列表换行、表格和带圈数字
      let processedContent = response.content || '';
      // 删除#*—等特殊符号
      processedContent = processedContent.replace(/[#*—]/g, '');
      // 将四个####转换为换行
      processedContent = processedContent.replace(/####/g, '<br><br>');
      // 数字列表标记前添加换行（如1.）
      processedContent = processedContent.replace(/(^|\s)(\d+\.)/g, '$1<br>$2');
      // 中文列表标记前添加换行（如一、）
      processedContent = processedContent.replace(/(^|\s)([一二三四五六七八九十]+、)/g, '$1<br>$2');
      // 带圈数字前添加换行（如①）
      processedContent = processedContent.replace(/(^|\s)([\u2460-\u2473\u3251-\u32BF])/g, '$1<br>$2');
      
      // 处理Markdown表格
      processedContent = processMarkdownTable(processedContent);
      
      // Markdown表格处理函数
      function processMarkdownTable(content) {
        // 匹配表格的正则表达式
        const tableRegex = /([^\n]+)\n(-+\|?-+)(\n([^\n]+))+/g;
        
        return content.replace(tableRegex, (match, headerLine, separatorLine, contentLines) => {
          // 解析表头
          const headers = headerLine.split('|').map(header => header.trim());
          
          // 解析内容行
          const contentRows = contentLines.trim().split('\n')
            .map(row => row.split('|').map(cell => cell.trim()));
          
          // 生成HTML表格
          let htmlTable = '<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">\n';
          
          // 添加表头
          htmlTable += '  <thead>\n    <tr>\n';
          headers.forEach(header => {
            htmlTable += `      <th>${header}</th>\n`;
          });
          htmlTable += '    </tr>\n  </thead>\n';
          
          // 添加表体
          htmlTable += '  <tbody>\n';
          contentRows.forEach(row => {
            htmlTable += '    <tr>\n';
            row.forEach(cell => {
              htmlTable += `      <td>${cell}</td>\n`;
            });
            htmlTable += '    </tr>\n';
          });
          htmlTable += '  </tbody>\n</table>';
          
          return htmlTable;
        });
      }
      messages.value[aiMessageIndex].content = processedContent;
      messages.value[aiMessageIndex].isLoading = false;
    }
    scrollToBottom();
  })
  .catch(error => {
    console.error('AI chat error:', error);
    isLoading.value = false;
    const aiMessageIndex = messages.value.findIndex(msg => msg.id === aiMessageId);
    if (aiMessageIndex !== -1) {
      messages.value[aiMessageIndex].isLoading = false;
    }
    // 检查是否有错误响应体
    if (error.response && error.response.data) {
      ElMessage.error(error.response.data.message || 'AI服务请求失败');
    } else {
      ElMessage.error('无法连接到AI聊天服务，请检查网络或稍后再试');
    }
  });
};

// 处理键盘事件
const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
    }
  });
};



// 页面加载时滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.thesis-guide-container {
  padding-top: 120px;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin-top:20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 300px); /* 调整高度，为输入框留出空间 */
  min-height: 400px; /* 设置最小高度 */
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  margin-bottom: 150px; /* 为固定的输入框和tabbar留出更多空间 */
}

.chat-messages {
  flex: 1;
  padding: 20px;
  padding-bottom: 100px; /* 增加底部padding，避免被输入框覆盖 */
  overflow-y: auto;
  background-color: #f9f9f9;
  scroll-behavior: smooth; /* 平滑滚动 */
}

.message {
  display: flex;
  margin-bottom: 15px;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  flex-direction: row-reverse;
}

.bot-message {
  flex-direction: row;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  margin-left: 10px;
  flex-shrink: 0;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  word-break: break-word;
  line-height: 1.6;
}

.user-message .message-content {
  background-color: #42b983;
  color: white;
  border-top-right-radius: 4px;
}

.bot-message .message-content {
  background-color: #e5e5ea;
  color: #333;
  border-top-left-radius: 4px;
}

.chat-input {
  display: flex;
  padding: 15px 20px;
  background-color: white;
  border-top: 1px solid #eee;
  position: fixed;
  bottom: 70px; /* 为底部tabbar留出空间 */
  right: 0;
  left: 0;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  max-width: 1200px; /* 与主内容区域保持一致 */
  margin: 0 auto; /* 居中对齐 */
}

.chat-input textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  resize: none;
  height: 48px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.chat-input textarea:focus {
  border-color: #42b983;
}

.chat-input button {
  width: 48px;
  height: 48px;
  margin-left: 10px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.chat-input button:hover:not(:disabled) {
  background-color: #359469;
}

.chat-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-indicator {
  display: flex;
  gap: 6px;
  padding: 10px 0;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #666;
  animation: pulse 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.suggestion {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 10px 0 0 0;
}

.suggestion-list li {
  padding: 6px 12px;
  margin-bottom: 5px;
  background-color: #f0f0f0;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  display: inline-block;
  margin-right: 10px;
}

.suggestion-list li:hover {
  background-color: #e0e0e0;
}

.message-content h3 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 10px;
}

.message-content ol, .message-content ul {
  margin-top: 10px;
  margin-bottom: 10px;
  padding-left: 20px;
}

.message-content li {
  margin-bottom: 6px;
}

@media (max-width: 768px) {
  .thesis-guide-container {
    padding-top: 100px;
  }

  .main-content {
    padding: 15px;
  }

  .chat-container {
    height: calc(100vh - 250px); /* 移动端调整高度 */
    margin-bottom: 140px; /* 为移动端输入框和tabbar留出更多空间 */
  }

  .chat-messages {
    padding: 15px;
    padding-bottom: 120px; /* 移动端增加更多底部空间 */
  }

  .chat-input {
    padding: 10px 15px;
    left: 0;
    right: 0;
    bottom: 60px; /* 移动端为tabbar留出空间 */
    max-width: none; /* 移动端全宽 */
  }

  .chat-input textarea {
    padding: 10px 14px;
    font-size: 16px; /* 防止iOS缩放 */
  }

  .message-content {
    max-width: 75%;
  }
}
</style>
