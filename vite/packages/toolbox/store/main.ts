import { defineStore } from "pinia";

// 工具箱主要的全局状态存储在这里
export const main = defineStore("main", {
  state: () => ({
    useTool: "",
  }),
  actions: {},
});
