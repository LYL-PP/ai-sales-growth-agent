"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { mockUsers, mockConversations } from "@/lib/mock";
import { parseImportedFile, generateSampleText } from "@/lib/import-parser";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Brain,
  Target,
  ShieldAlert,
  Lightbulb,
  MessageSquare,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Clock,
  UserCheck,
  ChevronDown,
  Zap,
  Plus,
  Upload,
  X,
  FileText,
  Download,
  Trash2,
} from "lucide-react";
import type { AIAnalysis, UserIntent, UserStage, RiskLevel, Message, User, Conversation } from "@/types";

const intentMap: Record<UserIntent, { label: string; color: string }> = {
  price_objection: { label: "价格异议", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  hesitant: { label: "犹豫", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  high_intent: { label: "高意向", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  watching: { label: "观望", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  unclear_need: { label: "需求不明确", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

const stageMap: Record<UserStage, { label: string; step: number }> = {
  initial_inquiry: { label: "初步咨询", step: 1 },
  comparison: { label: "对比阶段", step: 2 },
  closing: { label: "即将成交", step: 3 },
  at_risk: { label: "流失风险", step: -1 },
};

const riskLabelMap: Record<RiskLevel, string> = {
  low: "text-emerald-400 bg-emerald-500/10",
  medium: "text-amber-400 bg-amber-500/10",
  high: "text-orange-400 bg-orange-500/10",
  critical: "text-red-400 bg-red-500/10",
};

export default function AnalysisPage() {
  const [selectedUserId, setSelectedUserId] = useState("u1");
  const [isLoading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = JSON.parse(localStorage.getItem("growth-agent-analysis") || "{}");
      return saved["u1"] || null;
    } catch { return null; }
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Import state
  const [importedUsers, setImportedUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("growth-agent-imported-users");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [importedConversations, setImportedConversations] = useState<Record<string, Conversation>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("growth-agent-imported-conversations");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<{ messages: Message[]; userName: string } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("growth-agent-imported-users", JSON.stringify(importedUsers));
  }, [importedUsers]);

  useEffect(() => {
    localStorage.setItem("growth-agent-imported-conversations", JSON.stringify(importedConversations));
  }, [importedConversations]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const clearImported = () => {
    setImportedUsers([]);
    setImportedConversations({});
    localStorage.removeItem("growth-agent-imported-users");
    localStorage.removeItem("growth-agent-imported-conversations");
    setSelectedUserId("u1");
  };

  const allUsers = useMemo(
    () => mounted ? [...mockUsers, ...importedUsers] : mockUsers,
    [mounted, importedUsers]
  );

  const selectedUser = useMemo(
    () => allUsers.find((u) => u.id === selectedUserId),
    [selectedUserId, allUsers]
  );
  const conversation = useMemo(
    () => importedConversations[selectedUserId] || mockConversations[selectedUserId],
    [selectedUserId, importedConversations]
  );

  const handleFileImport = async (file: File) => {
    setImportError(null);
    try {
      const result = await parseImportedFile(file);
      setImportPreviewData(result);
      setShowImportPreview(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "导入失败");
    }
  };

  const confirmImport = () => {
    if (!importPreviewData) return;
    const { messages, userName } = importPreviewData;
    const userId = `imported-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: userName,
      avatar: userName.slice(0, 2).toUpperCase(),
      company: "导入数据",
      title: "未知",
      industry: "未知",
      tags: [{ id: `t-import-${Date.now()}`, label: "导入", type: "behavior" }],
      stage: "initial_inquiry",
      intent: "unclear_need",
      probability: 50,
      riskLevel: "medium",
      lastActive: new Date().toISOString(),
      source: "文件导入",
    };
    const newConversation: Conversation = {
      userId,
      messages: messages.map(m => ({ ...m, userId })),
    };

    setImportedUsers(prev => [newUser, ...prev]);
    setImportedConversations(prev => ({ ...prev, [userId]: newConversation }));
    setSelectedUserId(userId);
    setAnalysis(null);
    setShowImportPreview(false);
    setImportPreviewData(null);
  };

  const cancelImport = () => {
    setShowImportPreview(false);
    setImportPreviewData(null);
    setImportError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAnalyze = async () => {
    if (!conversation || !selectedUser) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: selectedUser.name,
          userCompany: selectedUser.company,
          userIndustry: selectedUser.industry,
          messages: conversation.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
      // Persist to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem("growth-agent-analysis") || "{}");
        saved[selectedUserId] = { ...data, analyzedAt: new Date().toISOString() };
        localStorage.setItem("growth-agent-analysis", JSON.stringify(saved));
      } catch {}
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "分析失败"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReply = () => {
    if (analysis?.suggestedReply) {
      navigator.clipboard.writeText(analysis.suggestedReply);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const intent = analysis?.intent;
  const stage = analysis?.stage;
  const risk = analysis?.risk;
  const strategy = analysis?.strategy;

  return (
    <div className="flex h-full">
      {/* Left: User List + Chat */}
      <div className="relative flex w-[400px] shrink-0 flex-col border-r border-border">
        {/* User selector */}
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              客户对话
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const sample = generateSampleText();
                  const blob = new Blob([sample], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "对话模板.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="下载对话模板"
              >
                <Download className="h-3 w-3" />
                模板
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary transition-all hover:bg-primary/25 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                导入
              </button>
              {mounted && importedUsers.length > 0 && (
                <button
                  onClick={clearImported}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="清除所有导入数据"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.docx"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileImport(file);
                }}
              />
            </div>
          </div>
          {importError && (
            <div className="mb-2 flex items-center gap-1.5 rounded-md bg-red-500/10 px-2.5 py-1.5 text-[11px] text-red-400">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              {importError}
              <button onClick={() => setImportError(null)} className="ml-auto">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {allUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  setSelectedUserId(user.id);
                  setError(null);
                  // Try to restore previous analysis from localStorage
                  try {
                    const saved = JSON.parse(localStorage.getItem("growth-agent-analysis") || "{}");
                    setAnalysis(saved[user.id] || null);
                  } catch {
                    setAnalysis(null);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                  selectedUserId === user.id
                    ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                    : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Avatar className="h-5 w-5">
                  <AvatarFallback className={cn("text-[9px]", user.source === "文件导入" && "bg-cyan-500/20 text-cyan-400")}>
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                {user.name}
                {user.source === "文件导入" && (
                  <span className="flex h-3.5 items-center rounded bg-cyan-500/15 px-1 text-[8px] text-cyan-400">
                    导入
                  </span>
                )}
                {user.probability >= 80 && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20">
                    <TrendingUp className="h-2 w-2 text-emerald-400" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="space-y-3">
            {conversation?.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "justify-start" : "justify-start"
                )}
              >
                <Avatar className="mt-0.5 h-6 w-6 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-[9px]",
                      msg.role === "assistant"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    {msg.role === "user" ? selectedUser?.avatar : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-medium text-foreground">
                      {msg.role === "user" ? selectedUser?.name : "销售顾问"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {msg.timestamp.slice(11, 16)}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Import Preview Modal */}
        {showImportPreview && importPreviewData && (
          <div className="absolute inset-0 z-50 flex flex-col bg-card">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-medium text-foreground">导入预览</span>
                <Badge variant="outline" className="text-[10px] bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                  {importPreviewData.messages.length} 条消息
                </Badge>
              </div>
              <button onClick={cancelImport} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              <p className="mb-3 text-[13px] text-muted-foreground">
                识别用户：<span className="font-semibold text-foreground">{importPreviewData.userName}</span>
              </p>
              <div className="space-y-2">
                {importPreviewData.messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "rounded-lg px-3 py-2 text-[12px]",
                    msg.role === "user"
                      ? "bg-secondary text-muted-foreground"
                      : "bg-primary/5 text-foreground"
                  )}>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {msg.role === "user" ? "客户" : "销售"}
                    </span>
                    <p className="mt-0.5 leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer buttons - always visible */}
            <div className="flex shrink-0 gap-2 border-t border-border px-5 py-3">
              <button
                onClick={cancelImport}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-[13px] font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              >
                取消
              </button>
              <button
                onClick={confirmImport}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <Upload className="h-3.5 w-3.5" />
                确认导入
              </button>
            </div>
          </div>
        )}

        {/* Analyze button */}
        <div className="border-t border-border px-4 py-3">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium transition-all",
              isLoading
                ? "bg-primary/10 text-primary/50 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 分析中...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                AI 分析对话
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: AI Analysis Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
              AI 分析结果
            </h2>
          </div>

          {!analysis && !isLoading && !error && (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border">
              <Brain className="mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                选择左侧客户，点击「AI 分析对话」开始分析
              </p>
            </div>
          )}

          {error && (
            <Card className="flex items-center gap-3 border-red-500/20 bg-red-500/5 p-4">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">分析失败</p>
                <p className="text-xs text-muted-foreground">
                  {error}。请确保已配置 OPENAI_API_KEY 环境变量。
                </p>
              </div>
            </Card>
          )}

          {analysis && (
            <div className="animate-fade-in space-y-4">
              {/* Row 1: Intent + Stage */}
              <div className="grid grid-cols-2 gap-4">
                {/* Intent */}
                <Card className="border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      意图识别
                    </h3>
                  </div>
                  {intent && (
                    <>
                      <div className="mb-3 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-medium",
                            intentMap[intent.primary]?.color
                          )}
                        >
                          {intentMap[intent.primary]?.label}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          置信度 {intent.confidence}%
                        </span>
                      </div>
                      <p className="text-[12px] leading-relaxed text-muted-foreground">
                        {intent.reasoning}
                      </p>
                    </>
                  )}
                </Card>

                {/* Stage */}
                <Card className="border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      阶段判断
                    </h3>
                  </div>
                  {stage && (
                    <>
                      <div className="mb-3">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">
                            {stageMap[stage.current]?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center gap-1.5 flex-1">
                              <div
                                className={cn(
                                  "h-1.5 flex-1 rounded-full transition-all",
                                  stage.current === "at_risk"
                                    ? "bg-red-500/30"
                                    : step <= (stageMap[stage.current]?.step ?? 0)
                                    ? "bg-primary"
                                    : "bg-secondary"
                                )}
                              />
                              {step < 3 && <div className="h-1.5 w-1.5 rounded-full bg-secondary" />}
                            </div>
                          ))}
                        </div>
                        <div className="mt-1.5 flex justify-between text-[9px] text-muted-foreground">
                          <span>初步咨询</span>
                          <span>对比阶段</span>
                          <span>即将成交</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {stage.indicators.map((ind, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </Card>
              </div>

              {/* Row 2: Risk Assessment */}
              {risk && (
                <Card className="border-border bg-card/50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      风险评估
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn("ml-auto text-xs", riskLabelMap[risk.level])}
                    >
                      {risk.level === "low" && "低风险"}
                      {risk.level === "medium" && "中风险"}
                      {risk.level === "high" && "高风险"}
                      {risk.level === "critical" && "极高风险"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {risk.factors.map((f, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11px] text-muted-foreground"
                      >
                        <span className="h-1 w-1 rounded-full bg-amber-400" />
                        {f}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Row 3: Strategy + Suggested Reply */}
              <div className="grid grid-cols-2 gap-4">
                {/* Strategy */}
                {strategy && (
                  <Card className="border-border bg-card/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        策略建议
                      </h3>
                    </div>
                    <p className="mb-3 text-[12px] leading-relaxed text-muted-foreground">
                      {strategy.recommendation}
                    </p>
                    <div className="space-y-1.5">
                      {strategy.nextActions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-[12px] text-muted-foreground"
                        >
                          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>

                    {/* Escalation recommendation */}
                    <Separator className="my-3" />
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2",
                        strategy.shouldEscalate
                          ? "bg-amber-500/10"
                          : "bg-emerald-500/10"
                      )}
                    >
                      <UserCheck
                        className={cn(
                          "h-4 w-4",
                          strategy.shouldEscalate
                            ? "text-amber-400"
                            : "text-emerald-400"
                        )}
                      />
                      <span className="text-[12px] font-medium">
                        {strategy.shouldEscalate
                          ? strategy.escalateReason || "建议人工接管"
                          : "AI可独立处理，无需人工接管"}
                      </span>
                    </div>
                  </Card>
                )}

                {/* Suggested Reply */}
                {analysis?.suggestedReply && (
                  <Card className="border-border bg-card/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        推荐回复
                      </h3>
                      <button
                        onClick={handleCopyReply}
                        className="ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            复制
                          </>
                        )}
                      </button>
                    </div>
                    <div className="rounded-lg bg-secondary/50 p-3">
                      <p className="text-[13px] leading-relaxed text-foreground">
                        {analysis.suggestedReply}
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
