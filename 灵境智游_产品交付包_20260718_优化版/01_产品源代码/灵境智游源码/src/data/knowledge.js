export const knowledgeBase = [
  {
    match: ["大佛多高", "大佛有多高", "grand buddha", "height of the buddha"],
    answer: "灵山大佛通高88米，其中佛体79米、莲花瓣9米；连同基座总高约101.5米，是灵山胜境最具代表性的文化地标。",
    answerEn: "The Grand Buddha itself is 88 meters high, including a 79-meter body and a 9-meter lotus base. With the pedestal, the total height is about 101.5 meters.",
    source: "历史文化游览指南 · 灵山大佛",
    emotion: "✨"
  },
  {
    match: ["九龙灌浴", "九龙", "nine dragons", "bathing"],
    answer: "九龙灌浴通过莲花开启、太子佛升起、九龙喷水和音乐共同呈现“花开见佛”的动态景观。演出时间可能调整，请以景区当日公告为准。",
    answerEn: "Nine Dragons Bathing is a musical fountain performance. A lotus opens, the infant Buddha rises, and nine dragons form a water curtain. Please check the same-day notice for showtimes.",
    source: "景点结构化数据集 · LS-006",
    emotion: "💧"
  },
  {
    match: ["梵宫", "brahma palace", "palace"],
    answer: "灵山梵宫建筑面积约7.2万平方米，融合传统建筑、石窟艺术与现代技术。内部的穹顶天象、琉璃艺术和东阳木雕很有代表性。",
    answerEn: "The Brahma Palace covers about 72,000 square meters and combines Buddhist architecture, grotto art and modern technology. Its dome, glass art and Dongyang woodcarving are highlights.",
    source: "历史文化游览指南 · 灵山梵宫",
    emotion: "🏛️"
  },
  {
    match: ["门票", "票价", "ticket", "price"],
    answer: "资料中的成人票参考价为210元、半价票105元，另有符合条件的免票人群和观光车服务。政策会调整，请以官方当日信息为准。",
    answerEn: "The reference material lists an adult ticket at CNY 210 and a half-price ticket at CNY 105. Policies may change, so please verify the scenic area's same-day notice.",
    source: "个性化游览指南 · 门票政策",
    emotion: "🎫"
  },
  {
    match: ["亲子", "孩子", "儿童", "family", "child"],
    answer: "亲子游推荐“九龙灌浴 → 百子戏弥勒 → 梵宫 → 五印坛城”。讲解会减少抽象术语，增加寻找飞天、观察表情和文化问答任务。",
    answerEn: "For families, I recommend Nine Dragons Bathing, the Happy Maitreya sculpture, Brahma Palace and the Five Mudra Mandala, with playful learning tasks along the way.",
    source: "个性化游览指南 · 亲子路线",
    emotion: "👨‍👩‍👧"
  },
  {
    match: ["老人", "老年", "轮椅", "无障碍", "senior", "wheelchair"],
    answer: "建议选择观光车接驳，把九龙灌浴、梵宫和大佛远眺点作为重点，减少连续步行和台阶，并增加休息提醒。",
    answerEn: "I recommend using the shuttle and focusing on Nine Dragons Bathing, Brahma Palace and a Grand Buddha viewpoint. The route prioritizes flatter paths and more rest stops.",
    source: "本地路线规则 · 银发与无障碍",
    emotion: "🤗"
  },
  {
    match: ["拍照", "打卡", "出片", "photo", "picture"],
    answer: "拍照路线可从灵山照壁开始，依次前往九龙灌浴、梵宫、五印坛城，最后在下午到灵山大佛平台。请留意现场禁拍标识。",
    answerEn: "For photos, start at the Screen Wall, then visit Nine Dragons Bathing, Brahma Palace and the Five Mudra Mandala, ending at the Grand Buddha in softer afternoon light.",
    source: "个性化游览指南 · 拍摄建议",
    emotion: "📷"
  },
  {
    match: ["历史", "文化", "特色", "history", "culture", "about lingshan"],
    answer: "灵山胜境以佛教文化、自然景观和人文体验相融合为特色。核心文化节点包括灵山照壁、九龙灌浴、灵山梵宫、五印坛城和灵山大佛。",
    answerEn: "Lingshan combines Buddhist culture, natural scenery and humanistic experiences. Key sites include the Screen Wall, Nine Dragons Bathing, Brahma Palace, Five Mudra Mandala and the Grand Buddha.",
    source: "景点结构化数据集 · 数据集说明",
    emotion: "📚"
  }
];

/**
 * 计算关键词与用户问题的匹配得分
 * 避免短词（如"九"）误伤长词（如"九龙灌浴"含"龙"匹配"龙虾"）
 * 规则：单字不参与；2+ 字才匹配；命中多个关键词加权
 */
function scoreMatch(question, keywords) {
  const normalized = question.toLowerCase().replace(/[？?！!，,。\s]/g, "");
  let score = 0;
  for (const keyword of keywords) {
    const key = keyword.toLowerCase().replace(/\s/g, "");
    if (key.length < 2) continue;  // 跳过单字
    if (normalized.includes(key)) {
      // 关键词越长权重越高，避免 "九" 抢 "九龙灌浴" 的匹配
      score += key.length;
    }
  }
  return score;
}

export function resolveAnswer(question, route) {
  // AI 问答统一输出中文：不再随语言切换返回英文答案，提示词与答复一律为中文。
  // 英文原文仍保存在 answerEn 字段里备用，但不会对外输出。
  const isEnglish = false;
  if (scoreMatch(question, ["漂亮", "好看", "美吗", "beautiful", "pretty"]) > 0) {
    return {
      answer: isEnglish ? "Absolutely. Your best look today is the confidence you brought to the journey—and the soft afternoon light at the Grand Buddha will make your photos even better!" : "当然漂亮呀！今天的你还有一种准备去发现新风景的神采。下午大佛平台光线更柔和，我再帮你找一个特别出片的角度。",
      source: "亲切闲聊层",
      emotion: "🥰"
    };
  }
  if (scoreMatch(question, ["天气", "下雨", "weather", "temperature"]) > 0) {
    return {
      answer: isEnglish ? "The demo weather card shows 29°C in Wuxi, sunny to partly cloudy. Bring water and sun protection. A deployed version can connect to a live weather service." : "演示天气显示无锡今天29°C，晴到多云。建议带水并注意防晒；正式部署后可接入实时天气服务。",
      source: "天气服务适配层 · 演示数据",
      emotion: "☀️"
    };
  }
  if (scoreMatch(question, ["路线", "推荐", "route", "recommend"]) > 0) {
    return {
      answer: isEnglish ? `I have prepared “${route.title}” for you. It takes about ${route.duration} and covers ${route.steps.map((step) => step[0]).join(", ")}. Open My Route to start navigation.` : `我已经为你准备了“${route.title}”，预计${route.duration}、约${route.distance}。打开“我的路线”即可开始导航。`,
      source: "个性化路线引擎",
      emotion: "🧭"
    };
  }
  // 知识库匹配：选取得分最高的条目（不只取第一个）
  let bestItem = null;
  let bestScore = 0;
  for (const entry of knowledgeBase) {
    const score = scoreMatch(question, entry.match);
    if (score > bestScore) {
      bestScore = score;
      bestItem = entry;
    }
  }
  if (bestItem) return { answer: isEnglish ? bestItem.answerEn : bestItem.answer, source: bestItem.source, emotion: bestItem.emotion };
  return {
    answer: isEnglish ? "I’m not fully certain about that from the verified Lingshan knowledge base. I can help with the Grand Buddha, Brahma Palace, Nine Dragons Bathing, tickets, routes, accessibility and photo spots." : "这个问题在当前灵山知识库里还没有足够可靠的依据，我不想随便编答案。你可以问我灵山大佛、九龙灌浴、梵宫、门票、路线或无障碍信息。",
    source: "知识库边界策略",
    emotion: "🤔"
  };
}
