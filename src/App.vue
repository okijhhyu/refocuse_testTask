<template>
  <div
    style="
    display: flex;
    flex-direction: row;
    flex: 1;
    flex-basis: auto;
    box-sizing: border-box;
    min-width: 0;
"
  >
    <div
      style="background-color: var(--orange); width: 300px; height: 100vh;"
    ></div>
    <div style="padding: 50px; width: 100%;">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
@import "@/assets/scss/variables.scss";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  margin: 0;
}
</style>
