<template>
  <div class="windows-toolbar-box">
    <div class="windows-toolbar">
      <div class="windows-toolbar-item" @click="minimizeHandler">
        <svg class="app-icon">
          <use href="#windows-minimize"></use>
        </svg>
      </div>
      <div class="windows-toolbar-item" @click="maximizeHandler">
        <svg class="app-icon">
          <use :href="IsMax ? '#windows-restore' : '#windows-maximize'"></use>
        </svg>
      </div>
      <div class="windows-toolbar-item" @click="closeHandler">
        <svg class="app-icon">
          <use href="#windows-close"></use>
        </svg>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onBeforeMount, reactive, toRef, toRefs} from "vue";
import "./svg";

export default defineComponent({
  name: "windows-toolbar",
  setup(props, {emit}) {
    const state = reactive({
      IsShow: true,
      IsMax: false
    });
    const minimizeHandler = () => {
      (window as any).mainAPI.windowAction("minimize");
    };
    const maximizeHandler = () => {
      const {isMaximized} = (window as any).mainAPI.windowAction("maximize");
      console.log(isMaximized);
      state.IsMax = isMaximized;
    };
    const closeHandler = () => {
      (window as any).mainAPI.windowAction("close");
    };
    // 在元素挂载前
    onBeforeMount(() => {

    })
    return {
      minimizeHandler,
      maximizeHandler,
      closeHandler,
      ...toRefs(state)
    };
  }
});
</script>
<style scoped lang="scss">
.windows-toolbar-box {
  position: absolute;
  z-index: 100;
  top: 0;
  right: 0;

  & .windows-toolbar {
    float: right;
    height: 32px;

    & * {
      -webkit-app-region: no-drag;
    }

    & .windows-toolbar-item {
      display: -webkit-inline-flex;
      display: inline-flex;
      -webkit-justify-content: center;
      justify-content: center;
      -webkit-align-items: center;
      align-items: center;
      margin-right: 12px;
      width: 32px;
      height: 32px;
      cursor: pointer;

      &:last-of-type {
        margin-right: 5px;
      }
    }
  }
}
</style>
