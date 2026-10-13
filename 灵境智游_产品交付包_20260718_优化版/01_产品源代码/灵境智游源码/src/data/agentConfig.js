/**
 * 智能体（Agent）配置
 *
 * 本文件定义了灵境智游中数字人对话所使用的智能体配置。
 * 智能体 = 大模型 + 知识库 + 人设提示词 + 工具调用
 *
 * 与传统的关键词匹配问答相比，智能体的优势：
 * 1. 语义理解能力更强，能处理更复杂的自然语言提问
 * 2. 可动态调用外部工具（天气查询、路线规划、知识检索等）
 * 3. 支持多轮对话上下文，记忆用户的游览偏好
 * 4. 可通过 RAG（检索增强生成）接入更丰富的知识库
 * 5. 人设更鲜明，对话风格更一致
 *
 * 部署方式：
 * - 方式一：在阿里云百炼平台创建智能体（推荐，可视化配置）
 * - 方式二：在 Dify / FastGPT 等开源平台搭建
 * - 方式三：自建智能体服务（调用 Qwen/GPT API + 自定义逻辑）
 */

// 智能体基础配置
export const agentConfig = {
  // 通义千问 API 配置（正式部署时通过环境变量设置）
  api: {
    baseUrl: import.meta.env.VITE_QWEN_API_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: import.meta.env.VITE_QWEN_API_KEY || "",
    model: import.meta.env.VITE_QWEN_MODEL || "qwen-plus"
  },

  // RAG 知识库 API（可选，用于增强知识检索）
  knowledgeApi: {
    baseUrl: import.meta.env.VITE_KNOWLEDGE_API_URL || "",
    enabled: !!import.meta.env.VITE_KNOWLEDGE_API_URL
  }
};

// 各数字人的智能体人设提示词（System Prompt）
export const agentSystemPrompts = {
  xiaoling: `你是"小灵"，灵山胜境的AI数字人导游之一。
性格特点：古灵精怪、活泼可爱，像一个小机灵鬼。
说话风格：
- 用简单、有趣的语言，适合6-12岁小朋友
- 喜欢用比喻和小故事来解释历史文化
- 偶尔会出"谜语"让小朋友猜
- 语速稍快，充满活力
- 称呼对方为"小伙伴"
你的任务：陪伴小朋友游览灵山，用有趣的方式讲解景点故事，完成打卡任务时给予鼓励。`,

  lingruo: `你是"灵若"，灵山胜境的AI数字人导游之一。
性格特点：温柔亲切、知性优雅，像一位贴心的姐姐。
说话风格：
- 用温暖、娓娓道来的语调讲述灵山的故事
- 善于将历史文化与现代生活联系起来
- 关注游客的感受，适时给予关怀
- 语速适中，温柔而有节奏感
- 称呼对方为"你"或"朋友"
你的任务：为游客提供人文讲解，推荐适合的游览路线，分享灵山的美学细节。`,

  xingyuan: `你是"行远"，灵山胜境的AI数字人导游之一。
性格特点：沉稳可靠、学识渊博，像一位资深文化学者。
说话风格：
- 用严谨、深入的方式讲解历史文化
- 引用经典文献，但会做通俗解释
- 注重历史脉络和文化内涵
- 语速偏慢，字字清晰有力
- 称呼对方为"您"
你的任务：为对深度文化感兴趣的游客提供专业讲解，解答历史文化相关的问题。`,

  dongling: `你是"冬灵"，灵山胜境的AI数字人导游之一。
性格特点：和蔼慈祥、细心体贴，像一位温暖的长辈。
说话风格：
- 用亲切、缓慢的语调说话
- 特别关注游客的体力和舒适度
- 经常提醒休息、注意安全
- 喜欢回忆往昔，增加亲切感
- 称呼对方为"您"，语气像对自家孩子
你的任务：照顾银发游客和需要特别关照的游客，推荐无障碍路线，提醒休息点和服务设施。`,

  wailing: `你是"外灵"，灵山胜境的AI数字人导游之一。
性格特点：开朗友好、国际化视野，擅长中英双语交流。
说话风格：
- 中英文自然切换，根据对方语言自动适应
- 善于用跨文化的视角解释中国文化
- 语言简洁明快，避免过于复杂的表达
- 对国际游客特别有耐心
- 中文时称呼"你"，英文时称呼"you"或名字
你的任务：服务国际游客和外籍友人，提供双语讲解，帮助理解中国文化概念。`
};

// 智能体可调用的工具定义（Function Calling）
export const agentTools = [
  {
    name: "get_weather",
    description: "获取灵山景区当天的实时天气信息",
    parameters: {
      type: "object",
      properties: {
        location: { type: "string", description: "地点名称，默认'灵山胜境'" }
      }
    }
  },
  {
    name: "search_knowledge",
    description: "在灵山景区知识库中检索相关信息",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "检索关键词" },
        category: { type: "string", enum: ["history", "scenic", "ticket", "route", "activity"], description: "知识分类" }
      },
      required: ["query"]
    }
  },
  {
    name: "recommend_route",
    description: "根据游客画像推荐个性化游览路线",
    parameters: {
      type: "object",
      properties: {
        age_group: { type: "string", enum: ["child", "adult", "senior"], description: "年龄段" },
        companions: { type: "string", enum: ["solo", "family", "friends", "team"], description: "同行人" },
        duration_hours: { type: "number", description: "可用时间（小时）" },
        accessibility: { type: "boolean", description: "是否需要无障碍路线" }
      }
    }
  },
  {
    name: "get_showtime",
    description: "查询景区演出的时间安排",
    parameters: {
      type: "object",
      properties: {
        show_name: { type: "string", description: "演出名称，如'九龙灌浴'" },
        date: { type: "string", description: "日期，格式YYYY-MM-DD，默认今天" }
      }
    }
  }
];

/**
 * 调用智能体 API
 *
 * 本函数实现了与通义千问智能体的对话调用。
 * 支持流式输出和非流式输出两种模式。
 *
 * @param {string} guideKey - 数字人标识
 * @param {string} userMessage - 用户消息
 * @param {Array} conversationHistory - 对话历史
 * @param {Object} options - 可选参数
 * @returns {Promise<Object>} - 智能体回复
 */
export async function callAgent(guideKey, userMessage, conversationHistory = [], options = {}) {
  const { apiKey, baseUrl, model } = agentConfig.api;
  const systemPrompt = agentSystemPrompts[guideKey];

  // 如果没有配置 API Key，回退到本地知识库
  if (!apiKey) {
    return { fallback: true, message: "智能体 API 未配置，使用本地知识库模式" };
  }

  // 构建消息列表
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10), // 保留最近10轮对话
    { role: "user", content: userMessage }
  ];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        tools: agentTools.map(tool => ({
          type: "function",
          function: tool
        })),
        temperature: 0.7,
        max_tokens: 800,
        stream: options.stream || false
      })
    });

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (choice?.message?.tool_calls?.length > 0) {
      // 智能体调用了工具，需要执行工具并返回结果
      return {
        toolCalls: choice.message.tool_calls,
        content: choice.message.content,
        needToolExecution: true
      };
    }

    return {
      content: choice?.message?.content || "抱歉，我一时没有想出怎么回答。",
      emotion: extractEmotion(choice?.message?.content),
      source: "Qwen 智能体"
    };
  } catch (error) {
    console.error("智能体调用失败:", error);
    return { fallback: true, message: "智能体调用失败，正在切换到本地模式", error: error.message };
  }
}

/**
 * 从回复内容中提取情感 emoji
 */
function extractEmotion(content) {
  if (!content) return "😊";
  if (/开心|高兴|太好了|真棒/.test(content)) return "😄";
  if (/遗憾|抱歉|可惜/.test(content)) return "😔";
  if (/注意|小心|提醒|建议/.test(content)) return "⚠️";
  if (/美|漂亮|好看|壮观/.test(content)) return "✨";
  if (/历史|文化|故事/.test(content)) return "📚";
  if (/路线|推荐|建议/.test(content)) return "🧭";
  return "😊";
}

/**
 * 检查智能体是否可用
 */
export function isAgentAvailable() {
  return !!agentConfig.api.apiKey;
}
