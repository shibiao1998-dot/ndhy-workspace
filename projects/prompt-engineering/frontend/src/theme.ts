// theme.ts — AntD 5 Design Token 配置
// 基于视觉设计规范 visual-design-spec.md

import type { ThemeConfig } from 'antd';

export const promptEngineeringTheme: ThemeConfig = {
  token: {
    // ===== 品牌色 =====
    colorPrimary: '#1B65A9',
    colorPrimaryHover: '#2878C4',
    colorPrimaryActive: '#13508A',
    colorPrimaryBg: '#E8F1FA',
    colorPrimaryBorder: '#A3C8E8',
    colorPrimaryBgHover: '#D4E5F5',
    colorPrimaryText: '#1B65A9',
    colorPrimaryTextHover: '#2878C4',
    colorPrimaryTextActive: '#13508A',

    // ===== 语义色 =====
    colorSuccess: '#29A352',
    colorSuccessBg: '#E9F7EF',
    colorSuccessBorder: '#8DD4A8',
    colorWarning: '#E8900C',
    colorWarningBg: '#FFF7E6',
    colorWarningBorder: '#F5C36A',
    colorError: '#D93025',
    colorErrorBg: '#FDECEB',
    colorErrorBorder: '#F0A09B',
    colorInfo: '#1B65A9',
    colorInfoBg: '#E8F1FA',
    colorInfoBorder: '#A3C8E8',

    // ===== 中性色 =====
    colorText: '#333333',
    colorTextSecondary: '#666666',
    colorTextTertiary: '#999999',
    colorTextQuaternary: '#BFBFBF',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#F0F2F5',
    colorBorder: '#D9D9D9',
    colorBorderSecondary: '#E8E8E8',
    colorFill: '#F7F8FA',
    colorFillSecondary: '#F0F2F5',
    colorFillTertiary: '#F7F8FA',

    // ===== 字体 =====
    fontFamily: "'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyCode: "'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, 'Source Code Pro', monospace",
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 16,
    fontSizeHeading4: 14,
    fontSizeHeading5: 13,
    fontSizeSM: 13,
    fontSizeLG: 16,

    // ===== 行高 =====
    lineHeight: 1.5714,
    lineHeightHeading1: 1.3333,
    lineHeightHeading2: 1.4,
    lineHeightHeading3: 1.5,
    lineHeightLG: 1.5,
    lineHeightSM: 1.5384,

    // ===== 间距 =====
    padding: 16,
    paddingLG: 24,
    paddingSM: 8,
    paddingXS: 4,
    paddingXXS: 2,
    margin: 16,
    marginLG: 24,
    marginSM: 8,
    marginXS: 4,
    marginXXS: 2,

    // ===== 圆角 =====
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    // ===== 阴影 =====
    boxShadow: '0 2px 8px rgba(27, 101, 169, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(27, 101, 169, 0.08)',
    boxShadowTertiary: '0 1px 4px rgba(0, 0, 0, 0.04)',

    // ===== 动效 =====
    motionDurationFast: '0.12s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    motionEaseOut: 'cubic-bezier(0, 0, 0.2, 1)',

    // ===== 尺寸 =====
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
  },

  components: {
    // ===== Button =====
    Button: {
      fontWeight: 500,
      primaryShadow: '0 2px 4px rgba(27, 101, 169, 0.2)',
      defaultBorderColor: '#D9D9D9',
      defaultColor: '#333333',
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 48,
      controlHeightSM: 28,
      paddingInline: 20,
      paddingInlineLG: 28,
    },

    // ===== Card =====
    Card: {
      borderRadiusLG: 12,
      paddingLG: 24,
      boxShadowTertiary: '0 1px 4px rgba(0, 0, 0, 0.04)',
      headerFontSize: 16,
      headerFontSizeSM: 14,
    },

    // ===== Input / TextArea =====
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      controlHeightLG: 48,
      paddingInline: 16,
      activeBorderColor: '#1B65A9',
      hoverBorderColor: '#A3C8E8',
      activeShadow: '0 0 0 3px rgba(27, 101, 169, 0.12)',
    },

    // ===== Select =====
    Select: {
      borderRadius: 8,
      controlHeight: 36,
      optionSelectedBg: '#E8F1FA',
      optionActiveBg: '#F7F8FA',
    },

    // ===== Checkbox =====
    Checkbox: {
      borderRadiusSM: 4,
      colorPrimary: '#1B65A9',
    },

    // ===== Tag =====
    Tag: {
      borderRadiusSM: 4,
      fontSizeSM: 12,
    },

    // ===== Tabs =====
    Tabs: {
      inkBarColor: '#1B65A9',
      itemActiveColor: '#1B65A9',
      itemHoverColor: '#2878C4',
      itemSelectedColor: '#1B65A9',
    },

    // ===== Badge =====
    Badge: {
      fontSizeSM: 11,
    },

    // ===== Typography =====
    Typography: {
      titleMarginBottom: 0,
      titleMarginTop: 0,
    },

    // ===== Spin =====
    Spin: {
      colorPrimary: '#1B65A9',
    },

    // ===== Alert =====
    Alert: {
      borderRadiusLG: 8,
    },
  },
};
