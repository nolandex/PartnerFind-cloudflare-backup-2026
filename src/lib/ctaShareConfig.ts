import { Locale } from "./translations";

export interface CtaShareTarget {
  label: string;
  copiedToast: string;
  shareTitle: string;
  shareMessage: string;
}

const CTA_SHARE_CONFIG: Record<Locale, CtaShareTarget> = {
  "id-ID": {
    label: "Bagikan",
    copiedToast: "Tautan Berhasil Disalin!",
    shareTitle: "PartnerFind - Kolaborasi Global",
    shareMessage: "Terhubung dan berkolaborasi bersama partner global dalam ekosistem bernilai tinggi di PartnerFind:",
  },
  "en-US": {
    label: "Share",
    copiedToast: "Link Copied!",
    shareTitle: "PartnerFind - Global Collaboration",
    shareMessage: "Connect and collaborate with global partners in a high-value ecosystem on PartnerFind:",
  },
  "es-ES": {
    label: "Compartir",
    copiedToast: "¡Enlace Copiado!",
    shareTitle: "PartnerFind - Colaboración Global",
    shareMessage: "Conéctate y colabora con socios globales en un ecosistema de alto valor en PartnerFind:",
  },
  "fr-FR": {
    label: "Partager",
    copiedToast: "Lien Copié !",
    shareTitle: "PartnerFind - Collaboration Mondiale",
    shareMessage: "Connectez-vous et collaborez avec des partenaires internationaux sur PartnerFind :",
  },
  "ja-JP": {
    label: "共有する",
    copiedToast: "リンクをコピーしました！",
    shareTitle: "PartnerFind - グローバル協業ネットワーク",
    shareMessage: "PartnerFindで世界中のパートナーと繋がり、高価値な協業を始めましょう：",
  },
  "zh-CN": {
    label: "分享",
    copiedToast: "链接已复制！",
    shareTitle: "PartnerFind - 全球合作网络",
    shareMessage: "在 PartnerFind 上连接全球优质合伙人，开启深度合作：",
  },
  "ar-SA": {
    label: "مشاركة",
    copiedToast: "تم نسخ الرابط!",
    shareTitle: "PartnerFind - شبكة التعاون العالمي",
    shareMessage: "تواصل وتعاون مع شركاء حول العالم في منظومة PartnerFind الرائدة:",
  },
  "ko-KR": {
    label: "공유하기",
    copiedToast: "링크가 복사되었습니다!",
    shareTitle: "PartnerFind - 글로벌 협업 네트워크",
    shareMessage: "PartnerFind에서 글로벌 파트너와 함께 협업을 시작하세요:",
  },
  "pt-PT": {
    label: "Partilhar",
    copiedToast: "Link Copiado!",
    shareTitle: "PartnerFind - Colaboração Global",
    shareMessage: "Conecte-se e colabore com parceiros globais num ecossistema de alto valor no PartnerFind:",
  },
  "ru-RU": {
    label: "Поделиться",
    copiedToast: "Ссылка скопирована!",
    shareTitle: "PartnerFind - Глобальное сотрудничество",
    shareMessage: "Связывайтесь и сотрудничайте с партнёрами по всему миру в экосистеме PartnerFind:",
  },
};

export function getCtaShareConfig(locale: string): CtaShareTarget {
  if (locale in CTA_SHARE_CONFIG) {
    return CTA_SHARE_CONFIG[locale as Locale];
  }
  return CTA_SHARE_CONFIG["id-ID"];
}
