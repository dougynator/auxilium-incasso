"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useTranslations } from 'next-intl';

export default function DeleteUserPage() {
  const t = useTranslations('admin.users.delete');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('admin.users.roles');
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, [userId]);

  const loadUser = async () => {
    try {
      // Get profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", userId)
        .single();

      if (!profile) {
        toast({
          title: tCommon('error'),
          description: t('notFound'),
          variant: "destructive",
        });
        router.push("/admin/users");
        return;
      }

      // Get email from auth
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users?.find(u => u.id === userId);

      setUserData({
        ...profile,
        email: user?.email || t('noEmail'),
      });
    } catch (error: any) {
      console.error("Error loading user:", error);
      toast({
        title: tCommon('error'),
        description: t('loadingError'),
        variant: "destructive",
      });
    } finally {
      setLoadingUser(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('confirm'))) {
      return;
    }

    setLoading(true);
    try {
      // Delete user from auth (this will cascade delete the profile due to ON DELETE CASCADE)
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteError) throw deleteError;

      toast({
        title: t('deleted'),
        description: `${userData?.full_name || tCommon('user')} ${t('deletedDesc')}`,
      });

      router.push("/admin/users");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: tCommon('error'),
        description: error.message || t('error'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center py-12">
        <div>{tCommon('loading')}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">{t('notFound')}</h2>
        <Link href="/admin/users">
          <Button variant="outline">{t('backToUsers')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('backToUsers')}
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t('warning')}
          </CardTitle>
          <CardDescription>
            {t('warningDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="font-semibold mb-2">{t('userData')}:</div>
            <div className="space-y-1 text-sm">
              <div><span className="font-medium">{t('name')}:</span> {userData.full_name || t('name')}</div>
              <div><span className="font-medium">{t('email')}:</span> {userData.email}</div>
              <div><span className="font-medium">{t('role')}:</span> {tRoles(userData.role)}</div>
              {userData.organizations && (
                <div><span className="font-medium">{t('organization')}:</span> {userData.organizations.name}</div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>{tCommon('note')}:</strong> {t('note')}
            </p>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? t('deleting') : t('delete')}
            </Button>
            <Link href="/admin/users">
              <Button type="button" variant="outline">
                {tCommon('cancel')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

