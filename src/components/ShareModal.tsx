import React, { useState } from 'react';
import {
  Check,
  Copy,
  Mail,
  MessageSquare,
  Share2,
  Smartphone,
  X,
} from 'lucide-react';
import type { TranslationDict } from '../game/i18n';

type ShareModalProps = {
  open: boolean;
  t: TranslationDict;
  customMessage?: string;
  onClose: () => void;
};

export const ShareModal: React.FC<ShareModalProps> = ({
  open,
  t,
  customMessage,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const shareUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const shareText = customMessage || t.shareMessageInvite;
  const fullPayload = `${shareText} ${shareUrl}`.trim();

  const encodedText = encodeURIComponent(fullPayload);
  const encodedTextOnly = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPayload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: t.gameName,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or unsupported on desktop; fall back to copy
      }
    }
    await handleCopy();
  };

  const channels = [
    {
      name: t.shareSms,
      href: `sms:?&body=${encodedText}`,
      icon: <MessageSquare className="w-4 h-4 accent-text" />,
      external: false,
    },
    {
      name: t.shareWhatsApp,
      href: `https://wa.me/?text=${encodedText}`,
      icon: <Share2 className="w-4 h-4 text-[#25D366]" />,
      external: true,
    },
    {
      name: t.shareTelegram,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTextOnly}`,
      icon: <Share2 className="w-4 h-4 text-[#38BDF8]" />,
      external: true,
    },
    {
      name: t.shareX,
      href: `https://twitter.com/intent/tweet?text=${encodedTextOnly}&url=${encodedUrl}`,
      icon: <Share2 className="w-4 h-4 text-[#E2E8F0]" />,
      external: true,
    },
    {
      name: t.shareFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Share2 className="w-4 h-4 text-[#60A5FA]" />,
      external: true,
    },
    {
      name: t.shareEmail,
      href: `mailto:?subject=${encodeURIComponent(t.gameName)}&body=${encodedText}`,
      icon: <Mail className="w-4 h-4 accent-text" />,
      external: false,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gebeta-share-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#1E140D] accent-border border p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2
              id="gebeta-share-title"
              className="text-xl font-display font-bold text-[#FFF4E0]"
            >
              {t.shareTitle}
            </h2>
            <p className="text-xs text-[#CBB597] leading-relaxed">
              {t.shareSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.rulesClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#281A11] hover:bg-[#382519] text-[#E8D7BE] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="rounded-xl bg-[#140D08] border border-[#D4A035]/20 p-3 text-xs text-[#E8D7BE] leading-relaxed break-words">
          {fullPayload}
        </div>

        {/* System Native Share Sheet (SHAREit, AirDrop, Nearby Share, installed social apps) */}
        <div className="space-y-1.5">
          <button
            type="button"
            data-testid="native-share-btn"
            onClick={handleNativeShare}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 min-h-[46px] rounded-xl accent-bg font-semibold text-sm transition-colors cursor-pointer"
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>{t.shareNativeApps}</span>
          </button>
          <p className="text-[11px] text-[#9E886D] text-center">
            {t.shareNativeNote}
          </p>
        </div>

        {/* Direct SMS, Email & Social Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {channels.map((ch) => (
            <a
              key={ch.name}
              href={ch.href}
              target={ch.external ? '_blank' : undefined}
              rel={ch.external ? 'noopener noreferrer' : undefined}
              className="inline-flex items-center justify-center gap-2 px-3 py-2.5 min-h-[42px] rounded-lg bg-[#140D08] hover:bg-[#2C1D13] border border-[#3F2B1D] text-xs font-medium text-[#F5EDE0] transition-colors whitespace-nowrap"
            >
              {ch.icon}
              <span>{ch.name}</span>
            </a>
          ))}
        </div>

        {/* Copy Link / Invite */}
        <button
          type="button"
          data-testid="copy-share-btn"
          onClick={handleCopy}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] rounded-lg bg-[#281A11] hover:bg-[#382519] border border-[#D4A035]/25 text-xs sm:text-sm font-medium text-[#F5EDE0] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#36A374]" />
              <span>{t.shareCopied}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 accent-text" />
              <span>{t.shareCopyLink}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
