import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: "https://api.deepseek.com",
});

export async function POST(request: NextRequest) {
  try {
    const { userName, userCompany, userIndustry, messages } = await request.json();

    const conversationText = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "客户" : "销售"}: ${m.content}`
      )
      .join("\n");

    const systemPrompt = `你是一个顶级的B2B销售AI分析师。你的任务是根据销售对话，输出结构化的分析结果。

## 分析维度
1. 客户意图分类（5选1）: price_objection(价格异议) | hesitant(犹豫) | high_intent(高意向) | watching(观望) | unclear_need(需求不明确)
2. 客户阶段判断（4选1）: initial_inquiry(初步咨询) | comparison(对比阶段) | closing(即将成交) | at_risk(流失风险)
3. 风险等级（4选1）: low | medium | high | critical
4. 是否建议人工接管
5. AI推荐回复（销售话术，1-3句话）
6. 策略建议和下一步行动

## 输出格式
必须严格返回如下JSON格式（不要markdown代码块，只要纯JSON）:
{
  "intent": {
    "primary": "hesitant",
    "confidence": 85,
    "reasoning": "客户多次提到要对比竞品..."
  },
  "stage": {
    "current": "comparison",
    "indicators": ["对比多家产品", "关注差异化功能", "问及数据安全"]
  },
  "risk": {
    "level": "medium",
    "factors": ["正在主动对比竞品", "未明确给出时间承诺"]
  },
  "strategy": {
    "recommendation": "建议优先强调行业专属模型和安全合规优势，发送行业标杆客户案例",
    "shouldEscalate": false,
    "escalateReason": null,
    "nextActions": ["发送等保三级证书", "安排行业客户线上分享", "48小时后电话跟进"]
  },
  "suggestedReply": "赵总您好！理解您需要综合考虑。我们整理了教育行业的专属方案，方便您对比参考。"
}`;

    const userPrompt = `请分析以下B2B销售对话：

客户信息: ${userName} | ${userCompany} | ${userIndustry}

对话记录:
${conversationText}

请按JSON格式返回分析结果。`;

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "";
    let analysis;
    try {
      analysis = JSON.parse(content.trim());
    } catch {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "分析失败，请稍后重试" },
      { status: 500 }
    );
  }
}
