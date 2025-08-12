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
import { AlertCircle, Settings, Percent, Trophy, Download, Loader2, Plus, Trash2, Gift } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TopRoundConfig {
  atr_num_top: number;
  atr_percent: number;
}

export default function SettingRoundPage() {
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
  const [showWithdrawResults, setShowWithdrawResults] = useState(false);

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
      toast.success("Top round configuration updated successfully");
      refetchTopRound();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to update top round configuration";
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
      setShowWithdrawResults(true);
      if (data.success) {
        toast.success(`Withdrawal completed: ${data.success_count} successful, ${data.error_count || 0} errors`);
      }
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to process withdrawals";
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
      toast.error("Count top must be between 0 and 10");
      return;
    }

    if (countTop > 0) {
      // Check if all percentages are filled and valid
      for (const tr of topRounds) {
        if (tr.atr_percent < 1 || tr.atr_percent > 99) {
          toast.error(`Percentage for Top ${tr.atr_num_top} must be between 1 and 99`);
          return;
        }
      }

      // Check total percentage
      const totalPercent = topRounds.reduce((sum, tr) => sum + tr.atr_percent, 0);
      if (totalPercent > 100) {
        toast.error(`Total percentage (${totalPercent}%) cannot exceed 100%`);
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
        <h2 className="text-3xl font-bold tracking-tight">Setting Round</h2>
        <p className="text-muted-foreground">
          Configure top round percentages and manage airdrop withdrawals
        </p>
      </div>

      <Tabs defaultValue="top-round" className="w-full">
        <TabsList>
          <TabsTrigger value="top-round">Top Round Configuration</TabsTrigger>
          <TabsTrigger value="withdraw">Airdrop Withdraw</TabsTrigger>
        </TabsList>

        {/* Top Round Configuration Tab */}
        <TabsContent value="top-round" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <CardTitle>Top Round Configuration</CardTitle>
                  <CardDescription>
                    Set up percentage rewards for top positions (1-10)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Count Top Selection */}
              <div className="space-y-2">
                <Label htmlFor="count-top">Number of Top Positions</Label>
                <Select value={countTop.toString()} onValueChange={handleCountTopChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num === 0 ? "Clear All" : `${num} positions`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Top Rounds Configuration */}
              {countTop > 0 && (
                <div className="space-y-4">
                  <Label>Top Positions Percentage</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {topRounds.map((tr) => (
                      <div key={tr.atr_num_top} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Badge variant="outline" className="min-w-[60px]">
                          Top {tr.atr_num_top}
                        </Badge>
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="number"
                            min="1"
                            max="99"
                            value={tr.atr_percent || ""}
                            onChange={(e) => handlePercentChange(tr.atr_num_top, e.target.value)}
                            placeholder="Enter percentage"
                            className="w-32"
                          />
                          <Percent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total Percentage Display */}
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Total Percentage:</span>
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
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Total percentage cannot exceed 100%. Please adjust the values.
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <Settings className="mr-2 h-4 w-4" />
                        Save Configuration
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
                  <CardTitle>Airdrop Withdraw</CardTitle>
                  <CardDescription>
                    Process withdrawal for rewards with "can-withdraw" status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Notice</AlertTitle>
                <AlertDescription>
                  This will automatically send tokens from admin wallet to users with "can-withdraw" status.
                  Make sure the admin wallet has sufficient balance before proceeding.
                </AlertDescription>
              </Alert>

              {!isPartner && (
                <div className="flex justify-start">
                  <Dialog open={showWithdrawResults} onOpenChange={setShowWithdrawResults}>
                    <Button 
                      onClick={handleWithdraw} 
                      disabled={isWithdrawing}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                    >
                      {isWithdrawing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Process Withdrawals
                        </>
                      )}
                    </Button>

                    {/* Results Dialog */}
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Withdrawal Results</DialogTitle>
                        <DialogDescription>
                          Summary of the withdrawal processing
                        </DialogDescription>
                      </DialogHeader>
                      
                      {withdrawResults && (
                        <div className="space-y-4">
                          {/* Summary */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {withdrawResults.processed || 0}
                              </div>
                              <div className="text-sm text-blue-700">Total Processed</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {withdrawResults.success_count || 0}
                              </div>
                              <div className="text-sm text-green-700">Successful</div>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {withdrawResults.error_count || 0}
                              </div>
                              <div className="text-sm text-red-700">Errors</div>
                            </div>
                          </div>

                          {/* Detailed Results */}
                          {withdrawResults.results && withdrawResults.results.length > 0 && (
                            <div className="space-y-2">
                              <Label>Detailed Results</Label>
                              <div className="max-h-64 overflow-y-auto border rounded-lg">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Reward ID</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Details</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {withdrawResults.results.map((result: any, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell>{result.reward_id}</TableCell>
                                        <TableCell>
                                          <Badge 
                                            variant={result.status === "success" ? "default" : "destructive"}
                                          >
                                            {result.status}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                          {result.status === "success" 
                                            ? `${result.transaction_hash?.slice(0, 20)}... (${result.amount?.toLocaleString()})`
                                            : result.error
                                          }
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <DialogFooter>
                        <Button onClick={() => setShowWithdrawResults(false)}>
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
