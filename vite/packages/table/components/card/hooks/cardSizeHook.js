import { cardStore } from "../../../store/card";
import { mapActions } from "pinia";

export default {
  data() {
    return {
      isActive: "",
    };
  },
  created() {},
  mounted() {
    if (!this.customData.cardSize) {
      this.customData.cardSize = this.options.className;
      //首次将类名作为尺寸进行初始化
      this.__updateSize(this.options.className);
    }

    this.options.className = this.customData.cardSize;
  },
  methods: {
    ...mapActions(cardStore, ["updateCustomData"]),
    __updateSize(e) {
      if (e == "card1") {
        this.isActive = "card1";
        this.options.className = "card";
        this.updateCustomData(
          this.customIndex,
          {
            cardSize: "card",
          },
          this.desk
        );
      } else {
        this.updateCustomData(
          this.customIndex,
          {
            cardSize: e,
          },
          this.desk
        );
        this.options.className = e;
        this.isActive = e;
      }
      this.reSizeInit && this.reSizeInit(e); // 更新窗口大小的回调函数
      this.updateSize && this.updateSize(e);
    },
  },
};
