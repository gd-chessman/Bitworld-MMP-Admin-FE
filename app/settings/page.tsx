"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getSetting } from "@/services/api/SettingService";
import { SettingService } from "@/services/api";
import { toast } from "sonner";
import { getMyInfor } from "@/services/api/UserAdminService";
import { useLang } from "@/lang/useLang";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { getReferentSettings, updatReferentSettings } from "@/services/api/ReferentSettings"
import { getReferentLevelRewards, updateReferentLevelRewards } from "@/services/api/ReferentLevelRewards"

// Thêm interface cho ReferralLevel
interface ReferralLevel {
  level: number;
  percentage: number;
}

export default function SettingsPage() {
  const { t } = useLang();
  const { data: setting, isLoading, refetch: refetchSetting } = useQuery({
    queryKey: ["setting"],
    queryFn: getSetting,
  });

  const { data: myInfor} = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async () => {
    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      console.warn("Please fill in all password fields");
      toast.error(t("settings.errors.fillAllFields"));
      return;
    }

    if (passwords.currentPassword.length < 4) {
      console.warn("Current password must be at least 4 characters long");
      toast.error(t("settings.errors.currentPasswordLength"));
      return;
    }

    if (passwords.newPassword.length < 4) {
      console.warn("New password must be at least 4 characters long");
      toast.error(t("settings.errors.newPasswordLength"));
      return;
    }

    if (passwords.confirmPassword.length < 4) {
      console.warn("Confirm password must be at least 4 characters long");
      toast.error(t("settings.errors.confirmPasswordLength"));
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      console.warn("New password and confirmation do not match");
      toast.error(t("settings.errors.passwordsNotMatch"));
      return;
    }

    try {
      await SettingService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      console.log("Password changed successfully");
      toast.success(t("settings.success.passwordChanged"));
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      if( error.status === 401) {
        toast.error(t("settings.errors.currentPasswordIncorrect"));
      } else {
        toast.error(t("settings.errors.changePasswordFailed"));
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
        <p className="text-muted-foreground">
          {t("settings.description")}
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="profile">{t("settings.tabs.profile")}</TabsTrigger>
          <TabsTrigger value="referral">{t("settings.tabs.referral")}</TabsTrigger>
          <TabsTrigger value="security">{t("settings.tabs.security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t("settings.profile.title")}</CardTitle>
              <CardDescription>
                {t("settings.profile.description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col items-center">
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="username">{t("settings.profile.username")}</Label>
                <Input
                  id="username"
                  value={myInfor?.username || ''}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="email">{t("settings.profile.email")}</Label>
                <Input
                  id="email"
                  value={myInfor?.email || ''}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="role">{t("settings.profile.role")}</Label>
                <Input
                  id="role"
                  value={myInfor?.role || ''}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="created-at">{t("settings.profile.accountCreated")}</Label>
                <Input
                  id="created-at"
                  value={myInfor?.createdAt ? formatDate(myInfor.createdAt) : 'N/A'}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
              
              <div className="space-y-2 w-full max-w-lg">
                <Label htmlFor="updated-at">{t("settings.profile.lastUpdated")}</Label>
                <Input
                  id="updated-at"
                  value={myInfor?.updatedAt ? formatDate(myInfor.updatedAt) : 'N/A'}
                  disabled
                  className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral" className="space-y-4">
          <ReferralSettingsTab />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>{t("settings.security.title")}</CardTitle>
              <CardDescription>{t("settings.security.description")}</CardDescription>
            </CardHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePasswordChange();
              }}
            >
              <CardContent className="space-y-4 flex flex-col items-center">
                <div className="space-y-2 w-full max-w-lg">
                  <Label htmlFor="current-password">{t("settings.security.currentPassword")}</Label>
                  <Input
                    id="current-password"
                    type="password"
                    required
                    value={passwords.currentPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                  />
                </div>
                <div className="space-y-2 w-full max-w-lg">
                  <Label htmlFor="new-password">{t("settings.security.newPassword")}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    required
                    value={passwords.newPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                  />
                </div>
                <div className="space-y-2 w-full max-w-lg">
                  <Label htmlFor="confirm-password">{t("settings.security.confirmPassword")}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                      setPasswords((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="bg-slate-600/30 border-slate-500/50 text-slate-100"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit">{t("settings.security.saveChanges")}</Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReferralSettingsTab() {
  const { t } = useLang()
  const { data: referentSettings, refetch: refetchReferentSettings } = useQuery({
    queryKey: ["referent-settings"],
    queryFn: getReferentSettings,
  })
  const { data: referentLevelRewards, refetch: refetchReferentLevelRewards } = useQuery({
    queryKey: ["referent-level-rewards"],
    queryFn: getReferentLevelRewards,
  })
  const [maxLevel, setMaxLevel] = useState<number>(0)
  const [levels, setLevels] = useState<ReferralLevel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (referentSettings?.rs_ref_level) setMaxLevel(referentSettings.rs_ref_level)
  }, [referentSettings])
  useEffect(() => {
    if (referentLevelRewards) {
      const activeLevels = referentLevelRewards
        .filter((reward: any) => reward.rlr_is_active)
        .map((reward: any) => ({ level: reward.rlr_level, percentage: parseFloat(reward.rlr_percentage) }))
        .sort((a: ReferralLevel, b: ReferralLevel) => a.level - b.level)
      setLevels(activeLevels)
    }
  }, [referentLevelRewards])
  const maxAvailableLevel = referentLevelRewards?.filter((r: any) => r.rlr_is_active).length || 0
  const updateReferralLevel = async (newLevel: number) => {
    const temp = await updatReferentSettings({ rs_ref_level: newLevel })
    if (!temp) throw new Error('Failed to update')
    return temp
  }
  const handleMaxLevelChange = async (value: string) => {
    const newMaxLevel = parseInt(value)
    if (newMaxLevel < 1 || newMaxLevel > maxAvailableLevel) {
      toast.error(t("ref.errors.levelRange", { max: maxAvailableLevel }))
      return
    }
    if (newMaxLevel === maxLevel) return
    setIsLoading(true)
    setError(null)
    try {
      await updateReferralLevel(newMaxLevel)
      setMaxLevel(newMaxLevel)
      await refetchReferentSettings()
      toast.success(t("ref.success.levelUpdated"))
    } catch {
      setError(() => t("ref.errors.updateLevelFailed"))
      toast.error(t("ref.errors.updateLevelFailed"))
    } finally {
      setIsLoading(false)
    }
  }
  const handlePercentageChange = async (levelId: number, value: string, currentLevel: number) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue < 0 || numValue > 100) {
      toast.error(t("ref.errors.percentageRange"))
      return
    }
    const currentLevelData = referentLevelRewards?.find((r: any) => r.rlr_level === currentLevel)
    if (!currentLevelData) return
    if (numValue === parseFloat(currentLevelData.rlr_percentage)) return
    const previousLevel = referentLevelRewards?.find((r: any) => r.rlr_level === currentLevel - 1)
    if (previousLevel && numValue > parseFloat(previousLevel.rlr_percentage)) {
      toast.error(t("ref.errors.levelGreaterThanPrevious", { current: currentLevel, previous: currentLevel - 1 }))
      return
    }
    const nextLevel = referentLevelRewards?.find((r: any) => r.rlr_level === currentLevel + 1)
    if (nextLevel && numValue < parseFloat(nextLevel.rlr_percentage)) {
      toast.error(t("ref.errors.levelLessThanNext", { current: currentLevel, next: currentLevel + 1 }))
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await updateReferentLevelRewards(levelId, { rlr_percentage: numValue })
      await refetchReferentLevelRewards()
      toast.success(t("ref.success.percentageUpdated"))
    } catch {
      setError(() => t("ref.errors.updatePercentageFailed"))
      toast.error(t("ref.errors.updatePercentageFailed"))
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="flex flex-col space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{t("ref.cardTitle")}</CardTitle>
          <CardDescription>
            {t("ref.cardDescription")}
            {referentSettings && (
              <span className="ml-2 text-sm text-muted-foreground">
                ({t("ref.currentSetting", { level: referentSettings.rs_ref_level })})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Label className="w-48">{t("ref.maxLevels")}</Label>
              <Select
                value={maxLevel.toString()}
                onValueChange={handleMaxLevelChange}
                disabled={isLoading || !maxAvailableLevel}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t("ref.selectMaxLevel")} />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: maxAvailableLevel }, (_, i) => i + 1).map((level: number) => (
                    <SelectItem
                      key={level}
                      value={level.toString()}
                      className={level === referentSettings?.rs_ref_level ? "bg-accent" : ""}
                    >
                      {level} {level === 1 ? t("ref.level") : t("ref.levels")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              {levels.slice(0, maxLevel).map((level: ReferralLevel) => {
                const rewardData = referentLevelRewards?.find((r: any) => r.rlr_level === level.level)
                const handleUpdate = (value: string) => {
                  if (rewardData) {
                    handlePercentageChange(rewardData.rlr_id, value, level.level)
                  }
                }
                return (
                  <div key={level.level} className="flex items-center space-x-4">
                    <Label className="w-24">{t("ref.level")} {level.level}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        defaultValue={level.percentage}
                        onBlur={(e) => handleUpdate(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdate(e.currentTarget.value)
                          }
                        }}
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-32"
                      />
                      <span className="text-muted-foreground">{t("ref.percentage")}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
