"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2Icon,
  GlobeIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ExternalLinkIcon,
  CheckCircle2Icon,
  CopyIcon,
  InfoIcon,
  UsersIcon,
  ShieldCheckIcon,
  StoreIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import type { BrandConfig } from "@/lib/site-config";
import { SITE_CONFIG } from "@/lib/site-config";

interface AssignedStaffMember {
  id: string;
  user_id: string;
  user_email: string;
  user_full_name: string | null;
  created_at: string;
}

interface BrandSettingsContentProps {
  brand: BrandConfig;
  organization: {
    id: string;
    slug: string;
    is_active: boolean;
    created_at: string;
  };
  staffMembers: AssignedStaffMember[];
}

export function BrandSettingsContent({
  brand,
  organization,
  staffMembers,
}: BrandSettingsContentProps) {
  const t = useTranslations("admin");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("brandInfoHeading")} — {brand.name}
            </h1>
            <Badge
              variant={organization.is_active ? "default" : "destructive"}
              className="capitalize"
            >
              {organization.is_active ? t("statusActive") : t("statusArchived")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t("brandInfoSubtitle")}
          </p>
        </div>

        {/* Storefront Quick Links */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/brands/${brand.slug}`} target="_blank" />}
            className="gap-1.5"
          >
            <StoreIcon className="h-4 w-4" />
            <span>{t("visitStorefront")}</span>
            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/catalog?org=${brand.slug}`} target="_blank" />}
            className="gap-1.5"
          >
            <GlobeIcon className="h-4 w-4" />
            <span>{t("visitCatalog")}</span>
            <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Static Configuration Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-950/20 text-sm">
        <InfoIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-blue-900 dark:text-blue-200">
            {t("staticConfigNotice")}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Path: <code className="bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded font-mono">lib/site-config.ts</code>
          </p>
        </div>
      </div>

      {/* Grid: Identity + Visual Assets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Brand Identity & Descriptions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2Icon className="h-4 w-4 text-primary" />
              <span>{t("brandIdentity")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("columnTitle")}
              </span>
              <p className="text-lg font-semibold text-foreground mt-0.5">{brand.name}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Storefront Description (Bengali)
                </span>
                <p className="text-sm mt-1 text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-lg border">
                  {brand.description.bn}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Storefront Description (English)
                </span>
                <p className="text-sm mt-1 text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-lg border">
                  {brand.description.en}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("brandSlogan")}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border">
                  <strong>বাংলা:</strong> {brand.cardDescription.bn}
                </p>
                <p className="text-xs text-muted-foreground bg-muted/20 p-2.5 rounded-lg border">
                  <strong>English:</strong> {brand.cardDescription.en}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visual Brand Assets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("brandLogo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Preview */}
            <div className="flex flex-col items-center justify-center p-6 bg-muted/40 rounded-xl border">
              <div className="relative h-20 w-44">
                <Image
                  src={brand.logoSrc}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 font-mono">
                {brand.logoSrc}
              </p>
            </div>

            {/* Accent Color */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
              <span className="text-xs font-medium text-muted-foreground">Accent Color</span>
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border shadow-xs"
                  style={{ backgroundColor: brand.cardAccent }}
                />
                <code className="text-xs font-mono">{brand.cardAccent}</code>
              </div>
            </div>

            {/* Card Background Preview */}
            <div className="rounded-lg border overflow-hidden">
              <div className="relative h-24 w-full bg-muted">
                <Image
                  src={brand.cardBackgroundSrc}
                  alt={`${brand.name} Card Background`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-2 text-center bg-card">
                <span className="text-[11px] text-muted-foreground font-mono">
                  {brand.cardBackgroundSrc}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid: Contact & Social */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 text-primary" />
              <span>{t("contactDetails")}</span>
            </CardTitle>
            <CardDescription>
              Platform-wide shared contact and office details rendered on customer touchpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Address */}
            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
              <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-medium text-muted-foreground">Office Address</span>
                <p className="text-sm text-foreground mt-0.5">{SITE_CONFIG.contact.address}</p>
              </div>
            </div>

            {/* Phone Hotline */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Hotline Phone</span>
                  <p className="text-sm font-medium text-foreground">{SITE_CONFIG.contact.phone}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => handleCopy("phone", SITE_CONFIG.contact.phone)}
              >
                {copiedKey === "phone" ? (
                  <>
                    <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t("linkCopied")}</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>{t("copyLink")}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-3">
                <MailIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs font-medium text-muted-foreground">Support Email</span>
                  <p className="text-sm font-medium text-foreground">{SITE_CONFIG.contact.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => handleCopy("email", SITE_CONFIG.contact.email)}
              >
                {copiedKey === "email" ? (
                  <>
                    <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t("linkCopied")}</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>{t("copyLink")}</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GlobeIcon className="h-4 w-4 text-primary" />
              <span>{t("socialChannels")}</span>
            </CardTitle>
            <CardDescription>
              Verified external links configured for social touchpoints and messaging.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {SITE_CONFIG.socialLinks.map((link) => (
              <div
                key={link.label}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
              >
                <div>
                  <span className="text-xs font-medium text-muted-foreground">{link.label}</span>
                  <p className="text-sm text-foreground truncate max-w-[240px] sm:max-w-xs font-mono">
                    {link.href}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => handleCopy(`social-${link.label}`, link.href)}
                  >
                    {copiedKey === `social-${link.label}` ? (
                      <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <CopyIcon className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    nativeButton={false}
                    render={
                      <Link
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${link.label}`}
                      >
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </Link>
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Grid: Operational Data & Assigned Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Organization Record */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-primary" />
              <span>{t("operationalStatus")}</span>
            </CardTitle>
            <CardDescription>
              Backend organization entity used for RLS boundary and data scoping.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Organization Slug</span>
              <code className="bg-muted px-2 py-0.5 rounded text-xs font-mono font-medium">
                {organization.slug}
              </code>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Database UUID</span>
              <code className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono">
                {organization.id}
              </code>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={organization.is_active ? "default" : "destructive"}>
                {organization.is_active ? "Active" : "Archived"}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Registered In DB</span>
              <span className="text-xs text-muted-foreground">
                {new Date(organization.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Staff Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UsersIcon className="h-4 w-4 text-primary" />
              <span>{t("assignedStaff")}</span>
            </CardTitle>
            <CardDescription>
              Staff authorized to manage catalog items, categories, and banners for this brand.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staffMembers.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                No staff members currently assigned.
              </div>
            ) : (
              <div className="space-y-2.5">
                {staffMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {member.user_full_name || member.user_email}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.user_email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {t("roleStaff")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
