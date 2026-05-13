"use client";

import { mockDashboardMetrics, mockConversionFunnel, mockInsights, mockUsers } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Users,
  Target,
  Cpu,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Clock,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

function TrendBadge({ value }: { value: number }) {
  const isUp = value > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isUp ? "text-emerald-400" : "text-red-400")}>
      {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {Math.abs(value)}%
    </span>
  );
}

const insightIcons = { warning: AlertTriangle, opportunity: Zap, suggestion: Lightbulb, alert: AlertTriangle };

const insightBorderColors = {
  warning: "border-l-amber-500/50",
  opportunity: "border-l-emerald-500/50",
  suggestion: "border-l-primary/50",
  alert: "border-l-red-500/50",
};

const priorityMap = {
  high: { label: "高", className: "text-red-400 bg-red-500/15" },
  medium: { label: "中", className: "text-amber-400 bg-amber-500/15" },
  low: { label: "低", className: "text-muted-foreground bg-secondary" },
};

const stageLabels: Record<string, string> = {
  initial_inquiry: "初步咨询",
  comparison: "对比阶段",
  closing: "即将成交",
  at_risk: "流失风险",
};

export default function DashboardPage() {
  const m = mockDashboardMetrics;
  const funnel = mockConversionFunnel;
  const maxFunnel = funnel.leads;

  const kpiCards = [
    { label: "今日新增用户", value: m.newUsersToday.toLocaleString(), trend: m.newUsersTrend, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "高意向客户", value: m.highIntentCount.toString(), trend: m.highIntentTrend, icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "AI 处理率", value: m.aiProcessingRate + "%", trend: m.aiProcessingTrend, icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "人工接管率", value: m.humanTakeoverRate + "%", trend: m.humanTakeoverTrend, icon: UserCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  const funnelStages = [
    { label: "线索", value: funnel.leads, pct: 100, color: "bg-primary" },
    { label: "初步咨询", value: funnel.inquiries, pct: (funnel.inquiries / maxFunnel) * 100, color: "bg-blue-400" },
    { label: "意向确认", value: funnel.intentConfirmed, pct: (funnel.intentConfirmed / maxFunnel) * 100, color: "bg-emerald-400" },
    { label: "已签约", value: funnel.signed, pct: (funnel.signed / maxFunnel) * 100, color: "bg-emerald-500" },
  ];

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
            <p className="text-xs text-muted-foreground">AI 驱动的销售运营数据看板</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          实时数据 · 更新于 {new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-4 gap-4">
        {kpiCards.map((stat, i) => (
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
                <TrendBadge value={stat.trend} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Three panels */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {/* Prediction */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">今日转化预测</h3>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-5xl font-bold tracking-tight text-foreground">{m.predictedConversions}</span>
              <div className="flex flex-col pb-1">
                <span className="text-xs text-muted-foreground">预计成交</span>
                <TrendBadge value={m.predictedConversionsTrend} />
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-secondary/50 p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                AI 模型预测今日有 <span className="font-semibold text-foreground">{m.predictedConversions} 笔</span> 订单可能成交。其中李雪梅（云帆科技）成交概率达 92%。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Funnel */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">转化漏斗</h3>
              <span className="ml-auto text-xs text-muted-foreground">本月</span>
            </div>
            <div className="space-y-4">
              {funnelStages.map((stage, idx) => (
                <div key={idx}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stage.label}</span>
                    <span className="font-mono font-semibold text-foreground">{stage.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", stage.color)} style={{ width: `${stage.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
              <span>整体转化率</span>
              <span className="font-mono font-semibold text-emerald-400">{((funnel.signed / funnel.leads) * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI 销售建议</h3>
              <Badge variant="outline" className="ml-auto text-[11px] bg-primary/10 text-primary border-primary/20">{mockInsights.length} 条</Badge>
            </div>
            <ScrollArea className="h-[280px]">
              <div className="space-y-3">
                {mockInsights.map((insight) => {
                  const Icon = insightIcons[insight.type];
                  const p = priorityMap[insight.priority];
                  return (
                    <div key={insight.id} className={cn("rounded-xl border border-border p-4 transition-all hover:bg-accent/30", insightBorderColors[insight.type])}>
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className={cn("h-4 w-4 shrink-0",
                          insight.type === "warning" || insight.type === "alert" ? "text-amber-400"
                          : insight.type === "opportunity" ? "text-emerald-400"
                          : "text-primary"
                        )} />
                        <span className="text-sm font-medium text-foreground">{insight.title}</span>
                        <Badge variant="outline" className={cn("ml-auto text-[10px]", p.className)}>{p.label}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{insight.description}</p>
                      {insight.relatedUserId && (
                        <Link href={`/profile/${insight.relatedUserId}`} className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline">
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

      {/* Row 3: Recent Active Users */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Users Table */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">活跃客户</h3>
              <span className="ml-auto text-xs text-muted-foreground">最近活动</span>
            </div>
            <div className="space-y-1">
              {mockUsers.map((user, idx) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-accent"
                >
                  <span className="w-5 text-center text-xs font-mono text-muted-foreground">{idx + 1}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/15 text-primary font-medium">{user.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.company} · {user.title}</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[11px] shrink-0",
                    user.probability >= 80 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : user.probability >= 50 ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-secondary text-muted-foreground"
                  )}>
                    {user.probability}%
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-16 justify-end">
                    <Clock className="h-3 w-3" />
                    {user.lastActive.slice(11, 16)}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card className="border-border bg-card/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">今日动态</h3>
            </div>
            <ScrollArea className="h-[260px]">
              <div className="space-y-0">
                {[
                  { time: "10:23", user: "陈建国", action: "再次提及预算问题，存在流失风险", type: "warning" },
                  { time: "09:45", user: "李雪梅", action: "主动提出本周签约", type: "success" },
                  { time: "09:30", user: "赵敏", action: "仍在对比竞品，需发送安全资质", type: "info" },
                  { time: "08:15", user: "张伟", action: "首次咨询（个人用户，不匹配目标客群）", type: "muted" },
                  { time: "昨日 16:30", user: "王磊", action: "表示在对比中，近3天无互动", type: "warning" },
                  { time: "昨日 15:50", user: "陈建国", action: "打开制造业案例 PDF", type: "info" },
                  { time: "昨日 14:40", user: "李雪梅", action: "下载 API 对接白皮书", type: "info" },
                ].map((event, i) => (
                  <div key={i} className="flex gap-3 py-2.5">
                    <div className="flex flex-col items-center">
                      <div className={cn("h-2 w-2 rounded-full mt-1.5",
                        event.type === "warning" ? "bg-amber-400"
                        : event.type === "success" ? "bg-emerald-400"
                        : event.type === "info" ? "bg-primary"
                        : "bg-secondary"
                      )} />
                      {i < 6 && <div className="mt-1 h-full w-px bg-border" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{event.user}</span>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
