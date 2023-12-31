<template>
  <div class="xt-border h-full xt-bg-2 xt-text text-base flex flex-col">
    <div class="flex-grow overflow-hidden overflow-y-auto xt-scrollbar p-2">
      <div class="h-12 flex" v-for="(i, index) in calculators" :key="index">
        <XtInput
          :key="index"
          class="xt-text flex-1"
          placeholder="请输入计算式，如 99+99 "
          style="height: 48px"
          :class="border"
          :limit="{ space: true }"
          v-model="computeList[index]"
          @focus="handleFocus(index)"
          @change="handleChange()"
          @blur="handleBlur(index)"
        ></XtInput>
        <div
          v-if="countList[index]"
          class="px-3 flex items-center success cursor-pointer xt-active res truncate"
          style="
            max-width: 30%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          "
          @click="copyToClipboard(countList[index])"
          @mouseover="showCopy()"
          @mouseout="hideCopy()"
        >
          {{ countList[index] }}
        </div>
      </div>
    </div>
    <div class="flex justify-between p-2">
      <div class="overflow-hidden" style="width: 0">1</div>
      <XtBaseIcon
        icon="shanchu"
        style="font-size: 20px"
        @click="delCalculator()"
      ></XtBaseIcon>
      <div
        class="absolute left-1/2 -translate-x-1/2 res-copy"
        style="bottom: 22px"
      >
        点击复制
      </div>
    </div>
  </div>
</template>

<script>
import { message } from "ant-design-vue";
import { calculator } from "../../../store/calculator";
import { mapWritableState } from "pinia";
import Mexp from "math-expression-evaluator";

export default {
  computed: {
    ...mapWritableState(calculator, [
      "computeList",
      "countList",
      "calculators",
      "selectIndex",
    ]),
  },
  watch: {
    computeList: {
      handler() {
        let formula = this.computeList[this.selectIndex];
        formula = this.pretreatment(formula);
        try {
          const mexp = new Mexp();
          const lexed = mexp.lex(formula); // 对表达式进行词法分析
          const postfixed = mexp.toPostfix(lexed); // 将词法分析得到的结果转换为后缀表达式
          const result = mexp.postfixEval(postfixed); // 使用后缀表达式求值
          this.countList[this.selectIndex] = result;
        } catch (error) {
          this.countList[this.selectIndex] = formula;
        }
        this.handleChange();
      },
      deep: true,
    },
  },
  methods: {
    delCalculator() {
      this.computeList = [""];
      this.countList = [""];
      this.calculators = 1;
      this.selectIndex = 0;
    },
    // 复制状态显示
    showCopy() {
      const resCopy = document.querySelector(".res-copy");
      resCopy.style.display = "block";
    },
    hideCopy() {
      const resCopy = document.querySelector(".res-copy");
      resCopy.style.display = "none";
    },
    pretreatment(str) {
      str = str.replace(/[（）]/g, (match) => {
        if (match === "（") return "(";
        if (match === "）") return ")";
        return match;
      });

      return str; // 返回预处理后的字符串
    },
    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          message.success("已成功复制到剪切板");
        })
        .catch((err) => {});
    },
    handleFocus(i) {
      this.selectIndex = i;
    },
    handleBlur(index) {
      if (
        this.computeList[index] === "" &&
        index !== this.computeList.length - 1
      ) {
        this.computeList.splice(index, 1);
        this.countList.splice(index, 1);
        this.calculators--;
      }
    },
    handleChange() {
      let computeList = this.computeList;
      if (computeList[computeList.length - 1] !== "") {
        this.computeList.push("");
        this.countList.push("");
        this.calculators++;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.res {
  &:hover {
    background: var(--success);
    border-radius: 12px;
    color: var(--primary-text);
  }
}
.res-copy {
  display: none;
}
input {
  border: none;
  background: none;
}
.ant-input:focus {
  box-shadow: none;
}
</style>
