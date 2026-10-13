// Auto-generated mock data for src/lib/i18n.ts
// @cotester-version: 2
// Do not edit — regenerated on each source change.

import { mockLang } from './../__shared__/types.mock';

export const translateMocks = {
  'handles english locale': {
    lang: mockLang(),
    key: {
      id: 1,
      name: 'John Doe',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date('2025-06-15T10:30:00Z'),
    },
    vars: {} as any,
  },
  'handles spanish locale': {
    lang: mockLang(),
    key: {} as any /* minimal "brand" | "heroTitle" | "heroSub" | "heroStep1" | "heroStep2" | "heroStep3" | "step1Title" | "step1Hint" | "fieldName" | "fieldDept" | "fieldContact" | "deptPlaceholder" | "saveProfile" | "saving" | "cancel" | "errNameRequired" | "errDeptRequired" | "errSaveFailed" | "hello" | "switchUser" | "step2Title" | "step2Hint" | "urgentLabel" | "urgentHint" | "startChat" | "pickTopicFirst" | "connecting" | "chatError" | "notConfigured" | "chatHint" | "qrTitle" | "qrHint" | "qrUrlLabel" | "qrOnlyStaff" | "qrLocalWarn" | "qrPrint" | "qrPng" | "qrSvg" | "qrCopy" | "qrCopied" | "qrInvalid" | "qrGoStaff" | "qrGoAdmin" | "admTitle" | "admBrand" | "admLoginTitle" | "admLoginHint" | "admEmail" | "admPassword" | "admSignIn" | "admSigningIn" | "admLoginFailed" | "admLoginForbidden" | "admLoginBusy" | "admLoginDown" | "admNotConfigured" | "admDemoBanner" | "admSignOut" | "admBackToPortal" | "admTabOpen" | "admTabResolved" | "admTabAll" | "admChannel" | "admScopeMine" | "admLabels" | "admAllLabels" | "admLabelCountHint" | "admUrgent" | "admSearch" | "admEmptyList" | "admEmptyOpen" | "admViewResolved" | "admPickConv" | "admReplyPlaceholder" | "admNotePlaceholder" | "admSend" | "admPrivateNote" | "admResolve" | "admCloseTitle" | "admCloseHint" | "admOpenTopics" | "admSelectAll" | "admCloseAll" | "admCloseSelected" | "admCloseNoTopics" | "admCloseStaysOpen" | "admClosedTopics" | "admClosing" | "admCloseErr" | "admTopicNote" | "admReopen" | "admAssignMe" | "admAssignee" | "admUnassigned" | "admQuick" | "admNoQuick" | "admBack" | "admLoadErr" | "admSendErr" | "admLoadEarlier" | "admSoundOn" | "admSoundOff" | "admStatusOpen" | "admStatusResolved" | "admStatusPending" | "admStatusSnoozed" | "admYou" | "admStats" | "stTitle" | "stNoDb" | "stOpenNow" | "stCreatedToday" | "stResolvedToday" | "stAvgResolve" | "stAvgFirstReply" | "stTotal" | "stMinutes" | "stHours" | "stPerDay" | "stPerLabel" | "stPerAgent" | "stRecent" | "stBack" | "stEmpty" | "stColDay" | "stColCreated" | "stColResolved" | "stColUrgent" | "stColLabel" | "stColTotal" | "stColOpen" | "stColAgent" | "stColTicket" | "stColName" | "stColStatus" | "stColCreatedAt" | "stColResolvedAt" */,
    vars: {} as any,
  },
  'handles when vars is truthy': {
    lang: mockLang(),
    key: {
      id: 1,
      name: 'John Doe',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date('2025-06-15T10:30:00Z'),
    },
    vars: {} as any,
  },
  'handles when vars is falsy': {
    lang: mockLang(),
    key: {} as any /* minimal "brand" | "heroTitle" | "heroSub" | "heroStep1" | "heroStep2" | "heroStep3" | "step1Title" | "step1Hint" | "fieldName" | "fieldDept" | "fieldContact" | "deptPlaceholder" | "saveProfile" | "saving" | "cancel" | "errNameRequired" | "errDeptRequired" | "errSaveFailed" | "hello" | "switchUser" | "step2Title" | "step2Hint" | "urgentLabel" | "urgentHint" | "startChat" | "pickTopicFirst" | "connecting" | "chatError" | "notConfigured" | "chatHint" | "qrTitle" | "qrHint" | "qrUrlLabel" | "qrOnlyStaff" | "qrLocalWarn" | "qrPrint" | "qrPng" | "qrSvg" | "qrCopy" | "qrCopied" | "qrInvalid" | "qrGoStaff" | "qrGoAdmin" | "admTitle" | "admBrand" | "admLoginTitle" | "admLoginHint" | "admEmail" | "admPassword" | "admSignIn" | "admSigningIn" | "admLoginFailed" | "admLoginForbidden" | "admLoginBusy" | "admLoginDown" | "admNotConfigured" | "admDemoBanner" | "admSignOut" | "admBackToPortal" | "admTabOpen" | "admTabResolved" | "admTabAll" | "admChannel" | "admScopeMine" | "admLabels" | "admAllLabels" | "admLabelCountHint" | "admUrgent" | "admSearch" | "admEmptyList" | "admEmptyOpen" | "admViewResolved" | "admPickConv" | "admReplyPlaceholder" | "admNotePlaceholder" | "admSend" | "admPrivateNote" | "admResolve" | "admCloseTitle" | "admCloseHint" | "admOpenTopics" | "admSelectAll" | "admCloseAll" | "admCloseSelected" | "admCloseNoTopics" | "admCloseStaysOpen" | "admClosedTopics" | "admClosing" | "admCloseErr" | "admTopicNote" | "admReopen" | "admAssignMe" | "admAssignee" | "admUnassigned" | "admQuick" | "admNoQuick" | "admBack" | "admLoadErr" | "admSendErr" | "admLoadEarlier" | "admSoundOn" | "admSoundOff" | "admStatusOpen" | "admStatusResolved" | "admStatusPending" | "admStatusSnoozed" | "admYou" | "admStats" | "stTitle" | "stNoDb" | "stOpenNow" | "stCreatedToday" | "stResolvedToday" | "stAvgResolve" | "stAvgFirstReply" | "stTotal" | "stMinutes" | "stHours" | "stPerDay" | "stPerLabel" | "stPerAgent" | "stRecent" | "stBack" | "stEmpty" | "stColDay" | "stColCreated" | "stColResolved" | "stColUrgent" | "stColLabel" | "stColTotal" | "stColOpen" | "stColAgent" | "stColTicket" | "stColName" | "stColStatus" | "stColCreatedAt" | "stColResolvedAt" */,
    vars: {} as any,
  },
  'handles key = "brand"': { lang: mockLang(), key: 'brand', vars: {} as any },
  'handles key = "heroTitle"': { lang: mockLang(), key: 'heroTitle', vars: {} as any },
  'handles key = "heroSub"': { lang: mockLang(), key: 'heroSub', vars: {} as any },
  'handles key = "heroStep1"': { lang: mockLang(), key: 'heroStep1', vars: {} as any },
  'handles key = "heroStep2"': { lang: mockLang(), key: 'heroStep2', vars: {} as any },
  'handles optional params omitted': {
    lang: mockLang(),
    key: {
      id: 1,
      name: 'John Doe',
      email: 'test@example.com',
      isActive: true,
      createdAt: new Date('2025-06-15T10:30:00Z'),
    },
    vars: undefined,
  },
};

export const isLangMocks = {
  'handles default case': { v: {} as any },
  'handles truthy condition': { v: {} as any },
  'handles falsy condition': { v: {} as any },
  'handles case when v === "lo" || v === "en"': { v: {} as any },
  'handles case when condition is not met': { v: {} as any },
};
