import { Locale } from "../lib/translations";

export interface ModalContent {
  about: {
    intro: string;
    flowTitle: string;
    steps: { bold: string; text: string }[];
  };
  contact: {
    intro: string;
    email?: string;
    phone?: string;
  };
  privacy: {
    intro: string;
    points: string[];
  };
  terms: {
    intro: string;
    points: string[];
  };
}

const legalModalData: Record<Locale, ModalContent> = {
  "id-ID": {
    about: {
      intro: "PartnerFind menghubungkan Pencari Peluang dengan Pemberi Peluang di berbagai industri dan skala. Tim kami mencocokkan kedua pihak berdasarkan kebutuhan dan penawaran masing-masing, lalu mempertemukan mereka agar dapat berdiskusi dan mencapai kesepakatan kerja sama. PartnerFind juga menyediakan pelatihan agar pemula siap memanfaatkan peluang yang ada.",
      flowTitle: "Cara Kerja PartnerFind:",
      steps: [
        { bold: "Daftar sebagai Pencari atau Pemberi", text: "Isi formulir dan pilih peranmu." },
        { bold: "Pencocokan dan Verifikasi Identitas", text: "Kami mencocokkan mitra dan memverifikasi identitas kedua pihak." },
        { bold: "Buat Grup dan Mulai Berkolaborasi", text: "Kami membuat grup untuk berdiskusi, mencapai kesepakatan, dan bekerja sama." },
      ],
    },
    contact: {
      intro: "Ada pertanyaan tentang PartnerFind atau peluang kerja sama? Sampaikan melalui formulir pendaftaran di situs ini, atau hubungi orang yang membagikan tautan PartnerFind kepada Anda — tim kami akan menindaklanjutinya.",
    },
    privacy: {
      intro: "Kami menghargai privasi Anda. Berikut cara data Anda digunakan di PartnerFind:",
      points: [
        "Data yang Anda kirim lewat formulir digunakan untuk mencocokkan Anda dengan mitra dan memverifikasi identitas kedua pihak.",
        "Saat Anda dicocokkan, hanya informasi yang diperlukan yang dibagikan kepada calon mitra agar Anda bisa berdiskusi.",
        "Formulir disediakan oleh Tally; pengiriman data lewat formulir ditangani oleh penyedia eksternal tersebut.",
        "Kami tidak menjual data pribadi Anda.",
        "Hindari mengirimkan informasi sensitif yang tidak diperlukan untuk pencocokan.",
      ],
    },
    terms: {
      intro: "Dengan mengakses dan menggunakan platform PartnerFind, Anda menyetujui ketentuan berikut:",
      points: [
        "PartnerFind mempertemukan Pencari Peluang dan Pemberi Peluang; setiap kesepakatan kerja sama dibuat langsung antara kedua pihak.",
        "PartnerFind tidak menjamin penghasilan, keuntungan, atau tercapainya kesepakatan.",
        "Kirimkan hanya informasi yang benar dan yang berhak Anda bagikan.",
        "Formulir pendaftaran ditangani oleh Tally sebagai penyedia formulir eksternal.",
        "Dilarang menggunakan situs atau formulir untuk spam, penipuan, atau kegiatan melanggar hukum.",
      ],
    },
  },
  "en-US": {
    about: {
      intro: "PartnerFind connects Opportunity Seekers with Opportunity Providers across various industries and scales. Our team matches both sides based on their needs and offers, then helps connect them so they can discuss and reach a cooperation agreement. PartnerFind also provides training to help beginners get ready to use the opportunities.",
      flowTitle: "How PartnerFind Works:",
      steps: [
        { bold: "Register as a Seeker or Provider", text: "Fill in the form and choose your role." },
        { bold: "Matching and Identity Verification", text: "We match partners and verify the identity of both parties." },
        { bold: "Create a Group and Start Collaborating", text: "We create a group to discuss, reach an agreement, and work together." },
      ],
    },
    contact: {
      intro: "Have questions about PartnerFind or a cooperation opportunity? Reach us through the registration form on this site, or contact the person who shared the PartnerFind link with you — our team will follow up.",
    },
    privacy: {
      intro: "We respect your privacy. Here is how your data is used on PartnerFind:",
      points: [
        "The data you submit through the form is used to match you with partners and to verify the identity of both parties.",
        "When you are matched, only the information needed is shared with the prospective partner so you can discuss working together.",
        "Forms are provided by Tally; data submitted through the forms is handled by that external provider.",
        "We do not sell your personal data.",
        "Avoid submitting sensitive information that is not needed for matching.",
      ],
    },
    terms: {
      intro: "By accessing and using the PartnerFind platform, you agree to the following terms:",
      points: [
        "PartnerFind brings Opportunity Seekers and Opportunity Providers together; any cooperation agreement is made directly between the two parties.",
        "PartnerFind does not guarantee income, profit, or that an agreement will be reached.",
        "Submit only information that is accurate and that you are authorized to share.",
        "Registration forms are handled by Tally, an external form provider.",
        "Do not use the site or its forms for spam, fraud, or unlawful activity.",
      ],
    },
  },
  "es-ES": {
    about: {
      intro: "PartnerFind conecta a Buscadores de Oportunidades con Proveedores de Oportunidades de diversas industrias y escalas. Nuestro equipo empareja a ambas partes según sus necesidades y ofertas, y luego ayuda a conectarlas para que puedan conversar y llegar a un acuerdo de colaboración. PartnerFind también ofrece formación para que los principiantes estén listos para aprovechar las oportunidades.",
      flowTitle: "Cómo Funciona PartnerFind:",
      steps: [
        { bold: "Regístrate como Buscador o Proveedor", text: "Completa el formulario y elige tu rol." },
        { bold: "Emparejamiento y Verificación de Identidad", text: "Emparejamos socios y verificamos la identidad de ambas partes." },
        { bold: "Crea un Grupo y Empieza a Colaborar", text: "Creamos un grupo para discutir, llegar a un acuerdo y trabajar juntos." },
      ],
    },
    contact: {
      intro: "¿Tienes preguntas sobre PartnerFind o una oportunidad de colaboración? Escríbenos mediante el formulario de registro de este sitio, o contacta a la persona que te compartió el enlace de PartnerFind: nuestro equipo te responderá.",
    },
    privacy: {
      intro: "Respetamos tu privacidad. Así es como se utilizan tus datos en PartnerFind:",
      points: [
        "Los datos que envías mediante el formulario se utilizan para emparejarte con socios y verificar la identidad de ambas partes.",
        "Cuando se te empareja, solo se comparte la información necesaria con el posible socio para que podáis conversar.",
        "Los formularios los proporciona Tally; los datos enviados a través de ellos los gestiona ese proveedor externo.",
        "No vendemos tus datos personales.",
        "Evita enviar información sensible que no sea necesaria para el emparejamiento.",
      ],
    },
    terms: {
      intro: "Al acceder y utilizar la plataforma PartnerFind, aceptas los siguientes términos:",
      points: [
        "PartnerFind reúne a Buscadores y Proveedores de Oportunidades; cualquier acuerdo de colaboración se realiza directamente entre ambas partes.",
        "PartnerFind no garantiza ingresos, ganancias ni que se llegue a un acuerdo.",
        "Envía solo información veraz y que tengas autorización para compartir.",
        "Los formularios de registro los gestiona Tally, un proveedor externo de formularios.",
        "No uses el sitio ni sus formularios para spam, fraude o actividades ilegales.",
      ],
    },
  },
  "fr-FR": {
    about: {
      intro: "PartnerFind met en relation les Chercheurs d'Opportunités et les Fournisseurs d'Opportunités de divers secteurs et de toutes tailles. Notre équipe associe les deux parties selon leurs besoins et leurs offres, puis les aide à entrer en contact pour discuter et parvenir à un accord de coopération. PartnerFind propose également des formations pour aider les débutants à se préparer à saisir les opportunités.",
      flowTitle: "Comment Fonctionne PartnerFind :",
      steps: [
        { bold: "Inscrivez-vous comme Chercheur ou Fournisseur", text: "Remplissez le formulaire et choisissez votre rôle." },
        { bold: "Mise en Relation et Vérification d'Identité", text: "Nous mettons en relation des partenaires et vérifions l'identité des deux parties." },
        { bold: "Créez un Groupe et Commencez à Collaborer", text: "Nous créons un groupe pour discuter, parvenir à un accord et travailler ensemble." },
      ],
    },
    contact: {
      intro: "Des questions sur PartnerFind ou une opportunité de coopération ? Écrivez-nous via le formulaire d'inscription de ce site, ou contactez la personne qui vous a partagé le lien PartnerFind — notre équipe vous répondra.",
    },
    privacy: {
      intro: "Nous respectons votre vie privée. Voici comment vos données sont utilisées sur PartnerFind :",
      points: [
        "Les données que vous transmettez via le formulaire servent à vous mettre en relation avec des partenaires et à vérifier l'identité des deux parties.",
        "Lorsqu'une mise en relation a lieu, seules les informations nécessaires sont partagées avec le partenaire potentiel afin que vous puissiez discuter.",
        "Les formulaires sont fournis par Tally ; les données transmises via ces formulaires sont traitées par ce fournisseur externe.",
        "Nous ne vendons pas vos données personnelles.",
        "Évitez de transmettre des informations sensibles qui ne sont pas nécessaires à la mise en relation.",
      ],
    },
    terms: {
      intro: "En accédant à la plateforme PartnerFind et en l'utilisant, vous acceptez les conditions suivantes :",
      points: [
        "PartnerFind met en relation les Chercheurs et les Fournisseurs d'Opportunités ; tout accord de coopération est conclu directement entre les deux parties.",
        "PartnerFind ne garantit ni revenus, ni bénéfices, ni la conclusion d'un accord.",
        "Ne transmettez que des informations exactes et que vous êtes autorisé à partager.",
        "Les formulaires d'inscription sont gérés par Tally, un fournisseur externe de formulaires.",
        "N'utilisez pas le site ni ses formulaires pour du spam, de la fraude ou des activités illégales.",
      ],
    },
  },
  "ja-JP": {
    about: {
      intro: "PartnerFindは、さまざまな業界・規模の機会を探す側と機会を提供する側をつなぎます。私たちのチームが双方のニーズと提供内容に基づいてマッチングし、話し合いと協力の合意に至れるよう接続をお手伝いします。また、初心者の方が機会を活かせるよう、研修も提供しています。",
      flowTitle: "PartnerFindの利用の流れ：",
      steps: [
        { bold: "探す側・提供する側として登録", text: "フォームに記入し、役割を選んでください。" },
        { bold: "マッチングと本人確認", text: "パートナーをマッチングし、双方の本人確認を行います。" },
        { bold: "グループを作成して協力を開始", text: "話し合い、合意し、協力するためのグループを作成します。" },
      ],
    },
    contact: {
      intro: "PartnerFindや協力の機会についてご質問がある場合は、このサイトの登録フォームから、またはPartnerFindのリンクを共有してくれた方を通してご連絡ください。チームが対応いたします。",
    },
    privacy: {
      intro: "私たちはあなたのプライバシーを尊重します。PartnerFindにおけるデータの利用方法は次のとおりです：",
      points: [
        "フォームから送信されたデータは、パートナーとのマッチングおよび双方の本人確認に使用されます。",
        "マッチングされた場合、話し合いに必要な情報のみが相手候補と共有されます。",
        "フォームはTallyが提供しており、フォームから送信されたデータはその外部提供者が処理します。",
        "私たちがあなたの個人データを販売することはありません。",
        "マッチングに不要な機密情報は送信しないでください。",
      ],
    },
    terms: {
      intro: "PartnerFindプラットフォームにアクセスし利用することで、以下の条件に同意したものとみなされます：",
      points: [
        "PartnerFindは機会を探す側と提供する側を引き合わせます。協力に関する合意は、両当事者間で直接結ばれるものです。",
        "PartnerFindは、収入、利益、または合意の成立を保証するものではありません。",
        "正確で、共有する権限のある情報のみを送信してください。",
        "登録フォームは外部のフォーム提供者であるTallyが処理します。",
        "スパム、詐欺、または違法行為のためにサイトやフォームを使用しないでください。",
      ],
    },
  },
  "zh-CN": {
    about: {
      intro: "PartnerFind 连接来自各行各业、不同规模的机会寻找者与机会提供者。我们的团队根据双方的需求与供给进行匹配，并帮助双方建立联系，以便商讨并达成合作协议。PartnerFind 还提供培训，帮助新手做好把握机会的准备。",
      flowTitle: "PartnerFind 的运作方式：",
      steps: [
        { bold: "注册成为寻找者或提供者", text: "填写表单并选择您的角色。" },
        { bold: "匹配与身份验证", text: "我们匹配伙伴，并验证双方的身份。" },
        { bold: "创建群组并开始协作", text: "我们创建群组，以便讨论、达成协议并共同合作。" },
      ],
    },
    contact: {
      intro: "对 PartnerFind 或合作机会有疑问？请通过本站的注册表联系我们，或联系将 PartnerFind 链接分享给您的人——我们的团队会跟进处理。",
    },
    privacy: {
      intro: "我们尊重您的隐私。以下是您的数据在 PartnerFind 中的使用方式：",
      points: [
        "您通过表单提交的数据将用于为您匹配伙伴，并核实双方的身份。",
        "当您被匹配时，只会与潜在伙伴分享讨论所需的信息。",
        "表单由 Tally 提供；通过表单提交的数据由该外部服务商处理。",
        "我们不会出售您的个人数据。",
        "请避免提交匹配不需要的敏感信息。",
      ],
    },
    terms: {
      intro: "访问并使用 PartnerFind 平台，即表示您同意以下条款：",
      points: [
        "PartnerFind 为机会寻找者与机会提供者牵线搭桥；任何合作协议均由双方直接达成。",
        "PartnerFind 不保证收入、利润或一定能达成协议。",
        "请只提交真实且您有权分享的信息。",
        "注册表由外部表单服务商 Tally 处理。",
        "请勿将本网站或表单用于垃圾信息、欺诈或违法活动。",
      ],
    },
  },
  "ar-SA": {
    about: {
      intro: "يربط PartnerFind الباحثين عن الفرص بمقدّمي الفرص من مختلف الصناعات والأحجام. يقوم فريقنا بمطابقة الطرفين بناءً على احتياجاتهما وعروضهما، ثم يساعد في وصلهما ببعضهما لمناقشة التعاون والتوصل إلى اتفاق. كما يوفر PartnerFind تدريبًا لمساعدة المبتدئين على الاستعداد للاستفادة من الفرص.",
      flowTitle: "كيف يعمل PartnerFind:",
      steps: [
        { bold: "سجّل كباحث عن فرصة أو مقدّم لها", text: "املأ النموذج واختر دورك." },
        { bold: "المطابقة والتحقق من الهوية", text: "نطابق الشركاء ونتحقق من هوية الطرفين." },
        { bold: "أنشئ مجموعة وابدأ التعاون", text: "ننشئ مجموعة للنقاش والتوصل إلى اتفاق والعمل معًا." },
      ],
    },
    contact: {
      intro: "هل لديك أسئلة حول PartnerFind أو فرصة تعاون؟ تواصل معنا عبر نموذج التسجيل في هذا الموقع، أو اتصل بالشخص الذي شارك معك رابط PartnerFind — وسيقوم فريقنا بالمتابعة.",
    },
    privacy: {
      intro: "نحترم خصوصيتك. إليك كيفية استخدام بياناتك في PartnerFind:",
      points: [
        "تُستخدم البيانات التي ترسلها عبر النموذج لمطابقتك مع الشركاء والتحقق من هوية الطرفين.",
        "عند مطابقتك، تتم مشاركة المعلومات الضرورية فقط مع الشريك المحتمل حتى تتمكنا من المناقشة.",
        "النماذج مقدمة من Tally؛ والبيانات المرسلة عبرها تعالجها تلك الجهة الخارجية.",
        "لا نبيع بياناتك الشخصية.",
        "تجنب إرسال معلومات حساسة غير ضرورية لعملية المطابقة.",
      ],
    },
    terms: {
      intro: "باستخدامك منصة PartnerFind والوصول إليها، فأنت توافق على الشروط التالية:",
      points: [
        "يجمع PartnerFind بين الباحثين عن الفرص ومقدّميها؛ وأي اتفاق تعاون يتم مباشرة بين الطرفين.",
        "لا يضمن PartnerFind أي دخل أو ربح أو التوصل إلى اتفاق.",
        "أرسل فقط المعلومات الصحيحة والتي يحق لك مشاركتها.",
        "تتم معالجة نماذج التسجيل بواسطة Tally، وهي جهة خارجية مقدمة للنماذج.",
        "لا تستخدم الموقع أو نماذجه للبريد المزعج أو الاحتيال أو الأنشطة غير القانونية.",
      ],
    },
  },
  "ko-KR": {
    about: {
      intro: "PartnerFind는 다양한 산업과 규모의 기회를 찾는 사람과 기회를 제공하는 사람을 연결합니다. 저희 팀은 양쪽의 필요와 제안을 바탕으로 매칭하고, 서로 논의하여 협력 합의를 이룰 수 있도록 연결을 돕습니다. 또한 초보자가 기회를 잘 활용할 수 있도록 교육도 제공합니다.",
      flowTitle: "PartnerFind 이용 절차:",
      steps: [
        { bold: "찾는 사람 또는 제공하는 사람으로 등록", text: "양식을 작성하고 역할을 선택하세요." },
        { bold: "매칭 및 신원 확인", text: "파트너를 매칭하고 양측의 신원을 확인합니다." },
        { bold: "그룹을 만들고 협업 시작", text: "논의하고, 합의하고, 함께 일할 수 있도록 그룹을 만듭니다." },
      ],
    },
    contact: {
      intro: "PartnerFind나 협력 기회에 대해 궁금한 점이 있으신가요? 이 사이트의 등록 양식으로 문의하시거나, PartnerFind 링크를 공유해 준 분에게 연락해 주세요. 저희 팀이 답변드리겠습니다.",
    },
    privacy: {
      intro: "저희는 귀하의 개인정보를 존중합니다. PartnerFind에서 데이터가 사용되는 방식은 다음과 같습니다:",
      points: [
        "양식을 통해 제출한 데이터는 파트너 매칭과 양쪽의 신원 확인에 사용됩니다.",
        "매칭되면 논의를 위해 필요한 정보만 잠재 파트너와 공유됩니다.",
        "양식은 Tally가 제공하며, 양식으로 제출된 데이터는 해당 외부 제공업체가 처리합니다.",
        "저희는 귀하의 개인정보를 판매하지 않습니다.",
        "매칭에 필요하지 않은 민감한 정보는 제출하지 마세요.",
      ],
    },
    terms: {
      intro: "PartnerFind 플랫폼에 접속하고 이용함으로써 다음 조건에 동의하게 됩니다:",
      points: [
        "PartnerFind는 기회를 찾는 사람과 제공하는 사람을 연결합니다. 협력 합의는 양 당사자 간에 직접 이루어집니다.",
        "PartnerFind는 수입, 이익 또는 합의 성사를 보장하지 않습니다.",
        "정확하고 공유할 권한이 있는 정보만 제출하세요.",
        "등록 양식은 외부 양식 제공업체인 Tally가 처리합니다.",
        "사이트나 양식을 스팸, 사기 또는 불법 행위에 사용하지 마세요.",
      ],
    },
  },
  "pt-PT": {
    about: {
      intro: "O PartnerFind liga Procuradores de Oportunidades a Fornecedores de Oportunidades de vários setores e escalas. A nossa equipa combina os dois lados com base nas suas necessidades e ofertas e ajuda a ligá-los para que possam conversar e chegar a um acordo de cooperação. O PartnerFind também oferece formação para ajudar os iniciantes a preparem-se para aproveitar as oportunidades.",
      flowTitle: "Como Funciona o PartnerFind:",
      steps: [
        { bold: "Registe-se como Procurador ou Fornecedor", text: "Preencha o formulário e escolha o seu papel." },
        { bold: "Correspondência e Verificação de Identidade", text: "Combinamos parceiros e verificamos a identidade de ambas as partes." },
        { bold: "Crie um Grupo e Comece a Colaborar", text: "Criamos um grupo para discutir, chegar a um acordo e trabalhar juntos." },
      ],
    },
    contact: {
      intro: "Tem dúvidas sobre o PartnerFind ou uma oportunidade de cooperação? Fale connosco através do formulário de registo deste site, ou contacte a pessoa que partilhou consigo a ligação do PartnerFind — a nossa equipa dará seguimento.",
    },
    privacy: {
      intro: "Respeitamos a sua privacidade. É assim que os seus dados são utilizados no PartnerFind:",
      points: [
        "Os dados que envia através do formulário são utilizados para o ligar a parceiros e verificar a identidade de ambas as partes.",
        "Quando é feita a correspondência, apenas as informações necessárias são partilhadas com o potencial parceiro para que possam conversar.",
        "Os formulários são fornecidos pela Tally; os dados enviados através deles são tratados por esse fornecedor externo.",
        "Não vendemos os seus dados pessoais.",
        "Evite enviar informações sensíveis que não sejam necessárias para a correspondência.",
      ],
    },
    terms: {
      intro: "Ao aceder e utilizar a plataforma PartnerFind, concorda com os seguintes termos:",
      points: [
        "O PartnerFind reúne Procuradores e Fornecedores de Oportunidades; qualquer acordo de cooperação é feito diretamente entre as duas partes.",
        "O PartnerFind não garante rendimentos, lucros nem a concretização de um acordo.",
        "Envie apenas informações verdadeiras e que tenha autorização para partilhar.",
        "Os formulários de registo são tratados pela Tally, um fornecedor externo de formulários.",
        "Não utilize o site nem os seus formulários para spam, fraude ou atividades ilegais.",
      ],
    },
  },
  "ru-RU": {
    about: {
      intro: "PartnerFind соединяет искателей возможностей с поставщиками возможностей в различных отраслях и масштабах. Наша команда подбирает обе стороны на основе их потребностей и предложений, а затем знакомит их, чтобы они могли обсудить и достичь соглашения о сотрудничестве. PartnerFind также проводит обучение, чтобы новички были готовы воспользоваться имеющимися возможностями.",
      flowTitle: "Как работает PartnerFind:",
      steps: [
        { bold: "Зарегистрируйтесь как искатель или поставщик", text: "Заполните форму и выберите свою роль." },
        { bold: "Подбор и проверка личности", text: "Мы подбираем партнёров и проверяем личность обеих сторон." },
        { bold: "Создайте группу и начните сотрудничать", text: "Мы создаём группу для обсуждения, достижения соглашения и совместной работы." },
      ],
    },
    contact: {
      intro: "Есть вопросы о PartnerFind или возможности сотрудничества? Напишите через форму регистрации на этом сайте или свяжитесь с человеком, который поделился с вами ссылкой PartnerFind, — наша команда ответит вам.",
    },
    privacy: {
      intro: "Мы уважаем вашу конфиденциальность. Вот как ваши данные используются в PartnerFind:",
      points: [
        "Данные, которые вы отправляете через форму, используются для подбора партнёра и проверки личности обеих сторон.",
        "При подборе потенциальному партнёру передаётся только необходимая информация, чтобы вы могли обсудить сотрудничество.",
        "Формы предоставляются сервисом Tally; отправка данных через формы обрабатывается этим внешним поставщиком.",
        "Мы не продаём ваши персональные данные.",
        "Не отправляйте конфиденциальную информацию, которая не нужна для подбора.",
      ],
    },
    terms: {
      intro: "Получая доступ к платформе PartnerFind и используя её, вы соглашаетесь со следующими условиями:",
      points: [
        "PartnerFind знакомит искателей возможностей с поставщиками возможностей; каждое соглашение о сотрудничестве заключается напрямую между двумя сторонами.",
        "PartnerFind не гарантирует доход, прибыль или достижение соглашения.",
        "Отправляйте только достоверную информацию, которой вы вправе делиться.",
        "Форма регистрации обрабатывается Tally как внешним поставщиком форм.",
        "Запрещено использовать сайт или формы для спама, мошенничества или незаконной деятельности.",
      ],
    },
  },
};

export function getLegalModalData(locale: Locale): ModalContent {
  return legalModalData[locale] ?? legalModalData["id-ID"];
}
