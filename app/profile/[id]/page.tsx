"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mockUserProfiles, mockUsers } from "@/lib/mock";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  UserCircle,
  Building2,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Brain,
  Clock,
  ArrowRight,
  MessageSquare,
  MousePointerClick,
  FileText,
  PhoneCall,
  Eye,
  TrendingUp,
} from "lucide-react";
import type { RiskLevel, UserStage, UserIntent, BehaviorEvent, User, UserProfile } from "@/types";

const riskMap: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: "低风险", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  medium: { label: "中风险", color: "text-amber-400", bg: "bg-amber-500/10" },
  high: { label: "高风险", color: "text-orange-400", bg: "bg-orange-500/10" },
  critical: { label: "极高风险", color: "text-red-400", bg: "bg-red-500/10" },
};

const stageMap: Record<UserStage, string> = {
  initial_inquiry: "初步咨询",
  comparison: "对比阶段",
  closing: "即将成交",
  at_risk: "流失风险",
};

const intentMap: Record<UserIntent, string> = {
  price_objection: "价格异议",
  hesitant: "犹豫",
  high_intent: "高意向",
  watching: "观望",
  unclear_need: "需求不明确",
};

const behaviorIcons: Record<BehaviorEvent["type"], string> = {
  chat: "MessageSquare",
  visit: "Eye",
  click: "MousePointerClick",
  form: "FileText",
  call: "PhoneCall",
};

const tagColors: Record<string, string> = {
  intent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  behavior: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  demographic: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  risk: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  value: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function ProbabilityRing({ value }: { value: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    value >= 80
      ? "stroke-emerald-400"
      : value >= 50
      ? "stroke-primary"
      : value >= 30
      ? "stroke-amber-400"
      : "stroke-red-400";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary" />
        <circle cx="44" cy="44" r={radius} fill="none" strokeWidth="6" strokeLinecap="round" className={cn("transition-all duration-1000", color)} strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 44 44)" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold text-foreground">{value}%</span>
        <span className="text-[9px] text-muted-foreground">成交概率</span>
      </div>
    </div>
  );
}

function buildProfileFromUser(user: User): UserProfile {
  return {
    ...user,
    email: "",
    phone: "",
    createdAt: new Date().toISOString().slice(0, 10),
    totalInteractions: 0,
    avgResponseTime: "",
    behaviorTimeline: [],
    aiSummary: "这是通过文件导入的客户，尚无详细画像数据。建议通过AI销售分析页对其进行分析后，系统将自动补充画像。",
    followStrategy: {
      priority: "normal",
      actions: [{ action: "建议通过AI销售分析了解该用户意向", channel: "phone", timing: "今天内" }],
    },
  };
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [importedUsers, setImportedUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("growth-agent-imported-users");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const allUsers = useMemo(() => [...mockUsers, ...importedUsers], [importedUsers]);

  const profile = useMemo(() => {
    const existing = mockUserProfiles[id];
    if (existing) return existing;
    const imported = allUsers.find(u => u.id === id);
    if (imported) return buildProfileFromUser(imported);
    return mockUserProfiles["u1"];
  }, [id, allUsers]);

  if (!profile) {
    return <div className="flex h-full items-center justify-center"><p className="text-muted-foreground">用户不存在</p></div>;
  }

  const risk = riskMap[profile.riskLevel];
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    MessageSquare, Eye, MousePointerClick, FileText, PhoneCall,
  };

  return (
    <div className="mx-auto max-w-[960px] p-6">
      {/* Header with user selector */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircle className="h-4 w-4 text-primary" />
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">用户画像</h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {allUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => router.push(`/profile/${user.id}`)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all",
                id === user.id
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
                <span className="flex h-3.5 items-center rounded bg-cyan-500/15 px-1 text-[8px] text-cyan-400">导入</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <Card className="mb-5 border-border bg-card/50">
        <CardContent className="p-5">
          <div className="flex items-start gap-5">
            <Avatar className="h-14 w-14 ring-2 ring-border">
              <AvatarFallback className="bg-primary/15 text-lg font-semibold text-primary">{profile.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2.5">
                <h1 className="text-lg font-semibold text-foreground">{profile.name}</h1>
                <Badge variant="outline" className={cn("text-[11px]", risk.bg, risk.color)}>{risk.label}</Badge>
                <Badge variant="outline" className="bg-primary/10 text-[11px] text-primary border-primary/20">{stageMap[profile.stage]}</Badge>
              </div>
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{profile.company}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{profile.title}</span>
                <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{profile.industry}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{profile.email}</span>
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{profile.phone}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {profile.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className={cn("text-[11px]", tagColors[tag.type])}>{tag.label}</Badge>
                ))}
              </div>
            </div>
            <ProbabilityRing value={profile.probability} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-5">
          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI 用户洞察</h3>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{profile.aiSummary}</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">互动数据</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "总互动次数", value: profile.totalInteractions, icon: MessageSquare },
                  { label: "平均响应", value: profile.avgResponseTime, icon: Clock },
                  { label: "意向分类", value: intentMap[profile.intent], icon: TrendingUp },
                  { label: "来源渠道", value: profile.source, icon: Globe },
                ].map((stat, i) => (
                  <div key={i} className="rounded-lg bg-secondary/50 p-3">
                    <div className="mb-1 flex items-center gap-1.5">
                      <stat.icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{stat.value || "--"}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">行为时间线</h3>
              </div>
              <ScrollArea className="h-[240px]">
                <div>
                  {profile.behaviorTimeline.length > 0 ? (
                    profile.behaviorTimeline.map((event) => {
                      const Icon = iconMap[behaviorIcons[event.type]];
                      return (
                        <div key={event.id} className="flex gap-3 pb-3">
                          <div className="flex flex-col items-center">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                              <Icon className="h-3 w-3 text-primary" />
                            </div>
                            <div className="mt-0.5 h-full w-px bg-border" />
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-[12px] text-foreground">{event.description}</p>
                            <p className="text-[10px] text-muted-foreground">{event.timestamp.slice(5, 16).replace("T", " ")}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[12px] text-muted-foreground py-4 text-center">暂无行为数据，建议先进行AI销售分析</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">跟进策略</h3>
                <Badge variant="outline" className={cn("ml-auto text-[10px]",
                  profile.followStrategy.priority === "urgent" ? "bg-red-500/10 text-red-400 border-red-500/20"
                  : profile.followStrategy.priority === "high" ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                  : "bg-secondary text-muted-foreground"
                )}>
                  {profile.followStrategy.priority === "urgent" ? "紧急" : profile.followStrategy.priority === "high" ? "高优先级" : profile.followStrategy.priority === "normal" ? "常规" : "低优先级"}
                </Badge>
              </div>
              <div className="space-y-2.5">
                {profile.followStrategy.actions.map((action, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-lg bg-secondary/50 p-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-[12px] font-medium text-foreground">{action.action}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground">
                          {action.channel === "phone" ? "电话" : action.channel === "wechat" ? "微信" : action.channel === "email" ? "邮件" : "短信"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{action.timing}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
