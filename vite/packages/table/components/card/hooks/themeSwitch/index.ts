import cache from "../cache";
import {
  DARK_THEME,
  LIGHT_THEME,
  THEME_NAME,
  OLD_THEME_NAME,
  SUFFIX,
  TRANSPARENT,
} from "./types";

/**
 * 初始化主题
 * 检查缓存中的主题名称，设置对应的主题类名
 */
export const initTheme = () => {
  const className = compatible();
  if (className !== DARK_THEME + SUFFIX && className !== LIGHT_THEME + SUFFIX) {
    setThemeName(DARK_THEME + SUFFIX);
  } else if (className) {
    setThemeName(className);
  }
  initTransparent();
};

/**
 * 切换主题
 * @param {boolean} flag - 必填，切换主题的标志，true 表示切换到亮色主题，false 表示切换到暗色主题
 */
export const setThemeSwitch = (flag) => {
  const className = compatible();
  delThemeName(className);

  let model = flag ? LIGHT_THEME : DARK_THEME;
  let themeName = model + SUFFIX;
  setThemeName(themeName);
};

/**
 * 设置主题类名
 * @param {string} themeName - 必填，主题类名
 */
export const setThemeName = (themeName) => {
  document.documentElement.classList.add(themeName);
  cache.set(THEME_NAME, themeName);
};

/**
 * 移除主题类名
 * @param {string} themeName - 必填，主题类名
 */
export const delThemeName = (themeName) => {
  if (!themeName) return;
  document.documentElement.classList.remove(themeName);
  cache.del(themeName);
};

/**
 * 获取主题名称
 * @param {string} themeName - 必填，主题名称
 * @returns {string} 对应的主题名称，若不存在则返回空字符串
 */
export const getThemeName = (themeName) => cache.get(themeName) || "";

/**
 * 兼容旧版本处理
 */
const compatible = () => {
  const newClassName = getThemeName(THEME_NAME);
  const oldClassName = getThemeName(OLD_THEME_NAME); // 为了兼容旧版本
  const className = newClassName || oldClassName;
  return className;
};

/**
 * 设置透明背景
 */
export const setTransparent = () => {
  document.documentElement.classList.add(TRANSPARENT);
  cache.set(TRANSPARENT, true);
};

/**
 * 移除透明背景
 */
export const detTransparent = () => {
  document.documentElement.classList.remove(TRANSPARENT);
  cache.del(TRANSPARENT);
};

/**
 * 初始化透明背景
 */
export const initTransparent = () => {
  const transparent = getThemeName(TRANSPARENT);
  if (transparent) setTransparent();
};
