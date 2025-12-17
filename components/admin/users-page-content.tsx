"use client";

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface UsersPageContentProps {
  usersWithEmails: any[];
}

export default function AdminUsersPageContent({ usersWithEmails }: UsersPageContentProps) {
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');

  const getRoleLabel = (role: string) => {
    return t(`roles.${role}`) || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-800",
      staff: "bg-blue-100 text-blue-800",
      client: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <Link href="/admin/users/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {t('addUser')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{tCommon('overview')}</CardTitle>
        </CardHeader>
        <CardContent>
          {usersWithEmails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">{tCommon('name')}</th>
                    <th className="text-left p-4 font-semibold">{t('email')}</th>
                    <th className="text-left p-4 font-semibold">{t('role')}</th>
                    <th className="text-left p-4 font-semibold">{t('organization')}</th>
                    <th className="text-left p-4 font-semibold">{t('createdAt')}</th>
                    <th className="text-right p-4 font-semibold">{tCommon('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithEmails.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-medium">{user.full_name || tCommon('name')}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{user.organizations?.name || "-"}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(user.created_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/users/${user.id}/delete`}>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('noUsers')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

