// ข้อความหน้าจอ 2 ภาษา — ภาษาลาวเป็นค่าเริ่มต้น (พนักงานโค่ซี่ใช้ลาว/อังกฤษ)
export type Lang = "lo" | "en";

export const DEFAULT_LANG: Lang = "lo";
export const LANG_COOKIE = "lang";
export const LANGS: { id: Lang; label: string }[] = [
  { id: "lo", label: "ລາວ" },
  { id: "en", label: "EN" },
];

export const isLang = (v: unknown): v is Lang => v === "lo" || v === "en";

const M = {
  brand: { lo: "COSI Hotel", en: "COSI Hotel" },
  heroTitle: { lo: "ລະບົບການແຈ້ງບັນຫາ", en: "Problem Reporting System" },
  heroSub: {
    lo: "ມີບັນຫາຄອມພິວເຕີ, ອິນເຕີເນັດ ຫຼື ລະບົບໂຮງແຮມ? ແຊັດຫາທີມໄອທີໄດ້ທັນທີ",
    en: "Trouble with a computer, the internet or a hotel system? Chat with the IT team right away.",
  },

  heroStep1: { lo: "ກອກຂໍ້ມູນຂອງເຈົ້າ", en: "Your details" },
  heroStep2: { lo: "ເລືອກຫົວຂໍ້ບັນຫາ", en: "Pick a topic" },
  heroStep3: { lo: "ແຊັດກັບທີມໄອທີ", en: "Chat with IT" },


  step1Title: { lo: "1. ກະລຸນາກອກຂໍ້ມູນ", en: "1. Please fill in your details" },
  step1Hint: {
    lo: "ໃສ່ຂໍ້ມູນຄັ້ງດຽວ ເພື່ອໃຫ້ທີມໄອທີຮູ້ວ່າຕ້ອງໄປຊ່ວຍໃຜ ແລະ ທີ່ໃດ",
    en: "Enter this once so IT knows who to help and where.",
  },
  fieldName: { lo: "ຊື່ ແລະ ນາມສະກຸນ", en: "Full name" },
  fieldDept: { lo: "ພະແນກ", en: "Department" },
  fieldContact: { lo: "ເບີຕໍ່ພາຍໃນ / ເບີໂທ (ບໍ່ບັງຄັບ)", en: "Extension / phone (optional)" },
  deptPlaceholder: { lo: "ເລືອກພະແນກ", en: "Choose department" },
  saveProfile: { lo: "ບັນທຶກ", en: "Save" },
  saving: { lo: "ກຳລັງບັນທຶກ...", en: "Saving…" },
  cancel: { lo: "ຍົກເລີກ", en: "Cancel" },
  errNameRequired: { lo: "ກະລຸນາໃສ່ຊື່", en: "Please enter your name" },
  errDeptRequired: { lo: "ກະລຸນາເລືອກພະແນກ", en: "Please choose a department" },
  errSaveFailed: { lo: "ບັນທຶກບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", en: "Could not save. Please try again." },
  hello: { lo: "ສະບາຍດີ, {name}", en: "Hello, {name}" },
  switchUser: { lo: "ປ່ຽນຜູ້ໃຊ້", en: "Switch user" },

  step2Title: { lo: "2. ເລືອກຫົວຂໍ້ບັນຫາ", en: "2. Choose a problem topic" },
  step2Hint: { lo: "ເລືອກຫົວຂໍ້ທີ່ໃກ້ຄຽງທີ່ສຸດ", en: "Pick the closest topic." },
  urgentLabel: { lo: "ດ່ວນ — ກະທົບການບໍລິການແຂກ", en: "Urgent — guest service is affected" },
  urgentHint: {
    lo: "ໃຊ້ສະເພາະເມື່ອແຂກໄດ້ຮັບຜົນກະທົບ ຫຼື ເຮັດວຽກຕໍ່ບໍ່ໄດ້",
    en: "Only when guests are affected or work is completely blocked.",
  },

  startChat: { lo: "ເລີ່ມແຊັດກັບທີມໄອທີ", en: "Chat with IT" },
  pickTopicFirst: { lo: "ເລືອກຫົວຂໍ້ບັນຫາກ່ອນ", en: "Pick a topic first" },
  connecting: { lo: "ກຳລັງເຊື່ອມຕໍ່ແຊັດ...", en: "Connecting chat…" },
  chatError: {
    lo: "ເຊື່ອມຕໍ່ລະບົບແຊັດບໍ່ໄດ້ ກະລຸນາລອງໃໝ່ ຫຼື ແຈ້ງໄອທີໂດຍກົງ",
    en: "Cannot reach the chat system. Please retry, or contact IT directly.",
  },
  notConfigured: {
    lo: "ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ CHATWOOT_WEBSITE_TOKEN — ແຈ້ງຜູ້ດູແລລະບົບ",
    en: "CHATWOOT_WEBSITE_TOKEN is not set — tell the system administrator.",
  },
  chatHint: {
    lo: "ໜ້າຕ່າງແຊັດຈະເປີດຢູ່ມຸມຂວາລຸ່ມ ເຈົ້າສາມາດແນບຮູບໜ້າຈໍໄດ້",
    en: "The chat window opens at the bottom right. You can attach a screenshot.",
  },











  // ---- หน้าแรก: โปสเตอร์ QR (/) ----
  qrTitle: { lo: "QR Code ສຳລັບພະນັກງານ", en: "Staff QR code" },
  qrHint: {
    lo: "ພິມແລ້ວຕິດໃນຈຸດທີ່ພະນັກງານເຫັນງ່າຍ ສະແກນແລ້ວເຂົ້າໜ້າແຈ້ງບັນຫາໄດ້ທັນທີ",
    en: "Print it and post it where staff can see it. Scanning opens the problem-report page.",
  },
  qrUrlLabel: { lo: "ລິ້ງທີ່ໃສ່ໃນ QR", en: "Link encoded in the QR" },
  qrOnlyStaff: {
    lo: "QR ນີ້ພາໄປໜ້າພະນັກງານເທົ່ານັ້ນ (ບໍ່ແມ່ນໜ້າຂອງທີມໄອທີ)",
    en: "This QR opens the staff page only — never the IT console.",
  },
  qrLocalWarn: {
    lo: "ລິ້ງນີ້ເປັນ localhost — ມືຖືສະແກນແລ້ວເຂົ້າບໍ່ໄດ້ ໃຫ້ໃຊ້ IP ຂອງເຄື່ອງ ຫຼື ໂດເມນຈິງ",
    en: "This is a localhost link — phones cannot open it. Use the machine's IP or the real domain.",
  },
  qrPrint: { lo: "ພິມ", en: "Print" },
  qrPng: { lo: "ດາວໂຫຼດ PNG", en: "Download PNG" },
  qrSvg: { lo: "ດາວໂຫຼດ SVG", en: "Download SVG" },
  qrCopy: { lo: "ສຳເນົາລິ້ງ", en: "Copy link" },
  qrCopied: { lo: "ສຳເນົາແລ້ວ", en: "Copied" },
  qrInvalid: { lo: "ລິ້ງບໍ່ຖືກຕ້ອງ (ຕ້ອງຂຶ້ນຕົ້ນດ້ວຍ http:// ຫຼື https://)", en: "Invalid link (must start with http:// or https://)" },
  qrGoStaff: { lo: "ເປີດໜ້າແຈ້ງບັນຫາ (ບໍ່ຕ້ອງສະແກນ)", en: "Open the report page (no scan needed)" },
  qrGoAdmin: { lo: "ສຳລັບທີມໄອທີ", en: "IT team" },

  // ---- คอนโซลทีมไอที (/admin) ----
  admTitle: { lo: "Ticket Support", en: "Ticket Support" },
  admBrand: { lo: "IT Helpdesk", en: "IT Helpdesk" },
  admLoginTitle: { lo: "ເຂົ້າສູ່ລະບົບທີມໄອທີ", en: "IT team sign in" },
  admLoginHint: {
    lo: "ໃຊ້ອີເມວ ແລະ ລະຫັດຜ່ານ Chatwoot ຂອງເຈົ້າ",
    en: "Use your Chatwoot email and password.",
  },
  admEmail: { lo: "ອີເມວ", en: "Email" },
  admPassword: { lo: "ລະຫັດຜ່ານ", en: "Password" },
  admSignIn: { lo: "ເຂົ້າສູ່ລະບົບ", en: "Sign in" },
  admSigningIn: { lo: "ກຳລັງເຂົ້າສູ່ລະບົບ...", en: "Signing in…" },
  admLoginFailed: { lo: "ອີເມວ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ", en: "Wrong email or password." },
  admLoginForbidden: { lo: "ບັນຊີນີ້ບໍ່ມີສິດໃຊ້ລະບົບນີ້", en: "This account is not allowed here." },
  admLoginBusy: { lo: "ລອງຫຼາຍເກີນໄປ ກະລຸນາລໍຖ້າສອງສາມນາທີ", en: "Too many attempts. Please wait a few minutes." },
  admLoginDown: { lo: "ເຊື່ອມຕໍ່ Chatwoot ບໍ່ໄດ້", en: "Cannot reach Chatwoot." },
  admNotConfigured: {
    lo: "ຍັງບໍ່ໄດ້ຕັ້ງຄ່າ SESSION_SECRET — ແຈ້ງຜູ້ດູແລລະບົບ",
    en: "SESSION_SECRET is not set — tell the system administrator.",
  },
  admDemoBanner: {
    lo: "ໂໝດຕົວຢ່າງ — ຂໍ້ມູນທັງໝົດເປັນຂອງປອມ ບໍ່ແມ່ນແຊັດຈິງ. ເຂົ້າແບບຈິງທີ່",
    en: "Demo mode — all data is fake, not your real chats. Open the real console at",
  },
  admSignOut: { lo: "ອອກຈາກລະບົບ", en: "Sign out" },
  admBackToPortal: { lo: "ໜ້າພະນັກງານ", en: "Staff page" },
  admTabOpen: { lo: "ກຳລັງດຳເນີນ", en: "Open" },
  admTabResolved: { lo: "ແກ້ໄຂແລ້ວ", en: "Resolved" },
  admTabAll: { lo: "ທັງໝົດ", en: "All" },
  admChannel: { lo: "ຊ່ອງແຊັດ", en: "Channel" },
  admScopeMine: { lo: "ຂອງຂ້ອຍ", en: "Mine" },
  admLabels: { lo: "ປ້າຍກຳກັບ", en: "Labels" },
  admAllLabels: { lo: "ທຸກປ້າຍ", en: "All labels" },
  admLabelCountHint: {
    lo: "ເລກສີແດງ = ຂໍ້ຄວາມຍັງບໍ່ໄດ້ອ່ານ · ເລກສີຂີ້ເຖົ່າ = ງານເປີດຢູ່ / ທັງໝົດ",
    en: "Red = unread messages · Grey = open / total tasks",
  },
  admUrgent: { lo: "ດ່ວນ", en: "Urgent" },
  admSearch: { lo: "ຄົ້ນຫາຊື່ ຫຼື ຂໍ້ຄວາມ", en: "Search name or message" },
  admEmptyList: { lo: "ຍັງບໍ່ມີລາຍການແຈ້ງບັນຫາ", en: "No reports here yet" },
  admEmptyOpen: {
    lo: "ບໍ່ມີເຄສທີ່ເປີດຢູ່ — ທຸກເຄສຖືກປິດແລ້ວ ປະຫວັດແຊັດຍັງຢູ່ຄົບໃນແທັບ “ແກ້ໄຂແລ້ວ”",
    en: "No open cases — every case has been closed. Chat history is kept under “Resolved”.",
  },
  admViewResolved: { lo: "ເບິ່ງເຄສທີ່ແກ້ໄຂແລ້ວ ({n})", en: "View resolved cases ({n})" },
  admPickConv: { lo: "ເລືອກລາຍການທາງຊ້າຍເພື່ອເລີ່ມຕອບ", en: "Pick a report on the left to start replying" },
  admReplyPlaceholder: { lo: "ພິມຂໍ້ຄວາມຕອບກັບ... (Enter ເພື່ອສົ່ງ)", en: "Type a reply… (Enter to send)" },
  admNotePlaceholder: {
    lo: "ບັນທຶກພາຍໃນ ສະເພາະທີມງານທີ່ເຫັນ...",
    en: "Private note — only your team can see it…",
  },
  admSend: { lo: "ສົ່ງ", en: "Send" },
  admPrivateNote: { lo: "ບັນທຶກພາຍໃນ", en: "Private note" },
  admResolve: { lo: "ປິດເຄສ", en: "Resolve" },
  admCloseTitle: { lo: "ປິດເຄສ", en: "Close case" },
  admCloseHint: {
    lo: "ເລືອກຫົວຂໍ້ທີ່ແກ້ໄຂແລ້ວ ຂອງ {name}",
    en: "Tick the topics that are resolved for {name}",
  },
  admOpenTopics: { lo: "ຫົວຂໍ້ທີ່ຍັງບໍ່ໄດ້ປິດ", en: "Topics still open" },
  admSelectAll: { lo: "ເລືອກທັງໝົດ", en: "Select all" },
  admCloseAll: { lo: "ປິດເຄສທັງໝົດ", en: "Close the whole case" },
  admCloseSelected: { lo: "ປິດຫົວຂໍ້ທີ່ເລືອກ ({n})", en: "Close selected ({n})" },
  admCloseNoTopics: {
    lo: "ເຄສນີ້ບໍ່ມີຫົວຂໍ້ ປິດເຄສທັງໝົດໄດ້ເລີຍ",
    en: "This case has no topics — you can close it right away.",
  },
  admCloseStaysOpen: {
    lo: "ເຄສຍັງເປີດຢູ່ ເພາະຍັງມີຫົວຂໍ້ທີ່ບໍ່ໄດ້ເລືອກ",
    en: "The case stays open because some topics are not selected.",
  },
  admClosedTopics: { lo: "ປິດແລ້ວ", en: "Closed" },
  admClosing: { lo: "ກຳລັງປິດ...", en: "Closing…" },
  admCloseErr: { lo: "ປິດບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", en: "Could not close. Please try again." },
  admTopicNote: {
    lo: "ປິດຫົວຂໍ້: {topics} (ໂດຍ {name})",
    en: "Closed topics: {topics} (by {name})",
  },
  admReopen: { lo: "ເປີດໃໝ່", en: "Reopen" },
  admAssignMe: { lo: "ຮັບເລື່ອງນີ້", en: "Take this" },
  admAssignee: { lo: "ຜູ້ຮັບຜິດຊອບ", en: "Assignee" },
  admUnassigned: { lo: "ຍັງບໍ່ມີຜູ້ຮັບ", en: "Unassigned" },
  admQuick: { lo: "ຄຳຕອບດ່ວນ", en: "Quick replies" },
  admNoQuick: { lo: "ຍັງບໍ່ມີຄຳຕອບດ່ວນ — ສ້າງໄດ້ໃນ Chatwoot", en: "No quick replies yet — create them in Chatwoot" },
  admBack: { lo: "ກັບຄືນ", en: "Back" },
  admLoadErr: { lo: "ເຊື່ອມຕໍ່ Chatwoot ບໍ່ໄດ້ ກຳລັງລອງໃໝ່...", en: "Cannot reach Chatwoot — retrying…" },
  admSendErr: { lo: "ສົ່ງບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", en: "Could not send. Please try again." },
  admLoadEarlier: { lo: "ໂຫຼດຂໍ້ຄວາມກ່ອນໜ້າ", en: "Load earlier messages" },
  admSoundOn: { lo: "ເປີດສຽງແຈ້ງເຕືອນ", en: "Sound on" },
  admSoundOff: { lo: "ປິດສຽງແຈ້ງເຕືອນ", en: "Sound off" },
  admStatusOpen: { lo: "ເປີດຢູ່", en: "Open" },
  admStatusResolved: { lo: "ແກ້ໄຂແລ້ວ", en: "Resolved" },
  admStatusPending: { lo: "ລໍຖ້າ", en: "Pending" },
  admStatusSnoozed: { lo: "ພັກໄວ້", en: "Snoozed" },
  admYou: { lo: "ເຈົ້າ", en: "You" },
  admStats: { lo: "ສະຖິຕິ", en: "Stats" },

  // ---- หน้าสถิติ (/admin/stats) ----
  stTitle: { lo: "ສະຖິຕິ Ticket", en: "Ticket statistics" },
  stNoDb: { lo: "ຍັງບໍ່ໄດ້ເຊື່ອມຖານຂໍ້ມູນ (DATABASE_URL)", en: "Database not configured (DATABASE_URL)" },
  stOpenNow: { lo: "ເປີດຢູ່ຕອນນີ້", en: "Open now" },
  stCreatedToday: { lo: "ແຈ້ງມື້ນີ້", en: "Created today" },
  stResolvedToday: { lo: "ປິດມື້ນີ້", en: "Resolved today" },
  stAvgResolve: { lo: "ເວລາປິດເຄສສະເລ່ຍ (30 ມື້)", en: "Avg. time to resolve (30d)" },
  stAvgFirstReply: { lo: "ເວລາຕອບຄັ້ງທຳອິດສະເລ່ຍ (30 ມື້)", en: "Avg. first reply (30d)" },
  stTotal: { lo: "Ticket ທັງໝົດ", en: "All tickets" },
  stMinutes: { lo: "{n} ນາທີ", en: "{n} min" },
  stHours: { lo: "{h} ຊມ. {m} ນາທີ", en: "{h} h {m} min" },
  stPerDay: { lo: "ລາຍວັນ ({n} ມື້ຫຼ້າສຸດ)", en: "Per day (last {n} days)" },
  stPerLabel: { lo: "ຕາມປ້າຍກຳກັບ", en: "By label" },
  stPerAgent: { lo: "ຕາມເຈົ້າໜ້າທີ່", en: "By agent" },
  stRecent: { lo: "Ticket ລ່າສຸດ", en: "Recent tickets" },
  stBack: { lo: "ກັບໄປຄອນໂຊນ", en: "Back to console" },
  stEmpty: { lo: "ຍັງບໍ່ມີຂໍ້ມູນ", en: "No data yet" },
  stColDay: { lo: "ວັນທີ", en: "Day" },
  stColCreated: { lo: "ແຈ້ງ", en: "Created" },
  stColResolved: { lo: "ປິດແລ້ວ", en: "Resolved" },
  stColUrgent: { lo: "ດ່ວນ", en: "Urgent" },
  stColLabel: { lo: "ປ້າຍກຳກັບ", en: "Label" },
  stColTotal: { lo: "ທັງໝົດ", en: "Total" },
  stColOpen: { lo: "ເປີດຢູ່", en: "Open" },
  stColAgent: { lo: "ເຈົ້າໜ້າທີ່", en: "Agent" },
  stColTicket: { lo: "Ticket", en: "Ticket" },
  stColName: { lo: "ຜູ້ແຈ້ງ", en: "Reporter" },
  stColStatus: { lo: "ສະຖານະ", en: "Status" },
  stColCreatedAt: { lo: "ເວລາແຈ້ງ", en: "Created at" },
  stColResolvedAt: { lo: "ເວລາປິດ", en: "Resolved at" },
  // ---- หน้าหลักพนักงาน (/start): เลือกแชท หรือ แจ้งปัญหา ----
  hubTitle: { lo: "ເລືອກບໍລິການ", en: "Choose a service" },
  hubSub: { lo: "ຕ້ອງການຕິດຕໍ່ທີມໄອທີແບບໃດ? ເລືອກໄດ້ເລີຍ", en: "How would you like to reach the IT team?" },
  hubChat: { lo: "ລະບົບແຊັດ", en: "Chat with IT" },
  hubChatHint: { lo: "ສົນທະນາກັບທີມໄອທີທັນທີ ເໝາະກັບບັນຫາທີ່ຕ້ອງການຄຳຕອບດຽວນີ້", en: "Talk to IT right away — best for questions that need an answer now" },
  hubReport: { lo: "ແຈ້ງບັນຫາ", en: "Report a problem" },
  hubReportHint: { lo: "ສົ່ງລາຍການບັນຫາເປັນຂໍ້ໆ ໃຫ້ທີມໄອທີຮັບໄປດຳເນີນການ ແລ້ວຕິດຕາມສະຖານະໄດ້", en: "Send a list of issues for IT to work on, then track the status" },
  hubMyReports: { lo: "ລາຍງານຂອງຂ້ອຍ", en: "My reports" },
  hubBack: { lo: "ໜ້າຫຼັກ", en: "Home" },
  hubGo: { lo: "ເລືອກ", en: "Choose" },

  // ---- แจ้งปัญหา (/report) ----
  rpTitle: { lo: "ແຈ້ງບັນຫາ", en: "Report a problem" },
  rpSub: { lo: "ເລືອກຫົວຂໍ້ ແລ້ວພິມບັນຫາເປັນຂໍ້ໆ ທີມໄອທີຈະຮັບໄປດຳເນີນການ", en: "Pick topics, list each issue, and send it to the IT team." },
  rpStep2: { lo: "2. ເລືອກຫົວຂໍ້ ແລະ ພິມບັນຫາເປັນຂໍ້ໆ", en: "2. Pick topics and list the issues" },
  rpStep2Hint: { lo: "ເລືອກໄດ້ຫຼາຍຫົວຂໍ້ ແຕ່ລະຫົວຂໍ້ເພີ່ມບັນຫາໄດ້ຫຼາຍຂໍ້", en: "You can pick several topics and add several issues under each." },
  rpItemPlaceholder: { lo: "ພິມບັນຫາ 1 ຂໍ້ ເຊັ່ນ ເຄື່ອງພິມຫ້ອງ 203 ພິມບໍ່ອອກ", en: "Describe one issue, e.g. printer in room 203 does not print" },
  rpAdd: { lo: "ເພີ່ມ", en: "Add" },
  rpRemove: { lo: "ລຶບ", en: "Remove" },
  rpNoItems: { lo: "ຍັງບໍ່ມີບັນຫາໃນຫົວຂໍ້ນີ້ — ພິມແລ້ວກົດ ເພີ່ມ", en: "No issues yet — type one and press Add" },
  rpSend: { lo: "ສົ່ງຫາທີມໄອທີ", en: "Send to IT" },
  rpSending: { lo: "ກຳລັງສົ່ງ…", en: "Sending…" },
  rpNeedItems: { lo: "ເພີ່ມບັນຫາຢ່າງໜ້ອຍ 1 ຂໍ້ກ່ອນ", en: "Add at least one issue first" },
  rpSendErr: { lo: "ສົ່ງບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", en: "Could not send. Please try again." },
  rpNotAvailable: { lo: "ລະບົບແຈ້ງບັນຫາຍັງບໍ່ເປີດໃຊ້ (ບໍ່ມີຖານຂໍ້ມູນ) — ກະລຸນາໃຊ້ລະບົບແຊັດ", en: "Reporting is not enabled on this server (no database) — please use the chat instead." },
  rpDoneTitle: { lo: "ສົ່ງແລ້ວ!", en: "Sent!" },
  rpDoneHint: { lo: "ທີມໄອທີໄດ້ຮັບລາຍງານຂອງເຈົ້າແລ້ວ ເລກອ້າງອີງ", en: "The IT team has received your report. Reference" },
  rpTrack: { lo: "ຕິດຕາມສະຖານະ", en: "Track status" },
  rpNew: { lo: "ແຈ້ງບັນຫາໃໝ່", en: "New report" },
  rpItems: { lo: "{n} ຂໍ້", en: "{n} items" },
  rpSummary: { lo: "ສະຫຼຸບ", en: "Summary" },

  // ---- สถานะรายงาน (/report/<เลข>) ----
  rsTitle: { lo: "ສະຖານະລາຍງານ", en: "Report status" },
  rsNotFound: { lo: "ບໍ່ພົບລາຍງານ ຫຼື ລາຍງານນີ້ສົ່ງຈາກເຄື່ອງອື່ນ", en: "Report not found, or it was sent from another device." },
  rsStatusNew: { lo: "ລໍຖ້າທີມໄອທີຮັບວຽກ", en: "Waiting for IT" },
  rsStatusProgress: { lo: "ກຳລັງດຳເນີນການ", en: "In progress" },
  rsStatusDone: { lo: "ສຳເລັດແລ້ວ", en: "Done" },
  rsAssignee: { lo: "ຜູ້ຮັບຜິດຊອບ", en: "Assigned to" },
  rsSentAt: { lo: "ສົ່ງເມື່ອ", en: "Sent" },
  rsDoneAt: { lo: "ສຳເລັດເມື່ອ", en: "Completed" },
  rsRefresh: { lo: "ໂຫຼດໃໝ່", en: "Refresh" },
  rsLoading: { lo: "ກຳລັງໂຫຼດ…", en: "Loading…" },

  // ---- คอนโซลไอที: งานแจ้งปัญหา (/admin/reports) ----
  admReports: { lo: "ງານແຈ້ງ", en: "Reports" },
  rcTitle: { lo: "ງານແຈ້ງບັນຫາ", en: "Reported issues" },
  rcTabNew: { lo: "ໃໝ່", en: "New" },
  rcTabProgress: { lo: "ກຳລັງເຮັດ", en: "In progress" },
  rcTabDone: { lo: "ສຳເລັດ", en: "Done" },
  rcTabAll: { lo: "ທັງໝົດ", en: "All" },
  rcEmpty: { lo: "ບໍ່ມີງານໃນລາຍການນີ້", en: "Nothing here" },
  rcPick: { lo: "ເລືອກງານຈາກລາຍການດ້ານຊ້າຍ", en: "Pick a report from the list" },
  rcStart: { lo: "ຮັບວຽກ", en: "Start work" },
  rcDone: { lo: "ປິດວຽກ", en: "Close report" },
  rcReopen: { lo: "ເປີດໃໝ່", en: "Reopen" },
  rcAssignee: { lo: "ຜູ້ຮັບຜິດຊອບ", en: "Assignee" },
  rcUnassigned: { lo: "ຍັງບໍ່ມີ", en: "Unassigned" },
  rcNote: { lo: "ບັນທຶກພາຍໃນ (ທີມໄອທີເຫັນເທົ່ານັ້ນ)", en: "Internal note (IT only)" },
  rcSaveNote: { lo: "ບັນທຶກ", en: "Save" },
  rcSaved: { lo: "ບັນທຶກແລ້ວ", en: "Saved" },
  rcItems: { lo: "ລາຍການບັນຫາ", en: "Issues" },
  rcItemsDone: { lo: "{done}/{total} ສຳເລັດ", en: "{done}/{total} done" },
  rcDoneBy: { lo: "ໂດຍ {name}", en: "by {name}" },
  rcBack: { lo: "ກັບໄປຄອນໂຊນແຊັດ", en: "Back to chat console" },
  rcLoadErr: { lo: "ໂຫຼດບໍ່ສຳເລັດ", en: "Could not load" },
  rcActErr: { lo: "ບັນທຶກບໍ່ສຳເລັດ ກະລຸນາລອງໃໝ່", en: "Could not save. Please try again." },
  rcContact: { lo: "ຕິດຕໍ່", en: "Contact" },
  rcNoDb: { lo: "ຍັງບໍ່ໄດ້ເຊື່ອມຖານຂໍ້ມູນ (DATABASE_URL)", en: "Database not configured (DATABASE_URL)" },
  rcAutoClosed: { lo: "ຕິ໊ກຄົບທຸກຂໍ້ → ປິດວຽກອັດຕະໂນມັດ", en: "All items ticked → report closes automatically" },
  // ---- ไฟล์แนบ (รูป/วิดีโอ) ของงานแจ้งปัญหา ----
  rpAttachTitle: { lo: "ຮູບ / ວິດີໂອ ປະກອບ (ບໍ່ບັງຄັບ)", en: "Photos / videos (optional)" },
  rpAttachHint: { lo: "ສູງສຸດ 5 ໄຟລ໌ — ຮູບບໍ່ເກີນ 10 MB, ວິດີໂອບໍ່ເກີນ 50 MB", en: "Up to 5 files — photos up to 10 MB, videos up to 50 MB" },
  rpAttach: { lo: "ແນບຮູບ / ວິດີໂອ", en: "Attach photo / video" },
  rpAttachUploading: { lo: "ກຳລັງອັບໂຫລດ…", en: "Uploading…" },
  rpAttachFailed: { lo: "ອັບໂຫລດບໍ່ສຳເລັດ", en: "Upload failed" },
  rpAttachTooMany: { lo: "ແນບໄດ້ສູງສຸດ 5 ໄຟລ໌", en: "You can attach up to 5 files" },
  rpAttachTooBig: { lo: "ໄຟລ໌ໃຫຍ່ເກີນກຳນົດ", en: "File is too large" },
  rpAttachType: { lo: "ຮອງຮັບສະເພາະຮູບ ແລະ ວິດີໂອ", en: "Only photos and videos are supported" },
  rpAttachNotAvailable: { lo: "ເຊີບເວີນີ້ບໍ່ຮອງຮັບການແນບໄຟລ໌", en: "Attachments are not available on this server" },
  rpAttachRemove: { lo: "ເອົາອອກ", en: "Remove" },
  rcFiles: { lo: "ໄຟລ໌ແນບ", en: "Attachments" },
  rcOpenFile: { lo: "ເປີດ", en: "Open" },
  // ---- รายงานของฉัน (หน้าหลัก): สถานะ ผู้รับเรื่อง แบ่งหน้า ----
  hubAssignee: { lo: "ຜູ້ຮັບເລື່ອງ", en: "Handled by" },
  hubNoAssignee: { lo: "ຍັງບໍ່ມີຜູ້ຮັບເລື່ອງ", en: "Not yet assigned" },
  hubNoReports: { lo: "ຍັງບໍ່ມີລາຍງານ", en: "No reports yet" },
  hubPage: { lo: "ໜ້າ {page}/{pages} · ທັງໝົດ {total}", en: "Page {page}/{pages} · {total} total" },
  hubPrev: { lo: "ກ່ອນໜ້າ", en: "Previous" },
  hubNext: { lo: "ຖັດໄປ", en: "Next" },
  // ---- หน้าหลักทีมไอที (/admin หลังล็อกอิน) ----
  ahTitle: { lo: "ເລືອກໜ້າຈໍ", en: "Choose a console" },
  ahSub: { lo: "ສະບາຍດີ {name} — ເລືອກລະບົບແຊັດ ຫຼື ງານແຈ້ງບັນຫາ, ຫຼືກົດລາຍການທີ່ຄ້າງຢູ່ດ້ານລຸ່ມໄດ້ເລີຍ", en: "Hello {name} — open the chat or reports console, or jump straight into a pending item below" },
  ahChat: { lo: "ລະບົບແຊັດ", en: "Chat console" },
  ahChatHint: { lo: "ຕອບແຊັດພະນັກງານ, ປິດເຄສ, ມອບໝາຍ", en: "Reply to staff chats, close cases, assign" },
  ahReports: { lo: "ແຈ້ງບັນຫາ", en: "Reported issues" },
  ahReportsHint: { lo: "ຮັບງານ, ຕິ໊ກຂໍ້ທີ່ແກ້ແລ້ວ, ປິດງານ", en: "Take reports, tick fixed items, close" },
  ahWaiting: { lo: "ລໍຖ້າຕອບ", en: "waiting" },
  ahOpenChats: { lo: "ແຊັດທີ່ຍັງເປີດຢູ່", en: "Open chats" },
  ahOpenReports: { lo: "ງານແຈ້ງທີ່ຍັງບໍ່ສຳເລັດ", en: "Pending reports" },
  ahEmptyChats: { lo: "ບໍ່ມີແຊັດຄ້າງ", en: "No open chats" },
  ahEmptyReports: { lo: "ບໍ່ມີງານຄ້າງ", en: "No pending reports" },
  ahViewAll: { lo: "ເບິ່ງທັງໝົດ", en: "View all" },
  admHome: { lo: "ໜ້າຫຼັກ", en: "Home" },
} satisfies Record<string, Record<Lang, string>>;

export type MsgKey = keyof typeof M;

export function translate(lang: Lang, key: MsgKey, vars?: Record<string, string | number>) {
  let s: string = M[key][lang];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
