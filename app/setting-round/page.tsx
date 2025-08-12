"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTopRound, setTopRound, airdropWithdraw } from "@/services/api/TopRoundService";
import { toast } from "sonner";
import { getMyInfor } from "@/services/api/UserAdminService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Settings, Percent, Trophy, Download, Loader2, Gift } from "lucide-react";
import { useLang } from "@/lang/useLang";


interface TopRoundConfig {
  atr_num_top: number;
  atr_percent: number;
}

export default function SettingRoundPage() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  
  const { data: myInfor } = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });

  const { data: topRoundData, isLoading, refetch: refetchTopRound } = useQuery({
    queryKey: ["top-round"],
    queryFn: getTopRound,
  });

  // Check if user is partner (hide certain features)
  const isPartner = myInfor?.role === "partner";

  // State for Top Round Configuration
  const [countTop, setCountTop] = useState<number>(0);
  const [topRounds, setTopRounds] = useState<TopRoundConfig[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // State for Withdraw process
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawResults, setWithdrawResults] = useState<any>(null);

  // Initialize form data when API data loads
  useEffect(() => {
    if (topRoundData?.success && topRoundData?.data) {
      const { count_top, top_rounds } = topRoundData.data;
      setCountTop(count_top || 0);
      setTopRounds(top_rounds || []);
    }
  }, [topRoundData]);

  // Update Top Round Configuration
  const updateTopRoundMutation = useMutation({
    mutationFn: setTopRound,
          onSuccess: () => {
        toast.success(t("settingRound.topRound.messages.saveSuccess"));
        refetchTopRound();
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || t("settingRound.topRound.messages.saveError");
        toast.error(message);
      },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // Airdrop Withdraw
  const withdrawMutation = useMutation({
    mutationFn: airdropWithdraw,
    onSuccess: (data) => {
      setWithdrawResults(data);
      if (data.success) {
        if (data.processed === 0) {
          toast.info(t("settingRound.withdraw.messages.noRewards"));
        } else {
          toast.success(t("settingRound.withdraw.messages.completed", { 
            success: data.success_count || 0, 
            errors: data.error_count || 0 
          }));
        }
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || t("settingRound.withdraw.messages.failed");
      toast.error(message);
    },
    onSettled: () => {
      setIsWithdrawing(false);
    },
  });

  // Handle count_top change
  const handleCountTopChange = (value: string) => {
    const count = parseInt(value);
    setCountTop(count);
    
    if (count === 0) {
      setTopRounds([]);
    } else {
      // Create array with default values
      const newTopRounds: TopRoundConfig[] = [];
      for (let i = 1; i <= count; i++) {
        const existing = topRounds.find(tr => tr.atr_num_top === i);
        newTopRounds.push({
          atr_num_top: i,
          atr_percent: existing?.atr_percent || 0
        });
      }
      setTopRounds(newTopRounds);
    }
  };

  // Handle percentage change for a specific top position
  const handlePercentChange = (topNumber: number, percent: string) => {
    const percentValue = parseInt(percent) || 0;
    setTopRounds(prev => 
      prev.map(tr => 
        tr.atr_num_top === topNumber 
          ? { ...tr, atr_percent: percentValue }
          : tr
      )
    );
  };

  // Validate and save configuration
  const handleSaveConfiguration = () => {
    // Validation
    if (countTop < 0 || countTop > 10) {
      toast.error(t("settingRound.topRound.validation.countTopRange"));
      return;
    }

    if (countTop > 0) {
      // Check if all percentages are filled and valid
      for (const tr of topRounds) {
        if (tr.atr_percent < 1 || tr.atr_percent > 99) {
          toast.error(t("settingRound.topRound.validation.percentRange", { position: tr.atr_num_top }));
          return;
        }
      }

      // Check total percentage
      const totalPercent = topRounds.reduce((sum, tr) => sum + tr.atr_percent, 0);
      if (totalPercent > 100) {
        toast.error(t("settingRound.topRound.validation.totalExceed"));
        return;
      }
    }

    setIsUpdating(true);
    const data = {
      count_top: countTop,
      ...(countTop > 0 && { top_rounds: topRounds })
    };
    updateTopRoundMutation.mutate(data);
  };

  // Handle withdraw process
  const handleWithdraw = () => {
    setIsWithdrawing(true);
    withdrawMutation.mutate();
  };

  // Calculate total percentage
  const totalPercent = topRounds.reduce((sum, tr) => sum + tr.atr_percent, 0);

  return (
    <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight">{t("settingRound.title")}</h2>
          <p className="text-muted-foreground">
            {t("settingRound.description")}
          </p>
        </div>

      <Tabs defaultValue="top-round" className="w-full">
                  <TabsList>
            <TabsTrigger value="top-round">{t("settingRound.tabs.topRound")}</TabsTrigger>
            <TabsTrigger value="withdraw">{t("settingRound.tabs.withdraw")}</TabsTrigger>
          </TabsList>

        {/* Top Round Configuration Tab */}
        <TabsContent value="top-round" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                                  <Trophy className="h-5 w-5 text-amber-500" />
                  <div>
                    <CardTitle>{t("settingRound.topRound.title")}</CardTitle>
                    <CardDescription>
                      {t("settingRound.topRound.description")}
                    </CardDescription>
                  </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
                              {/* Count Top Selection */}
                <div className="space-y-2">
                  <Label htmlFor="count-top">{t("settingRound.topRound.countTopLabel")}</Label>
                  <Select value={countTop.toString()} onValueChange={handleCountTopChange}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t("settingRound.placeholders.selectCount")} />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num === 0 ? t("settingRound.topRound.clearAll") : `${num} ${t("settingRound.topRound.positions")}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              {/* Top Rounds Configuration */}
              {countTop > 0 && (
                <div className="space-y-4">
                  <Label>{t("settingRound.topRound.percentageLabel")}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topRounds.map((tr) => (
                      <div key={tr.atr_num_top} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Badge variant="outline" className="min-w-[60px]">
                          {t("settingRound.topRound.top")} {tr.atr_num_top}
                        </Badge>
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="number"
                            min="1"
                            max="99"
                            value={tr.atr_percent || ""}
                            onChange={(e) => handlePercentChange(tr.atr_num_top, e.target.value)}
                            placeholder={t("settingRound.topRound.enterPercentage")}
                            className="w-32"
                          />
                          <Percent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Percentage Display */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{t("settingRound.topRound.totalPercentage")}</span>
                    <Badge 
                      variant={totalPercent > 100 ? "destructive" : totalPercent === 100 ? "default" : "secondary"}
                      className="text-sm"
                    >
                      {totalPercent}%
                    </Badge>
                  </div>

                  {totalPercent > 100 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>{t("settingRound.topRound.validation.warningTitle")}</AlertTitle>
                      <AlertDescription>
                        {t("settingRound.topRound.validation.warningDescription")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Save Button */}
              {!isPartner && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveConfiguration} 
                    disabled={isUpdating || (countTop > 0 && totalPercent > 100)}
                    className="min-w-[120px]"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("settingRound.topRound.saving")}
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 h-4 w-4" />
                        {t("settingRound.topRound.saveButton")}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Airdrop Withdraw Tab */}
        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-emerald-500" />
                <div>
                  <CardTitle>{t("settingRound.withdraw.title")}</CardTitle>
                  <CardDescription>
                    {t("settingRound.withdraw.description")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("settingRound.withdraw.noticeTitle")}</AlertTitle>
                <AlertDescription>
                  {t("settingRound.withdraw.noticeDescription")}
                </AlertDescription>
              </Alert>

              {!isPartner && (
                <div className="flex justify-start">
                  <Button 
                    onClick={handleWithdraw} 
                    disabled={isWithdrawing}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                  >
                    {isWithdrawing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("settingRound.withdraw.processing")}
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        {t("settingRound.withdraw.processButton")}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
