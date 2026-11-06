import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import type { Locale } from "../lib/translations";

// Halaman Mitra Referral PartnerFind (URL /referral) — 10 bahasa,
// mengikuti bahasa yang dipilih pengunjung di situs. Berisi penjelasan
// singkat Mitra Referral + embed video "apa yang didapat" per bahasa,
// langkah, aturan imbalan (50% biaya pendaftaran + hingga 50% komisi
// platform, selamanya), pesan undangan siap salin, dan kontak admin
// untuk penarikan imbalan. Section testimoni berisi kejadian ASLI yang
// dicatat admin (bergabung, tarik dana, review) dari /api/inviter-events.

const ADMIN_WA =
  "https://wa.me/6289691685228?text=Halo%20owner%20PartnerFind%2C%20saya%20mau%20tarik%20imbalan%20%2F%20bertanya";
const SITE_LINK = "https://partnerfind.ai.id";
const BOT_LINK = "https://t.me/Partnerfindreal_bot";

const MITRA_VIDEO: Record<string, string> = {
  "id-ID": "Rxu6yWPkR-U",
  "en-US": "IM3bPmtk5H8",
  "es-ES": "e0acQwxvn8g",
  "ja-JP": "4lSGuMnMm2I",
  "fr-FR": "bJQieFMj9JU",
  "ar-SA": "f_X_q94vFlI",
  "ru-RU": "lq_lkzich7M",
  "ko-KR": "mXQ2i8VcX1o",
  "pt-PT": "RyR3VGhzn-I",
  "zh-CN": "QTJn246Pdfk",
};

const MSG_BASE = "https://partnerfind-menu.partnerfind.workers.dev";
const MSG_MEDIA: { img?: string; full?: string; name?: string }[] = [
  { img: `${MSG_BASE}/Pesan1.webp`, full: "/Pesan1.png", name: "PartnerFind-Pesan-1.png" },
  { img: `${MSG_BASE}/MitraPesan1.webp`, full: "/MitraPesan1.png", name: "PartnerFind-Pesan-2.png" },
  { img: `${MSG_BASE}/MitraPesan2.webp`, full: "/MitraPesan2.png", name: "PartnerFind-Pesan-3.png" },
  { img: `${MSG_BASE}/MitraPesan3.webp`, full: "/MitraPesan3.png", name: "PartnerFind-Pesan-4.png" },
];
const MSG_TEXTS: Record<Locale, string[]> = {
  "id-ID": [
    "Kamu diundang bergabung di PartnerFind, platform pencocokan peluang yang sebaiknya diikuti setiap orang.",
    "Kami menghubungkan pencari peluang ekonomi dengan pemberi peluang di bidang:\n• Bisnis & Kemitraan\n• Proyek\n• Investasi & Pendanaan\n• Pekerjaan\n• Jasa & Keahlian\n• Properti\n• Perdagangan\n• Aset & Sumber Daya\n• Pendidikan & Mentoring\n• Kolaborasi Lainnya",
    "Kamu juga bisa ikut serta dalam:\n• Pertukaran Informasi\n• Berbagi Pengalaman & Pengetahuan\n• Jaringan & Diskusi",
    "Daftar melalui:\nhttps://partnerfind.ai.id/\natau\nhttps://tally.so/r/WJJ1dv\n\nBagikan ke orang-orang yang kamu kenal. Kamu ingin mereka maju juga, kan?",
  ],
  "en-US": [
    "You are invited to join PartnerFind, an opportunity-matching platform everyone should join.",
    "We connect people seeking economic opportunities with those offering them in:\n• Business & Partnerships\n• Projects\n• Investment & Funding\n• Jobs\n• Services & Expertise\n• Property\n• Trade\n• Assets & Resources\n• Education & Mentoring\n• Other Collaborations",
    "You can also take part in:\n• Information Exchange\n• Sharing Experiences & Knowledge\n• Networking & Discussion",
    "Sign up through:\nhttps://partnerfind.ai.id/\nor\nhttps://tally.so/r/yXX7jB\n\nShare it with people you know. You want them to move forward too, right?",
  ],
  "es-ES": [
    "Estás invitado a unirte a PartnerFind, una plataforma de conexión de oportunidades a la que todos deberían unirse.",
    "Conectamos a quienes buscan oportunidades económicas con quienes las ofrecen en:\n• Negocios y Alianzas\n• Proyectos\n• Inversión y Financiación\n• Empleo\n• Servicios y Habilidades\n• Inmuebles\n• Comercio\n• Activos y Recursos\n• Educación y Mentoría\n• Otras Colaboraciones",
    "También puedes participar en:\n• Intercambio de Información\n• Compartir Experiencias y Conocimientos\n• Redes de Contactos y Debates",
    "Regístrate a través de:\nhttps://partnerfind.ai.id/\no\nhttps://tally.so/r/VppxbJ\n\nCompártelo con personas que conoces. Tú también quieres que avancen, ¿verdad?",
  ],
  "ja-JP": [
    "あなたは PartnerFind に招待されています — みんなが参加すべき機会マッチングプラットフォームです。",
    "私たちは、経済的な機会を求める人と提供する人を、以下の分野でつなぎます:\n• ビジネス＆パートナーシップ\n• プロジェクト\n• 投資＆資金調達\n• 仕事\n• サービス＆スキル\n• 不動産\n• 貿易\n• 資産＆リソース\n• 教育＆メンタリング\n• その他のコラボレーション",
    "次のような活動にも参加できます:\n• 情報交換\n• 経験と知識の共有\n• ネットワーキングとディスカッション",
    "登録はこちらから:\nhttps://partnerfind.ai.id/\nまたは\nhttps://tally.so/r/2jjRDV\n\nあなたの知り合いにもシェアしましょう。彼らにも前進してほしいですよね？",
  ],
  "fr-FR": [
    "Vous êtes invité à rejoindre PartnerFind, une plateforme de mise en relation d'opportunités que tout le monde devrait rejoindre.",
    "Nous connectons les personnes à la recherche d'opportunités économiques avec celles qui en proposent dans :\n• Affaires et Partenariats\n• Projets\n• Investissement et Financement\n• Emploi\n• Services et Compétences\n• Immobilier\n• Commerce\n• Actifs et Ressources\n• Éducation et Mentorat\n• Autres Collaborations",
    "Vous pouvez également participer à :\n• Échange d'Informations\n• Partage d'Expériences et de Connaissances\n• Réseautage et Discussions",
    "Inscrivez-vous via :\nhttps://partnerfind.ai.id/\nou\nhttps://tally.so/r/ArrQjk\n\nPartagez-le avec des personnes que vous connaissez. Vous voulez aussi qu'elles avancent, n'est-ce pas ?",
  ],
  "ar-SA": [
    "أنت مدعو للانضمام إلى PartnerFind، منصة لمطابقة الفرص يجب على الجميع الانضمام إليها.",
    "نربط الباحثين عن الفرص الاقتصادية بمن يقدمونها في مجالات:\n• الأعمال والشراكات\n• المشاريع\n• الاستثمار والتمويل\n• الوظائف\n• الخدمات والمهارات\n• العقارات\n• التجارة\n• الأصول والموارد\n• التعليم والإرشاد\n• تعاونات أخرى",
    "يمكنك أيضًا المشاركة في:\n• تبادل المعلومات\n• مشاركة التجارب والمعرفة\n• التواصل والنقاش",
    "سجّل عبر:\nhttps://partnerfind.ai.id/\nأو\nhttps://tally.so/r/vXXWzA\n\nشاركه مع الأشخاص الذين تعرفهم. فأنت تريد لهم التقدم أيضًا، أليس كذلك؟",
  ],
  "ru-RU": [
    "Вы приглашены присоединиться к PartnerFind — платформе подбора возможностей, к которой стоит присоединиться каждому.",
    "Мы соединяем людей, ищущих экономические возможности, с теми, кто их предлагает, в сферах:\n• Бизнес и партнёрство\n• Проекты\n• Инвестиции и финансирование\n• Работа\n• Услуги и навыки\n• Недвижимость\n• Торговля\n• Активы и ресурсы\n• Образование и наставничество\n• Другие виды сотрудничества",
    "Вы также можете принять участие в:\n• Обмене информацией\n• Обмене опытом и знаниями\n• Нетворкинге и обсуждениях",
    "Регистрация через:\nhttps://partnerfind.ai.id/\nили\nhttps://tally.so/r/o99xv1\n\nПоделитесь этим со своими знакомыми. Вы же хотите, чтобы они тоже двигались вперёд, правда?",
  ],
  "ko-KR": [
    "PartnerFind에 초대합니다 — 모두가 가입해야 할 기회 매칭 플랫폼입니다.",
    "우리는 경제적 기회를 찾는 사람과 제공하는 사람을 다음 분야에서 연결합니다:\n• 비즈니스 및 파트너십\n• 프로젝트\n• 투자 및 자금 조달\n• 일자리\n• 서비스 및 기술\n• 부동산\n• 무역\n• 자산 및 자원\n• 교육 및 멘토링\n• 기타 협업",
    "다음 활동에도 참여할 수 있습니다:\n• 정보 교환\n• 경험 및 지식 공유\n• 네트워킹 및 토론",
    "가입 방법:\nhttps://partnerfind.ai.id/\n또는\nhttps://tally.so/r/7XXPPL\n\n아는 사람들에게도 공유해 보세요. 그들도 앞으로 나아가길 바라시죠?",
  ],
  "pt-PT": [
    "Está convidado a aderir à PartnerFind, uma plataforma de correspondência de oportunidades a que todos deveriam aderir.",
    "Ligamos quem procura oportunidades económicas a quem as oferece nas áreas de:\n• Negócios e Parcerias\n• Projetos\n• Investimento e Financiamento\n• Emprego\n• Serviços e Competências\n• Imobiliário\n• Comércio\n• Ativos e Recursos\n• Educação e Mentoria\n• Outras Colaborações",
    "Também pode participar em:\n• Troca de Informações\n• Partilha de Experiências e Conhecimentos\n• Networking e Discussão",
    "Registe-se através de:\nhttps://partnerfind.ai.id/\nou\nhttps://tally.so/r/gbbOON\n\nPartilhe com pessoas que conhece. Também quer que elas avancem, certo?",
  ],
  "zh-CN": [
    "诚邀你加入 PartnerFind — 一个每个人都应该加入的机会匹配平台。",
    "我们连接寻找经济机会的人与提供机会的人，涵盖以下领域:\n• 商业与合作\n• 项目\n• 投资与融资\n• 就业\n• 服务与技能\n• 房地产\n• 贸易\n• 资产与资源\n• 教育与指导\n• 其他合作",
    "你还可以参与:\n• 信息交流\n• 经验与知识分享\n• 人脉拓展与讨论",
    "通过以下方式注册:\nhttps://partnerfind.ai.id/\n或\nhttps://tally.so/r/ArzAvB\n\n分享给你认识的人。你也希望他们一起进步，对吧？",
  ],
};

function NumBadge({ n }: { n: number }) {
  return (
    <div
      className="relative z-10 flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full border border-white/20 font-mono"
      style={{
        background: "hsl(var(--brand-accent))",
        boxShadow: "0 4px 12px hsl(var(--brand-accent)/0.35)",
      }}
    >
      <span className="text-white font-black text-xs leading-none">{n}</span>
    </div>
  );
}

type PageStrings = {
  title: string;
  home: string;
  intro: string;
  howTitle: string;
  steps: string[];
  rulesTitle: string;
  step1Title: string;
  step2Title: string;
  step1Text: string;
  step3Title: string;
  step3Text: string;
  notesTitle: string;
  downloadImage: string;
  msgLabel: string;
  rules: string[];
  inviteTitle: string;
  inviteText: string;
  copy: string;
  copied: string;
  withdrawTitle: string;
  chatAdmin: string;
  telegramNote: string;
  testiTitle: string;
  loading: string;
  testiEmpty: string;
  evJoin: string;
  evWithdraw: string;
  evReview: string;
  joined: (name: string) => string;
  withdrew: (name: string, amount: string) => string;
};

const STRINGS: Record<string, PageStrings> = {
  "id-ID": {
    title: "Mitra Referral",
    step1Title: "Hubungi Owner",
    step2Title: "Pesan untuk Dibagikan ke Orang yang Kamu Kenal",
    notesTitle: "Skema Penghasilan",
    downloadImage: "Unduh Gambar",
    msgLabel: "Pesan",
    home: "Beranda",
    intro:
      "Gabung jadi Mitra Referral PartnerFind, dan dapatkan penghasilan dari setiap orang yang kamu undang.",
    howTitle: "Cara Kerja",
    steps: [
      "Buat grup WhatsApp bernama PartnerFind.",
      "Undang orang terdekatmu.",
      "Kirim pesan undangan di bawah ini ke grupmu.",
      "Minta anggota grup ikut membagikannya ke kenalan mereka.",
      "Grup penuh? Buat grup baru.",
    ],
    rulesTitle: "Aturan",
    rules: [
      "Biaya pendaftaran dapat ditentukan oleh pendaftar sendiri atau oleh Mitra Referral yang mengundang.",
      "Kamu mendapatkan 50% dari biaya pendaftaran setiap orang yang kamu undang.",
      "Ditambah hingga 50% dari komisi platform setiap kali orang yang kamu undang berhasil mencapai kesepakatan — berlaku selamanya.",
    ],
    inviteTitle: "Pesan Undangan",
    inviteText:
      "PartnerFind menghubungkan pencari peluang ekonomi dengan pemberi peluang.\n\n" +
      `Daftar lewat situs kami: ${SITE_LINK}`,
    copy: "Salin Pesan",
    copied: "Tersalin ✓",
    step1Text: "Chat owner lewat tombol di bawah ini untuk mulai jadi Mitra Referral.",
    step3Title: "Terima Imbalan",
    step3Text: "Setiap orang yang kamu undang menghasilkan imbalan untukmu sesuai skema di bawah ini. Imbalan bisa ditarik lewat chat owner.",
    withdrawTitle: "Tarik Imbalan",
    chatAdmin: "Chat Owner",
    telegramNote: "Program yang sama juga tersedia di Telegram:",
    testiTitle: "Testimoni Mitra Referral",
    loading: "Memuat…",
    testiEmpty:
      "Belum ada testimoni Mitra Referral. Jadilah yang pertama — buat grupmu dan mulai undang orang terdekatmu.",
    evJoin: "Bergabung",
    evWithdraw: "Tarik Dana",
    evReview: "Review",
    joined: (n) => `${n} bergabung sebagai Mitra Referral.`,
    withdrew: (n, a) => `${n} menarik imbalan sebesar ${a}.`,
  },
  "en-US": {
    title: "Referral Partner",
    step1Title: "Contact the Owner",
    step2Title: "Message to Share with People You Know",
    notesTitle: "Income Scheme",
    downloadImage: "Download Image",
    msgLabel: "Message",
    home: "Home",
    intro:
      "Become a PartnerFind Referral Partner and earn from every person you invite.",
    howTitle: "How It Works",
    steps: [
      "Create a WhatsApp group named PartnerFind.",
      "Invite the people closest to you.",
      "Send the invitation message below to your group.",
      "Ask group members to share it with their contacts too.",
      "Group full? Create a new group.",
    ],
    rulesTitle: "Rules",
    rules: [
      "The registration fee can be set by the registrant or by the inviting Referral Partner.",
      "You receive 50% of the registration fee of every person you invite.",
      "Plus up to 50% of the platform commission every time someone you invited successfully reaches an agreement — forever.",
    ],
    inviteTitle: "Invitation Message",
    inviteText:
      "PartnerFind connects people seeking economic opportunities with those who offer them.\n\n" +
      `Sign up through our website: ${SITE_LINK}`,
    copy: "Copy Message",
    copied: "Copied ✓",
    step1Text: "Chat the owner using the button below to get started as a Referral Partner.",
    step3Title: "Receive Your Rewards",
    step3Text: "Every person you invite earns you rewards under the scheme below. Rewards can be withdrawn through the owner chat.",
    withdrawTitle: "Withdraw Rewards",
    chatAdmin: "Chat Owner",
    telegramNote: "The same program is also available on Telegram:",
    testiTitle: "Mitra Referral Testimonials",
    loading: "Loading…",
    testiEmpty:
      "No Mitra Referral testimonials yet. Be the first — create your group and start inviting the people closest to you.",
    evJoin: "Joined",
    evWithdraw: "Withdrawal",
    evReview: "Review",
    joined: (n) => `${n} joined as a Mitra Referral.`,
    withdrew: (n, a) => `${n} withdrew a reward of ${a}.`,
  },
  "es-ES": {
    title: "Socio de Referidos",
    step1Title: "Contacta al Propietario",
    step2Title: "Mensaje para Compartir con Personas que Conoces",
    notesTitle: "Esquema de Ingresos",
    downloadImage: "Descargar Imagen",
    msgLabel: "Mensaje",
    home: "Inicio",
    intro:
      "Conviértete en Socio de Referidos de PartnerFind y gana con cada persona que invites.",
    howTitle: "Cómo Funciona",
    steps: [
      "Crea un grupo de WhatsApp llamado PartnerFind.",
      "Invita a las personas más cercanas a ti.",
      "Envía el mensaje de invitación de abajo a tu grupo.",
      "Pide a los miembros del grupo que lo compartan con sus conocidos.",
      "¿Grupo lleno? Crea un grupo nuevo.",
    ],
    rulesTitle: "Reglas",
    rules: [
      "La cuota de registro puede fijarla la propia persona que se registra o el Socio de Referidos que la invita.",
      "Recibes el 50% de la tarifa de registro de cada persona que invites.",
      "Además, hasta el 50% de la comisión de la plataforma cada vez que alguien que invitaste logra llegar a un acuerdo, para siempre.",
    ],
    inviteTitle: "Mensaje de Invitación",
    inviteText:
      "PartnerFind conecta a quienes buscan oportunidades económicas con quienes las ofrecen.\n\n" +
      `Regístrate en nuestro sitio web: ${SITE_LINK}`,
    copy: "Copiar Mensaje",
    copied: "Copiado ✓",
    step1Text: "Chatea con el propietario con el botón de abajo para empezar como Socio de Referidos.",
    step3Title: "Recibe tus Recompensas",
    step3Text: "Cada persona que invites te genera recompensas según el esquema de abajo. Las recompensas se retiran por el chat con el propietario.",
    withdrawTitle: "Retirar Recompensas",
    chatAdmin: "Chatear con el Propietario",
    telegramNote: "El mismo programa también está disponible en Telegram:",
    testiTitle: "Testimonios de Mitra Referral",
    loading: "Cargando…",
    testiEmpty:
      "Aún no hay testimonios de Mitra Referral. Sé el primero: crea tu grupo y empieza a invitar a tus personas más cercanas.",
    evJoin: "Se unió",
    evWithdraw: "Retiro",
    evReview: "Reseña",
    joined: (n) => `${n} se unió como Mitra Referral.`,
    withdrew: (n, a) => `${n} retiró una recompensa de ${a}.`,
  },
  "ja-JP": {
    title: "紹介パートナー",
    step1Title: "オーナーへ連絡",
    step2Title: "知り合いに共有するメッセージ",
    notesTitle: "収入スキーム",
    downloadImage: "画像をダウンロード",
    msgLabel: "メッセージ",
    home: "ホーム",
    intro:
      "PartnerFindの紹介パートナーになって、招待した人全員から収入を得ましょう。",
    howTitle: "仕組み",
    steps: [
      "PartnerFindという名前のWhatsAppグループを作成します。",
      "身近な人を招待します。",
      "下の招待メッセージをグループに送信します。",
      "グループのメンバーにも知り合いへ共有してもらいます。",
      "グループがいっぱいになったら、新しいグループを作成します。",
    ],
    rulesTitle: "ルール",
    rules: [
      "登録料は、登録する本人または招待した紹介パートナーが決めることができます。",
      "招待した人全員の登録料の50%があなたに入ります。",
      "さらに、招待した人が合意に達するたびに、プラットフォーム手数料の最大50%が永久に入ります。",
    ],
    inviteTitle: "招待メッセージ",
    inviteText:
      "PartnerFindは、経済の機会を探している人と、機会を提供する人をつなぎます。\n\n" +
      `ウェブサイトから登録: ${SITE_LINK}`,
    copy: "メッセージをコピー",
    copied: "コピーしました ✓",
    step1Text: "下のボタンからオーナーにチャットして、紹介パートナーを始めましょう。",
    step3Title: "報酬を受け取る",
    step3Text: "招待した人ごとに、下のスキームに従って報酬が入ります。報酬はオーナーへのチャットで引き出せます。",
    withdrawTitle: "報酬の引き出し",
    chatAdmin: "オーナーにチャット",
    telegramNote: "Telegramでも同じプログラムが利用できます:",
    testiTitle: "Mitra Referralの声",
    loading: "読み込み中…",
    testiEmpty:
      "まだMitra Referralの声はありません。最初の人になりましょう — グループを作成して、身近な人を招待し始めてください。",
    evJoin: "参加",
    evWithdraw: "引き出し",
    evReview: "レビュー",
    joined: (n) => `${n}さんがMitra Referralとして参加しました。`,
    withdrew: (n, a) => `${n}さんが${a}の報酬を引き出しました。`,
  },
  "fr-FR": {
    title: "Partenaire de Parrainage",
    step1Title: "Contacter le Propriétaire",
    step2Title: "Message à Partager aux Personnes que Vous Connaissez",
    notesTitle: "Schéma de Revenus",
    downloadImage: "Télécharger l'Image",
    msgLabel: "Message",
    home: "Accueil",
    intro:
      "Devenez Partenaire de Parrainage PartnerFind et gagnez de l’argent pour chaque personne que vous invitez.",
    howTitle: "Comment ça marche",
    steps: [
      "Créez un groupe WhatsApp nommé PartnerFind.",
      "Invitez vos proches.",
      "Envoyez le message d'invitation ci-dessous à votre groupe.",
      "Demandez aux membres du groupe de le partager à leurs contacts.",
      "Groupe plein ? Créez un nouveau groupe.",
    ],
    rulesTitle: "Règles",
    rules: [
      "Les frais d'inscription peuvent être fixés par la personne qui s'inscrit ou par le Partenaire de Parrainage qui l'invite.",
      "Vous recevez 50 % des frais d'inscription de chaque personne que vous invitez.",
      "Plus jusqu'à 50 % de la commission de la plateforme chaque fois qu'une personne que vous avez invitée parvient à conclure un accord — pour toujours.",
    ],
    inviteTitle: "Message d'Invitation",
    inviteText:
      "PartnerFind relie les personnes en quête d'opportunités économiques à celles qui en proposent.\n\n" +
      `Inscrivez-vous via notre site web : ${SITE_LINK}`,
    copy: "Copier le Message",
    copied: "Copié ✓",
    step1Text: "Discutez avec le propriétaire via le bouton ci-dessous pour devenir Partenaire de Parrainage.",
    step3Title: "Recevez vos Récompenses",
    step3Text: "Chaque personne que vous invitez vous rapporte des récompenses selon le schéma ci-dessous. Les retraits se font via le chat avec le propriétaire.",
    withdrawTitle: "Retirer les Récompenses",
    chatAdmin: "Discuter avec le Propriétaire",
    telegramNote: "Le même programme est aussi disponible sur Telegram :",
    testiTitle: "Témoignages Mitra Referral",
    loading: "Chargement…",
    testiEmpty:
      "Pas encore de témoignages Mitra Referral. Soyez le premier — créez votre groupe et commencez à inviter vos proches.",
    evJoin: "Rejoint",
    evWithdraw: "Retrait",
    evReview: "Avis",
    joined: (n) => `${n} a rejoint en tant que Mitra Referral.`,
    withdrew: (n, a) => `${n} a retiré une récompense de ${a}.`,
  },
  "ar-SA": {
    title: "شريك الإحالة",
    step1Title: "اتصل بالمالك",
    step2Title: "رسالة لمشاركتها مع الأشخاص الذين تعرفهم",
    notesTitle: "نظام الدخل",
    downloadImage: "تنزيل الصورة",
    msgLabel: "الرسالة",
    home: "الرئيسية",
    intro:
      "كن شريك إحالة في PartnerFind واربح من كل شخص تدعوه.",
    howTitle: "كيفية العمل",
    steps: [
      "أنشئ مجموعة واتساب باسم PartnerFind.",
      "ادعُ الأشخاص المقربين منك.",
      "أرسل رسالة الدعوة أدناه إلى مجموعتك.",
      "اطلب من أعضاء المجموعة مشاركتها مع معارفهم أيضًا.",
      "امتلأت المجموعة؟ أنشئ مجموعة جديدة.",
    ],
    rulesTitle: "القواعد",
    rules: [
      "يمكن أن يحدد رسوم التسجيل المسجّل نفسه أو شريك الإحالة الذي دعاه.",
      "تحصل على 50% من رسوم تسجيل كل شخص تدعوه.",
      "بالإضافة إلى ما يصل إلى 50% من عمولة المنصة في كل مرة ينجح فيها شخص دعوته في الوصول إلى اتفاق — إلى الأبد.",
    ],
    inviteTitle: "رسالة الدعوة",
    inviteText:
      "يربط PartnerFind الباحثين عن الفرص الاقتصادية بمقدّمي الفرص.\n\n" +
      `سجّل عبر موقعنا الإلكتروني: ${SITE_LINK}`,
    copy: "نسخ الرسالة",
    copied: "تم النسخ ✓",
    step1Text: "راسل المالك عبر الزر أدناه لتبدأ كشريك إحالة.",
    step3Title: "استلم مكافآتك",
    step3Text: "كل شخص تدعوه يمنحك مكافآت وفق النظام أدناه. ويمكن سحب المكافآت عبر مراسلة المالك.",
    withdrawTitle: "سحب المكافآت",
    chatAdmin: "مراسلة المالك",
    telegramNote: "البرنامج نفسه متاح أيضًا على Telegram:",
    testiTitle: "آراء Mitra Referral",
    loading: "جارٍ التحميل…",
    testiEmpty:
      "لا توجد آراء من Mitra Referral بعد. كن الأول — أنشئ مجموعتك وابدأ بدعوة المقربين منك.",
    evJoin: "انضم",
    evWithdraw: "سحب",
    evReview: "رأي",
    joined: (n) => `انضم ${n} كشريك Mitra Referral.`,
    withdrew: (n, a) => `سحب ${n} مكافأة قدرها ${a}.`,
  },
  "ru-RU": {
    title: "Реферальный партнёр",
    step1Title: "Связаться с владельцем",
    step2Title: "Сообщение, чтобы поделиться со знакомыми",
    notesTitle: "Схема дохода",
    downloadImage: "Скачать изображение",
    msgLabel: "Сообщение",
    home: "Главная",
    intro:
      "Станьте реферальным партнёром PartnerFind и зарабатывайте на каждом приглашённом.",
    howTitle: "Как это работает",
    steps: [
      "Создайте группу WhatsApp с названием PartnerFind.",
      "Пригласите своих близких.",
      "Отправьте сообщение-приглашение ниже в свою группу.",
      "Попросите участников группы поделиться им со своими знакомыми.",
      "Группа заполнена? Создайте новую группу.",
    ],
    rulesTitle: "Правила",
    rules: [
      "Плату за регистрацию может установить сам регистрирующийся или пригласивший его реферальный партнёр.",
      "Вы получаете 50% от платы за регистрацию каждого приглашённого вами человека.",
      "Плюс до 50% от комиссии платформы каждый раз, когда приглашённый вами человек успешно достигает соглашения, — навсегда.",
    ],
    inviteTitle: "Сообщение-приглашение",
    inviteText:
      "PartnerFind связывает людей, ищущих экономические возможности, с теми, кто эти возможности предоставляет.\n\n" +
      `Зарегистрируйтесь через наш сайт: ${SITE_LINK}`,
    copy: "Копировать сообщение",
    copied: "Скопировано ✓",
    step1Text: "Напишите владельцу через кнопку ниже, чтобы стать реферальным партнёром.",
    step3Title: "Получайте вознаграждения",
    step3Text: "Каждый приглашённый вами человек приносит вам вознаграждения по схеме ниже. Вывести их можно через чат с владельцем.",
    withdrawTitle: "Вывод вознаграждений",
    chatAdmin: "Написать владельцу",
    telegramNote: "Та же программа также доступна в Telegram:",
    testiTitle: "Отзывы Mitra Referral",
    loading: "Загрузка…",
    testiEmpty:
      "Отзывов Mitra Referral пока нет. Станьте первым — создайте свою группу и начните приглашать близких.",
    evJoin: "Присоединился",
    evWithdraw: "Вывод",
    evReview: "Отзыв",
    joined: (n) => `${n} присоединился как Mitra Referral.`,
    withdrew: (n, a) => `${n} вывел вознаграждение в размере ${a}.`,
  },
  "ko-KR": {
    title: "추천 파트너",
    step1Title: "소유자에게 문의",
    step2Title: "아는 사람들에게 공유할 메시지",
    notesTitle: "수익 구조",
    downloadImage: "이미지 다운로드",
    msgLabel: "메시지",
    home: "홈",
    intro:
      "PartnerFind 추천 파트너가 되어 초대하는 모든 사람으로부터 수익을 얻으세요.",
    howTitle: "이용 방법",
    steps: [
      "PartnerFind라는 이름의 WhatsApp 그룹을 만드세요.",
      "가까운 사람들을 초대하세요.",
      "아래 초대 메시지를 그룹에 보내세요.",
      "그룹 멤버들에게도 지인에게 공유해 달라고 하세요.",
      "그룹이 가득 찼나요? 새 그룹을 만드세요.",
    ],
    rulesTitle: "규칙",
    rules: [
      "등록비는 등록하는 본인이나 초대한 추천 파트너가 정할 수 있습니다.",
      "초대한 모든 사람의 등록비 중 50%를 받습니다.",
      "또한 초대한 사람이 성공적으로 합의에 도달할 때마다 플랫폼 수수료의 최대 50%를 영원히 받습니다.",
    ],
    inviteTitle: "초대 메시지",
    inviteText:
      "PartnerFind는 경제 기회를 찾는 분들과 기회를 제공하는 분들을 연결해 드립니다.\n\n" +
      `웹사이트에서 가입하세요: ${SITE_LINK}`,
    copy: "메시지 복사",
    copied: "복사됨 ✓",
    step1Text: "아래 버튼으로 소유자에게 문의해 추천 파트너를 시작하세요.",
    step3Title: "보상 받기",
    step3Text: "초대한 사람마다 아래 구조에 따라 보상이 지급됩니다. 보상은 소유자 채팅으로 출금할 수 있습니다.",
    withdrawTitle: "보상 출금",
    chatAdmin: "소유자에게 문의",
    telegramNote: "Telegram에서도 같은 프로그램을 이용할 수 있습니다:",
    testiTitle: "Mitra Referral 이용 후기",
    loading: "불러오는 중…",
    testiEmpty:
      "아직 Mitra Referral 후기가 없습니다. 첫 번째가 되어 보세요 — 그룹을 만들고 가까운 사람들을 초대해 보세요.",
    evJoin: "가입",
    evWithdraw: "출금",
    evReview: "후기",
    joined: (n) => `${n}님이 Mitra Referral로 가입했습니다.`,
    withdrew: (n, a) => `${n}님이 ${a}의 보상을 출금했습니다.`,
  },
  "pt-PT": {
    title: "Parceiro de Indicação",
    step1Title: "Contactar o Proprietário",
    step2Title: "Mensagem para Partilhar com Pessoas que Conhece",
    notesTitle: "Esquema de Rendimentos",
    downloadImage: "Descarregar Imagem",
    msgLabel: "Mensagem",
    home: "Início",
    intro:
      "Torne-se Parceiro de Indicação da PartnerFind e ganhe com cada pessoa que convidar.",
    howTitle: "Como Funciona",
    steps: [
      "Crie um grupo de WhatsApp chamado PartnerFind.",
      "Convide as pessoas mais próximas de si.",
      "Envie a mensagem de convite abaixo para o seu grupo.",
      "Peça aos membros do grupo que a partilhem com os seus contactos.",
      "Grupo cheio? Crie um novo grupo.",
    ],
    rulesTitle: "Regras",
    rules: [
      "A taxa de registo pode ser definida pela própria pessoa que se regista ou pelo Parceiro de Indicação que a convida.",
      "Recebe 50% da taxa de registo de cada pessoa que convidar.",
      "Mais até 50% da comissão da plataforma sempre que alguém que convidou consegue chegar a um acordo — para sempre.",
    ],
    inviteTitle: "Mensagem de Convite",
    inviteText:
      "A PartnerFind conecta quem procura oportunidades económicas com quem oferece oportunidades.\n\n" +
      `Inscreva-se no nosso site: ${SITE_LINK}`,
    copy: "Copiar Mensagem",
    copied: "Copiado ✓",
    step1Text: "Fale com o proprietário pelo botão abaixo para começar como Parceiro de Indicação.",
    step3Title: "Receba as suas Recompensas",
    step3Text: "Cada pessoa que convidar gera-lhe recompensas segundo o esquema abaixo. Os levantamentos fazem-se pelo chat com o proprietário.",
    withdrawTitle: "Levantar Recompensas",
    chatAdmin: "Falar com o Proprietário",
    telegramNote: "O mesmo programa também está disponível no Telegram:",
    testiTitle: "Testemunhos Mitra Referral",
    loading: "A carregar…",
    testiEmpty:
      "Ainda não há testemunhos de Mitra Referral. Seja o primeiro — crie o seu grupo e comece a convidar as pessoas mais próximas.",
    evJoin: "Aderiu",
    evWithdraw: "Levantamento",
    evReview: "Testemunho",
    joined: (n) => `${n} aderiu como Mitra Referral.`,
    withdrew: (n, a) => `${n} levantou uma recompensa de ${a}.`,
  },
  "zh-CN": {
    title: "推荐伙伴",
    step1Title: "联系所有者",
    step2Title: "分享给你认识的人的消息",
    notesTitle: "收入方案",
    downloadImage: "下载图片",
    msgLabel: "消息",
    home: "首页",
    intro:
      "成为 PartnerFind 推荐伙伴，从你邀请的每一个人身上获得收入。",
    howTitle: "如何运作",
    steps: [
      "创建一个名为 PartnerFind 的 WhatsApp 群组。",
      "邀请你最亲近的人。",
      "将下面的邀请消息发送到你的群组。",
      "请群组成员也分享给他们的熟人。",
      "群组满了？再创建一个新群组。",
    ],
    rulesTitle: "规则",
    rules: [
      "注册费可由注册人本人或邀请他的推荐伙伴决定。",
      "你可获得所邀请的每个人的注册费的 50%。",
      "此外，每当你邀请的人成功达成协议时，你还可获得平台佣金的最高 50% — 永久有效。",
    ],
    inviteTitle: "邀请消息",
    inviteText:
      "PartnerFind 连接寻找经济机会的人与提供机会的人。\n\n" +
      `通过我们的网站注册：${SITE_LINK}`,
    copy: "复制消息",
    copied: "已复制 ✓",
    step1Text: "通过下方按钮联系所有者，开始成为推荐伙伴。",
    step3Title: "领取奖励",
    step3Text: "你邀请的每个人都会按下方方案为你带来奖励。奖励可通过所有者聊天提取。",
    withdrawTitle: "提取奖励",
    chatAdmin: "联系所有者",
    telegramNote: "Telegram 上也提供同一计划：",
    testiTitle: "Mitra Referral 用户评价",
    loading: "加载中…",
    testiEmpty:
      "尚无 Mitra Referral 评价。成为第一个 — 创建你的群组，开始邀请你最亲近的人。",
    evJoin: "加入",
    evWithdraw: "提取",
    evReview: "评价",
    joined: (n) => `${n} 已加入成为 Mitra Referral。`,
    withdrew: (n, a) => `${n} 提取了 ${a} 的奖励。`,
  },
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/45">
      {children}
    </h2>
  );
}

export default function Pengundang() {
  const { locale } = useLanguage();
  const s = STRINGS[locale] || STRINGS["id-ID"];
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const copyMsg = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIdx(i);
    window.setTimeout(() => setCopiedIdx(null), 2500);
  };
  const downloadImage = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground antialiased">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-3 py-3">
          <span className="text-base font-black tracking-tight">PartnerFind</span>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/" className="text-sm text-foreground/50 transition-colors hover:text-foreground">
              {s.home}
            </Link>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-xl px-3 pb-8 pt-6 sm:pb-10">
        <h1 className="text-3xl font-bold tracking-tight">{s.title}</h1>
        <p className="mt-3 leading-relaxed text-foreground/65">{s.intro}</p>

        <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${MITRA_VIDEO[locale] || MITRA_VIDEO["id-ID"]}?rel=0&modestbranding=1`}
            title={`PartnerFind — ${s.title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>

        <section className="mt-8">
          <SectionTitle>{s.howTitle}</SectionTitle>
          <div className="mt-4 space-y-6">
            <div className="relative flex items-stretch">
              <div className="relative flex flex-col items-center mr-3.5 sm:mr-4 shrink-0">
                <NumBadge n={1} />
                <div
                  className="w-[1.5px] bg-white/20 flex-1"
                  style={{ marginBottom: "-24px" }}
                />
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <h3 className="text-[17px] sm:text-[18.5px] font-bold mb-2 leading-snug text-white">{s.step1Title}</h3>
                <p className="text-[15.5px] sm:text-[16px] text-zinc-200 leading-relaxed mb-3">{s.step1Text}</p>
                <a
                  href={ADMIN_WA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] font-medium text-zinc-100"
                >
                  {s.chatAdmin}
                </a>
              </div>
            </div>

            <div className="relative flex items-stretch">
              <div className="relative flex flex-col items-center mr-3.5 sm:mr-4 shrink-0">
                <NumBadge n={2} />
                <div
                  className="w-[1.5px] bg-white/20 flex-1"
                  style={{ marginBottom: "-24px" }}
                />
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <h3 className="text-[17px] sm:text-[18.5px] font-bold mb-2 leading-snug text-white">{s.step2Title}</h3>
                <div className="mt-3 space-y-4">
                  {MSG_MEDIA.map((m, i) => { const text = (MSG_TEXTS[locale] ?? MSG_TEXTS["en-US"])[i]; return (
                    <div key={i}>
                      <p className="text-xs text-foreground/45 mb-1.5 text-right">
                        {s.msgLabel} {i + 1}
                      </p>
                      <div className="flex justify-end">
                        <div className="w-full rounded-2xl rounded-tr-sm bg-[#005c4b] p-2 shadow-md">
                          {m.img && (
                            <div className="rounded-xl overflow-hidden">
                              <img
                                src={m.img}
                                alt=""
                                loading="lazy"
                                className="w-full h-auto"
                              />
                            </div>
                          )}
                          <p className="whitespace-pre-line px-1.5 pt-2 text-[14.5px] leading-relaxed text-white">
                            {text}
                          </p>
                          <div className="flex justify-end px-1.5 pb-0.5 pt-0.5">
                            <span className="text-[11px] leading-none text-sky-300">✓✓</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2 justify-end">
                        {m.full && m.name && (
                          <button
                            onClick={() => downloadImage(m.full!, m.name!)}
                            className="rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] font-medium text-zinc-100"
                          >
                            {s.downloadImage}
                          </button>
                        )}
                        <button
                          onClick={() => copyMsg(text, i)}
                          className="rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] font-medium text-zinc-100"
                        >
                          {copiedIdx === i ? s.copied : s.copy}
                        </button>
                      </div>
                    </div>
                  ); })}
                </div>
              </div>
            </div>
            <div className="relative flex items-stretch">
              <div className="relative flex flex-col items-center mr-3.5 sm:mr-4 shrink-0">
                <NumBadge n={3} />
              </div>
              <div className="pb-1 flex-1 min-w-0">
                <h3 className="text-[17px] sm:text-[18.5px] font-bold mb-2 leading-snug text-white">{s.step3Title}</h3>
                <p className="text-[15.5px] sm:text-[16px] text-zinc-200 leading-relaxed">{s.step3Text}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle>{s.notesTitle}</SectionTitle>
          <div className="mt-4 space-y-6">
            {s.rules.map((r, i) => (
              <div key={i} className="relative flex items-stretch">
                <div className="relative flex flex-col items-center mr-3.5 sm:mr-4 shrink-0">
                  <NumBadge n={i + 1} />
                  {i < s.rules.length - 1 && (
                    <div
                      className="w-[1.5px] bg-white/20 flex-1"
                      style={{ marginBottom: "-24px" }}
                    />
                  )}
                </div>
                <div className="pb-1 flex-1 min-w-0">
                  <p className="text-[15.5px] sm:text-[16px] text-zinc-200 leading-relaxed font-normal">{r}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <SectionTitle>{s.withdrawTitle}</SectionTitle>
          <div className="mt-4">
            <a
              href={ADMIN_WA}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] font-medium text-zinc-100"
            >
              {s.chatAdmin}
            </a>
          </div>
          <p className="mt-3 text-sm text-foreground/50">
            {s.telegramNote}{" "}
            <a href={BOT_LINK} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-foreground">
              @Partnerfindreal_bot
            </a>
          </p>
        </section>

        <footer className="mt-10 border-t border-border/60 pt-4 text-xs text-foreground/40">
          © 2026 PartnerFind
        </footer>
      </div>
    </div>
  );
}
