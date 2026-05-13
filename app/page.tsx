"use client";

import { useState, useEffect, useMemo } from "react";
import { mockUsers, mockConversations } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Users, Target, Cpu, UserCheck, TrendingUp, TrendingDown,
  Sparkles, AlertTriangle, Lightbulb, Zap, ArrowUpRight, ArrowDownRight,
  BarChart3, Clock, MessageSquare, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { User, Conversation, AIAnalysis, UserStage, UserIntent, RiskLevel } from "@/types";

function TrendBadge({ value }: { value: number }) {
  const isUp = value > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isUp ? "text-emerald-400" : "text-red-400")}>
      {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(value)}%
    </span>
  );
}

const stageLabels: Record<string, string> = {
  initial_inquiry: "初步咨询", comparison: "对比阶段", closing: "即将成交", at_risk: "流失风险",
};
const intentLabels: Record<string, string> = {
  price_objection: "价格异议", hesitant: "犹豫", high_intent: "高意向", watching: "观望", unclear_need: "需求不明确",
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [importedUsers, setImportedUsers] = useState<User[]>([]);
  const [importedConversations, setImportedConversations] = useState<Record<string, Conversation>>({});
  const [savedAnalyses, setSavedAnalyses] = useState<Record<string, AIAnalysis>>({});

  useEffect(() => {
    if (!mounted) return;
    try {
      const u = localStorage.getItem("growth-agent-imported-users");
      const c = localStorage.getItem("growth-agent-imported-conversations");
      const a = localStorage.getItem("growth-agent-analysis");
      if (u) setImportedUsers(JSON.parse(u));
      if (c) setImportedConversations(JSON.parse(c));
      if (a) setSavedAnalyses(JSON.parse(a));
    } catch {}
  }, [mounted]);

  const allUsers = useMemo(() => [...mockUsers, ...importedUsers], [importedUsers]);

  // --- Derived metrics from real data ---

  // Count AI-processed messages
  const totalMessages = useMemo(() => {
    let count = 0;
    let aiReplies = 0;
    const allConvs = { ...mockConversations };
    Object.assign(allConvs, importedConversations);
    for (const conv of Object.values(allConvs)) {
      for (const msg of conv.messages) {
        count++;
        if (msg.role === "assistant") aiReplies++;
      }
    }
    return { total: count, aiReplies };
  }, [importedConversations]);

  // Users by stage
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { initial_inquiry: 0, comparison: 0, closing: 0, at_risk: 0 };
    for (const user of allUsers) {
      counts[user.stage] = (counts[user.stage] || 0) + 1;
    }
    return counts;
  }, [allUsers]);

  // Users by intent
  const highIntentUsers = useMemo(() => allUsers.filter(u => u.intent === "high_intent"), [allUsers]);

  // Users needing escalation (from saved analyses)
  const escalatedCount = useMemo(() => {
    return Object.values(savedAnalyses).filter(a => a?.strategy?.shouldEscalate).length;
  }, [savedAnalyses]);

  // Predicted conversions (closing stage + high probability)
  const predictedUsers = useMemo(() =>
    allUsers.filter(u => u.stage === "closing" && u.probability >= 60),
  [allUsers]);

  // AI processing rate
  const aiRate = totalMessages.total > 0 ? Math.round((totalMessages.aiReplies / totalMessages.total) * 100) : 0;

  // Human takeover rate
  const takeoverRate = allUsers.length > 0 ? Math.round((escalatedCount / allUsers.length) * 100) : 0;

  // Recent activity from conversation timestamps
  const recentActivity = useMemo(() => {
    const events: { time: string; user: string; userId: string; action: string; type: string }[] = [];
    const allConvs = { ...mockConversations };
    Object.assign(allConvs, importedConversations);

    for (const [uid, conv] of Object.entries(allConvs)) {
      const user = allUsers.find(u => u.id === uid);
      if (!user) continue;
      const lastMsg = conv.messages[conv.messages.length - 1];
      if (lastMsg) {
        const roleLabel = lastMsg.role === "user" ? "发来消息" : "AI 已回复";
        const preview = lastMsg.content.length > 30 ? lastMsg.content.slice(0, 30) + "…" : lastMsg.content;
        events.push({
          time: lastMsg.timestamp.slice(11, 16),
          user: user.name,
          userId: user.id,
          action: `${roleLabel}：${preview}`,
          type: lastMsg.role === "user" ? "info" : "success",
        });
      }
    }
    return events.sort((a, b) => b.time.localeCompare(a.time));
  }, [allUsers, importedConversations]);

  // AI insights from analyses
  const aiInsights = useMemo(() => {
    const insights: { id: string; type: string; title: string; description: string; userId?: string; priority: string }[] = [];

    for (const [uid, analysis] of Object.entries(savedAnalyses)) {
      if (!analysis) continue;
      const user = allUsers.find(u => u.id === uid);
      if (!user) continue;

      if (analysis.strategy?.shouldEscalate) {
        insights.push({
          id: `ai-${uid}-esc`,
          type: "warning",
          title: `${user.name} 建议人工接管`,
          description: analysis.strategy.escalateReason || "AI 分析建议由销售介入处理",
          userId: uid,
          priority: "high",
        });
      }
      if (analysis.risk?.level === "high" || analysis.risk?.level === "critical") {
        insights.push({
          id: `ai-${uid}-risk`,
          type: "warning",
          title: `${user.name} ${analysis.risk.level === "critical" ? "极高" : "高"}风险`,
          description: (analysis.risk.factors || []).join("；") || "存在流失风险",
          userId: uid,
          priority: "high",
        });
      }
    }

    // Fallback: derive from user states if no analyses
    if (insights.length === 0) {
      for (const user of allUsers) {
        if (user.stage === "at_risk") {
          insights.push({
            id: `ur-${user.id}`,
            type: "alert",
            title: `${user.name}(${user.company}) 处于流失风险`,
            description: `最近意图：${intentLabels[user.intent]}，成交概率 ${user.probability}%`,
            userId: user.id,
            priority: "high",
          });
        }
      }
      const closingUsers = allUsers.filter(u => u.stage === "closing" && u.probability >= 80);
      for (const user of closingUsers) {
        insights.push({
          id: `uc-${user.id}`,
          type: "opportunity",
          title: `${user.name}(${user.company}) 即将成交`,
          description: `成交概率 ${user.probability}%，建议优先跟进`,
          userId: user.id,
          priority: "high",
        });
      }
      const comparisonUsers = allUsers.filter(u => u.stage === "comparison");
      for (const user of comparisonUsers) {
        insights.push({
          id: `ucp-${user.id}`,
          type: "suggestion",
          title: `${user.name} 正在对比竞品`,
          description: `建议发送行业案例或安排 Demo 演示`,
          userId: user.id,
          priority: "medium",
        });
      }
    }

    return insights;
  }, [savedAnalyses, allUsers]);

  const priorityMap = {
    high: { label: "高", className: "text-red-400 bg-red-500/15" },
    medium: { label: "中", className: "text-amber-400 bg-amber-500/15" },
    low: { label: "低", className: "text-muted-foreground bg-secondary" },
  };

  if (!mounted) {
    return <div className="mx-auto max-w-[1280px] p-6"><div className="animate-pulse space-y-6"><div className="h-8 w-48 rounded-lg bg-secondary" /><div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-32 rounded-xl bg-secondary" />)}</div></div></div>;
  }

  return (
    <div className="mx-auto max-w-[1280px] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">今日概览</h1>
            <p className="text-xs text-muted-foreground">
              共 {allUsers.length} 位客户 · {totalMessages.total} 条对话 · AI 处理率 {aiRate}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          实时数据
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-4 gap-4">
        {[
          { label: "客户总数", value: allUsers.length.toString(), sub: `${importedUsers.length > 0 ? `含 ${importedUsers.length} 导入` : "5 位活跃"}`, icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { label: "高意向客户", value: highIntentUsers.length.toString(), sub: `${predictedUsers.length} 位即将成交`, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "AI 处理率", value: aiRate + "%", sub: `${totalMessages.aiReplies} 条 AI 回复`, icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "需人工接管", value: escalatedCount.toString(), sub: `占比 ${takeoverRate}%`, icon: UserCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="group border-border bg-card/50 transition-all hover:bg-card/70 hover:border-primary/20">
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl transition-all group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.sub}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Prediction + Funnel + Insights */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {/* Prediction */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">成交预测</h3>
              <span className="ml-auto text-xs text-muted-foreground">基于用户阶段+概率</span>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold tracking-tight text-foreground">{predictedUsers.length}</span>
              <div className="flex flex-col pb-1">
                <span className="text-xs text-muted-foreground">高概率成交</span>
                <span className="text-xs font-medium text-emerald-400">阶段：即将成交 + 概率≥60%</span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              {predictedUsers.length > 0 ? predictedUsers.map(u => (
                <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm transition-all hover:bg-accent">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px]">{u.avatar}</AvatarFallback></Avatar>
                  <span className="font-medium text-foreground">{u.name}</span>
                  <span className="text-muted-foreground">· {u.company}</span>
                  <span className="ml-auto font-semibold text-emerald-400">{u.probability}%</span>
                </Link>
              )) : (
                <p className="text-sm text-muted-foreground py-2">暂无高概率成交客户</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">用户阶段分布</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "初步咨询", key: "initial_inquiry", color: "bg-blue-400" },
                { label: "对比阶段", key: "comparison", color: "bg-primary" },
                { label: "即将成交", key: "closing", color: "bg-emerald-400" },
                { label: "流失风险", key: "at_risk", color: "bg-red-400" },
              ].map((s) => (
                <div key={s.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-mono font-semibold text-foreground">{stageCounts[s.key] || 0}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", s.color)}
                      style={{ width: `${allUsers.length > 0 ? ((stageCounts[s.key] || 0) / allUsers.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI 销售建议</h3>
              <Badge variant="outline" className="ml-auto text-[11px] bg-primary/10 text-primary border-primary/20">{aiInsights.length} 条</Badge>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {aiInsights.map((insight, idx) => {
                  const p = priorityMap[insight.type === "alert" || insight.type === "warning" ? "high" : insight.type === "opportunity" ? "medium" : "low"] || priorityMap.low;
                  return (
                    <div key={insight.id} className={cn("rounded-xl border border-border p-4 transition-all hover:bg-accent/30",
                      (insight.type === "warning" || insight.type === "alert") ? "border-l-amber-500/50"
                      : insight.type === "opportunity" ? "border-l-emerald-500/50"
                      : "border-l-primary/50"
                    )}>
                      <div className="mb-2 flex items-center gap-2">
                        {insight.type === "warning" || insight.type === "alert" ? <AlertTriangle className="h-4 w-4 text-amber-400" />
                        : insight.type === "opportunity" ? <Zap className="h-4 w-4 text-emerald-400" />
                        : <Lightbulb className="h-4 w-4 text-primary" />}
                        <span className="text-sm font-medium text-foreground">{insight.title}</span>
                        <Badge variant="outline" className={cn("ml-auto text-[10px]", p.className)}>{p.label}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
                      {insight.userId && (
                        <Link href={`/profile/${insight.userId}`} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                          查看画像 <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Active Users + Recent Activity */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Users */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">全部客户</h3>
              <span className="ml-auto text-xs text-muted-foreground">{allUsers.length} 位</span>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="space-y-1">
                {allUsers.map((user, idx) => (
                  <Link key={user.id} href={`/profile/${user.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-accent"
                  >
                    <span className="w-5 text-center text-xs font-mono text-muted-foreground">{idx + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={cn("text-xs font-medium",
                        user.source === "文件导入" ? "bg-cyan-500/20 text-cyan-400" : "bg-primary/15 text-primary"
                      )}>{user.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        {user.source === "文件导入" && (
                          <span className="shrink-0 rounded bg-cyan-500/15 px-1 text-[9px] text-cyan-400">导入</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.company} · {user.title}</p>
                    </div>
                    <Badge variant="outline" className={cn("text-[11px] shrink-0",
                      user.probability >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : user.probability >= 50 ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-secondary text-muted-foreground"
                    )}>{user.probability}%</Badge>
                    <Badge variant="outline" className={cn("text-[10px] shrink-0",
                      user.stage === "closing" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : user.stage === "at_risk" ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : "bg-secondary text-muted-foreground"
                    )}>{stageLabels[user.stage]}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">最新动态</h3>
              <span className="ml-auto text-xs text-muted-foreground">{recentActivity.length} 条</span>
            </div>
            <ScrollArea className="h-[280px]">
              <div>
                {recentActivity.slice(0, 10).map((event, i) => (
                  <Link key={i} href={`/profile/${event.userId}`} className="flex gap-3 py-2.5 hover:bg-accent/30 rounded-lg px-2 -mx-2 transition-all">
                    <div className="flex flex-col items-center">
                      <div className={cn("h-2 w-2 rounded-full mt-1.5",
                        event.type === "success" ? "bg-emerald-400" : "bg-primary"
                      )} />
                      {i < recentActivity.slice(0, 10).length - 1 && <div className="mt-1 h-full w-px bg-border" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{event.user}</span>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{event.action}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
