import type { Message } from "@/types";

function parseConversationText(text: string): Omit<Message, "id" | "userId">[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const messages: Omit<Message, "id" | "userId">[] = [];
  const userPrefixes = /^(客户|用户|我|买家|甲方)[：:]\s*/;
  const assistantPrefixes = /^(销售|客服|顾问|AI|你|乙方|卖家)[：:]\s*/;
  const qaPrefixes = /^[Qq][：:]\s*/;
  const aaPrefixes = /^[Aa][：:]\s*/;

  let hasDetectedPattern = false;

  for (const line of lines) {
    if (userPrefixes.test(line) || qaPrefixes.test(line)) {
      hasDetectedPattern = true;
      const content = line.replace(userPrefixes, "").replace(qaPrefixes, "").trim();
      if (content) messages.push({ role: "user", content, timestamp: new Date().toISOString() });
    } else if (assistantPrefixes.test(line) || aaPrefixes.test(line)) {
      hasDetectedPattern = true;
      const content = line.replace(assistantPrefixes, "").replace(aaPrefixes, "").trim();
      if (content) messages.push({ role: "assistant", content, timestamp: new Date().toISOString() });
    }
  }

  if (!hasDetectedPattern && lines.length >= 2) {
    for (let i = 0; i < lines.length; i++) {
      const role = i % 2 === 0 ? "user" : "assistant";
      const content = lines[i].replace(/^[QqAa][：:]\s*/, "").trim();
      if (content) {
        messages.push({ role, content, timestamp: new Date().toISOString() });
      }
    }
  }

  return messages.slice(-50);
}

export async function parseImportedFile(
  file: File
): Promise<{ messages: Message[]; userName: string }> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let text = "";

  if (extension === "txt") {
    text = await file.text();
  } else if (extension === "docx") {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } else {
    throw new Error("不支持的文件格式，请上传 .txt 或 .docx 文件");
  }

  if (!text.trim()) {
    throw new Error("文件中未检测到文本内容");
  }

  const parsed = parseConversationText(text);
  if (parsed.length === 0) {
    throw new Error("无法识别对话格式。请确保文件中包含客户和销售的对话内容。\n支持格式：\n- 客户：内容 / 销售：内容\n- Q：内容 / A：内容\n- 或客户与销售交替行");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "");
  const userName = baseName.length > 12 ? baseName.slice(0, 12) + "…" : baseName;

  const messages: Message[] = parsed.map((m, i) => ({
    id: `imported-${Date.now()}-${i}`,
    userId: "imported",
    ...m,
  }));

  return { messages, userName };
}

export function generateSampleText(): string {
  return `客户：你好，我想了解一下你们的AI销售系统
销售：您好！请问您目前团队规模和主要业务场景是？
客户：我们销售团队大概20人，主要做B2B软件销售
销售：了解。20人团队很适合我们的系统。您目前最大的痛点是什么？
客户：主要是线索跟进不及时，很多客户聊着聊着就断了
销售：这确实是普遍痛点。我们的AI可以自动分析客户意向，实时提醒跟进时机
客户：听起来不错，价格大概多少？
销售：20人团队年费9.8万，包含全部AI分析功能。要不要先试用7天？
客户：价格还行，但我还想对比一下其他产品
销售：完全理解。我发您一份行业对比资料，方便您决策`;
}
