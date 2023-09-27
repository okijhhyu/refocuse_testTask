<template>
  <section class="status">
    <div class="content">
      <div class="page-head">
        <a href="#" class="page-back">
          <img
            style="margin-left: -50px"
            src="@/assets/img/layout/general/arrow-left.svg"
            width="30"
            height="30"
            alt=""
          />
        </a>
        <h1 class="tags-page__title page-title">Статусы участников</h1>
      </div>

      <form action="" class="status__form">
        <div class="status__desc">
          Стаусы дополнительно мотивируют участников на более активное участи в
          активностях.
        </div>
        <div class="status__top">
          <div
            :class="{
              status__inline: true,
              active: creatingMode
            }"
          >
            <div class="group">
              <div class="group__input" style="width: 190px">
                <input
                  :value="currentLevel.name"
                  :class="{
                    validation: !validation.name.validation
                  }"
                  style="padding-left: 6px;"
                  type="text"
                  placeholder="Статус"
                  @input="updateCurrentLevel('name', $event.target.value)"
                />
                <span
                  v-if="!validation.name.validation"
                  class="validation__message"
                >
                  {{ validation.name.message }}
                </span>
              </div>
            </div>
            <div class="group">
              <label for="" class="group__label">От</label>
              <div class="group__input">
                <input
                  :class="{
                    'group__input-amount': true,
                    validation: !validation.start.validation
                  }"
                  :value="currentLevel.start"
                  :readonly="!levelsList.length"
                  type="text"
                  placeholder=""
                  @input="
                    updateCurrentLevel(
                      'start',
                      +$event.target.value >= 0 || $event.target.value === ''
                        ? Math.floor(+$event.target.value)
                        : Math.floor(currentLevel.start)
                    )
                  "
                />
                <span
                  v-if="!validation.start.validation"
                  class="validation__message"
                >
                  {{ validation.start.message }}
                </span>
              </div>
            </div>
            <div class="group">
              <label for="" class="group__label">До</label>
              <div class="group__input">
                <input
                  :class="{
                    'group__input-amount': true,
                    validation: !validation.end.validation
                  }"
                  :value="
                    !levelsList.length ||
                    currentLevel.start > levelsList[levelsList.length - 1].start
                      ? '∞'
                      : currentLevel.end
                  "
                  :readonly="!levelsList.length"
                  type="text"
                  placeholder=""
                  @input="
                    updateCurrentLevel(
                      'end',
                      +$event.target.value >= 0 || $event.target.value === ''
                        ? Math.floor(+$event.target.value)
                        : Math.floor(currentLevel.end)
                    )
                  "
                />
                <span
                  v-if="!validation.end.validation"
                  class="validation__message"
                >
                  {{ validation.end.message }}
                </span>
              </div>
            </div>
          </div>
          <button
            :class="{
              'status__btn button': true,
              active: creatingMode
            }"
            @click.prevent="creatingMode ? createSubmit() : goCreateMode()"
          >
            <svg style="width: 20px; height: 20px">
              <use xlink:href="img/sprite.svg#plus-round"></use>
            </svg>
            добавить статус
          </button>
        </div>

        <div class="status__table">
          <div
            v-for="(level, index) in levelsList"
            :key="level._id"
            class="status__row"
          >
            <div class="status__value">{{ level.name }}</div>
            <div class="status__from">
              <div class="group">
                <label for="" class="group__label">От</label>
                <div class="group__input">
                  {{
                    nextLevel._id === level._id ? nextLevel.start : level.start
                  }}
                </div>
              </div>
            </div>
            <div class="status__to">
              <div class="group">
                <label for="" class="group__label">До</label>
                <div class="group__input">
                  <input
                    v-if="index !== levelsList.length - 1"
                    :class="{
                      'group__input-amount': true,
                      validation:
                        !validation.tableEnd.validation &&
                        currentLevel._id === level._id
                    }"
                    :value="
                      currentLevel._id === level._id
                        ? currentLevel.end
                        : level.end
                    "
                    type="text"
                    placeholder=""
                    @focus="goEditMode(level._id)"
                    @input="
                      updateCurrentLevelTable(
                        +$event.target.value >= 0 || $event.target.value === ''
                          ? Math.floor(+$event.target.value)
                          : Math.floor(currentLevel.end)
                      )
                    "
                    @blur="updateSubmit()"
                  />
                  <template v-else>∞</template>
                  <span
                    v-if="
                      !validation.tableEnd.validation &&
                        currentLevel._id === level._id
                    "
                    class="validation__message"
                  >
                    {{ validation.tableEnd.message }}
                  </span>
                </div>
              </div>
            </div>
            <div class="status__subtitle">баллов</div>

            <span @click="deleteLevelHandler(level._id)" class="status__delete">
              <svg>
                <use xlink:href="@/assets/img/sprite.svg#urn"></use>
              </svg>
            </span>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useLevelsStore } from "@/store/levels";
// Data
const { currentLevel, levelsList } = storeToRefs(useLevelsStore());
const creatingMode = ref(false);
// Object for validation data
const validation = ref({
  start: { validation: true, message: "" },
  end: { validation: true, message: "" },
  name: { validation: true, message: "" },
  tableEnd: { validation: true, message: "" }
});
const nextLevel = ref({ _id: "", name: "", start: 0, end: 0 });
// Store
const {
  fetchLevels,
  createLevel,
  deleteLevel,
  updateLevel,
  resetCurrentLevel,
  updateCurrentLevel,
  setCurrentLevel
} = useLevelsStore();
// Get levels
try {
  fetchLevels();
} catch (e) {
  console.error(e);
}

// request delete level
async function deleteLevelHandler(_id) {
  try {
    await deleteLevel(_id);
    fetchLevels();
  } catch (e) {
    console.error(e);
  }
}

// request update level
async function updateSubmit() {
  if (validation.value.tableEnd.validation) {
    await Promise.all([
      updateLevel(currentLevel.value),
      updateLevel(nextLevel.value)
    ]);
    fetchLevels();
  }
  resetCurrentLevel();
  nextLevel.value = currentLevel.value;
  validation.value = {
    name: { validation: true, message: "" },
    start: { validation: true, message: "" },
    end: { validation: true, message: "" },
    tableEnd: {
      validation: true,
      message: ""
    }
  };
}

async function createSubmit() {
  try {
    validation.value = {
      name: { validation: true, message: "" },
      start: { validation: true, message: "" },
      end: { validation: true, message: "" },
      tableEnd: { validation: true, message: "" }
    };
    let valid = true;
    let includedRanges = [];
    if (!currentLevel.value.name) {
      validation.value = {
        ...validation.value,
        name: {
          validation: false,
          message: `Введите название статуса участников`
        }
      };
      valid = false;
    } else if (levelsList.value.length) {
      if (
        currentLevel.value.start === currentLevel.value.end &&
        currentLevel.value.start <=
          levelsList.value[levelsList.value.length - 1].end
      ) {
        validation.value = {
          ...validation.value,
          start: {
            validation: false,
            message: `Значение от и до не могут равняться`
          },
          end: {
            validation: false,
            message: `Значение от и до не могут равняться`
          }
        };
        valid = false;
      } else if (currentLevel.value.start >= currentLevel.value.end) {
        if (
          currentLevel.value.start >
          levelsList.value[levelsList.value.length - 1].start
        ) {
          updateCurrentLevel("end", currentLevel.value.start);
        } else {
          validation.value = {
            ...validation.value,
            start: {
              validation: false,
              message: `Значение от больше значения до`
            },
            end: {
              validation: false,
              message: `Значение до меньше от`
            }
          };
          valid = false;
          return;
        }
      }
      if (
        currentLevel.value.start >=
        levelsList.value[levelsList.value.length - 1].end
      ) {
        if (
          currentLevel.value.start ===
          levelsList.value[levelsList.value.length - 1].end
        ) {
          valid = false;
          validation.value = {
            ...validation.value,
            start: {
              validation: false,
              message: `Значение от не может равняться началу последнего элемента`
            }
          };
        } else {
          includedRanges.push({
            ...levelsList.value[levelsList.value.length - 1]
          });
        }
      } else if (levelsList.value.length > 1) {
        levelsList.value.map(item => {
          if (item.end >= currentLevel.value.start && !includedRanges.length) {
            includedRanges.push({ ...item });
          } else if (
            item.start < currentLevel.value.end &&
            includedRanges.length
          ) {
            includedRanges.push(item);
          }
        });
      }
      if (includedRanges.length > 2) {
        valid = false;
        validation.value = {
          ...validation.value,
          start: {
            validation: false,
            message: `Интервал включает в себя уже имеющийся интервал`
          },
          end: {
            validation: false,
            message: `Интервал включает в себя уже имеющийся интервал`
          }
        };
      } else {
        if (includedRanges.length >= 1) {
          includedRanges = includedRanges.map(item => {
            if (item.start === currentLevel.value.start) {
              if (item.end <= currentLevel.value.end) {
                valid = false;
                validation.value = {
                  ...validation.value,
                  start: {
                    validation: false,
                    message: `Интервал включает в себя уже имеющийся интервал`
                  },
                  end: {
                    validation: false,
                    message: `Интервал включает в себя уже имеющийся интервал`
                  }
                };
              } else {
                return { ...item, start: currentLevel.value.end };
              }
            } else if (item.start < currentLevel.value.start) {
              return { ...item, end: currentLevel.value.start };
            } else {
              if (item.end <= currentLevel.value.end) {
                if (
                  item._id === levelsList.value[levelsList.value.length - 1]._id
                ) {
                  return {
                    ...item,
                    start: currentLevel.value.end,
                    end: currentLevel.value.end
                  };
                } else {
                  valid = false;
                  validation.value = {
                    ...validation.value,
                    start: {
                      validation: false,
                      message: `Интервал включает в себя уже имеющийся интервал`
                    },
                    end: {
                      validation: false,
                      message: `Интервал включает в себя уже имеющийся интервал`
                    }
                  };
                }
              } else {
                return { ...item, start: currentLevel.value.end };
              }
            }
          });
        }
      }
    }
    if (!valid) {
      return;
    }
    await Promise.all([
      createLevel(currentLevel.value),
      includedRanges.map(item => {
        updateLevel(item);
      })
    ]);
    fetchLevels();
    creatingMode.value = false;
    resetCurrentLevel();
  } catch (e) {
    console.error(e);
  }
}

// refresh data in table while editing
function updateCurrentLevelTable(value) {
  updateCurrentLevel("end", value);
  validation.value = {
    name: { validation: true, message: "" },
    start: { validation: true, message: "" },
    end: { validation: true, message: "" },
    tableEnd: {
      validation: true,
      message: ""
    }
  };
  if (
    levelsList.value[levelsList.value.length - 1]._id === nextLevel.value._id
  ) {
    if (currentLevel.value.start < currentLevel.value.end) {
      nextLevel.value = { ...nextLevel.value, start: value, end: value };
    } else {
      validation.value = {
        ...validation.value,
        tableEnd: {
          validation: false,
          message: "Значение от должно быть больше значения до"
        }
      };
      const nextlevelItem = levelsList.value.find(
        item => item._id === nextLevel.value._id
      );
      nextLevel.value = nextlevelItem;
    }
  } else {
    if (
      currentLevel.value.start < currentLevel.value.end &&
      currentLevel.value.end < nextLevel.value.end
    ) {
      nextLevel.value = { ...nextLevel.value, start: value };
    } else {
      validation.value = {
        ...validation.value,
        tableEnd: {
          validation: false,
          message: "Значение от должно быть больше значения до"
        }
      };
      const nextlevelItem = levelsList.value.find(
        item => item._id === nextLevel.value._id
      );
      nextLevel.value = nextlevelItem;
    }
  }
}

// mode creating level
function goCreateMode() {
  creatingMode.value = true;
  resetCurrentLevel();
}

// mode editing level
function goEditMode(_id) {
  const levelItemIndex = levelsList.value.findIndex(item => item._id === _id);
  if (levelItemIndex === -1) {
    return;
  }
  setCurrentLevel(levelsList.value[levelItemIndex]);
  nextLevel.value = { ...levelsList.value[levelItemIndex + 1] };
  creatingMode.value = false;
}
</script>

<style lang="scss">
@import "@/assets/scss/variables.scss";
// @import 'src/assets/mixins.scss';
.page-head {
  display: flex;
  align-items: center;
}

.validation {
  &:focus-visible {
    outline-color: red !important;
  }
  &__message {
    font-size: 10px;
    color: red;
    position: absolute;
    width: 100%;
    left: 0;
  }
}
.participants {
  &__list {
    display: flex;
    justify-content: space-between;
    margin: 40px 0;
  }

  &__item {
    display: flex;
    align-items: center;
    color: $orange;
    font-size: 15px;
    font-weight: 600;

    svg {
      width: 26px;
      height: 26px;
      fill: $orange;
      margin-right: 12px;
    }
  }

  &__inner {
    margin-bottom: 40px;
    padding: 16px 22px;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 15px;
    background-color: $white_a;
  }

  &__top {
    display: flex;
    align-items: flex-end;
    margin-bottom: 30px;
  }

  &__info {
    display: flex;
    align-items: center;
  }

  &__main {
    color: $orange;
    font-weight: 600;
  }

  &__value {
    margin-bottom: 8px;
    font-size: 15px;
  }

  &__num {
    font-size: 13px;
  }

  &__devide {
    position: relative;
    width: 305px;
    height: 44px;
    margin-left: 45px;
    font-weight: 300;

    svg {
      width: 18px;
      height: 18px;
      fill: $white;
      margin-right: 10px;
    }

    &-value {
      position: absolute;
      top: -10px;
      right: -10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      border: 1px solid $white;
      color: $white;
      background-color: $orange;
    }
  }

  &__inline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  &__footer {
    display: flex;
    align-items: center;
    margin-top: 30px;
  }
}

.diagramm {
  margin-right: 17px;
  transform: rotate(45deg);
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  text-align: center;
  border: 8px solid $orange;
  border-left: 8px solid #e3e6e8;
  border-radius: 50%;
  margin-left: 0;
}

.sort {
  padding: 0 15px;

  .diagramm {
    &-25 {
      transform: rotate(130deg);
      border: 8px solid #e3e6e8;
      border-left: 8px solid $orange;
    }
  }

  &__head {
    margin-bottom: 23px;

    .participants__main {
      color: $gray_g;
    }
  }

  .tabs {
    min-height: 520px;

    &__list {
      margin-bottom: 15px;
    }

    &__link {
      width: 20%;
      height: 40px;
      font-size: 13px;
      font-weight: 300;
    }
  }

  &__inline {
    display: flex;
    justify-content: space-between;
  }

  &__inner {
    flex: 0 1 320px;
  }

  &__profile {
    margin-bottom: 130px;
  }

  &__bottom {
    display: flex;
    align-items: center;

    .button {
      width: 190px;
      height: 30px;
      font-size: 13px;
      margin-right: 20px;
    }
  }

  &__cancel {
    border: 1px solid $orange;
    color: $black_a;
  }

  &__clear {
    color: $orange;
    margin-left: 30px;
  }

  &__tags {
    margin-bottom: 100px;
  }

  &__contacts {
    .tags__item {
      padding-right: 35px;
      padding-left: 10px;
      margin-right: 20px;
    }

    .search__input {
      input {
        border: 1px solid $orange;
      }
    }

    .search {
      margin-bottom: 20px;
    }
  }

  &__radio {
    margin-bottom: 20px;
    border-radius: 10px;
    border: 1px solid $orange;
    overflow: hidden;
    display: inline-flex;

    &-item {
      &:last-child {
        .radio + label {
          border-right: none;
        }
      }
    }

    .radio {
      display: block;
      position: absolute;
      z-index: -1;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio + label {
      position: relative;
      cursor: pointer;
      padding: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 30px;
      font-size: 13px;
      font-weight: 300;
      min-width: 300px;
      border-right: 1px solid $orange;
    }

    .radio:checked + label {
      opacity: 1;
      background-color: $orange;
      color: $white;
    }
  }

  &__activity {
    margin-bottom: 100px;
  }

  &__files {
    .sort__radio {
      .radio + label {
        min-width: 190px;
      }
    }

    .group__label {
      font-size: 15px;
      margin-bottom: 10px;
    }

    &-inner {
      max-width: 556px;
    }
  }

  &__note {
    margin-bottom: 15px;
  }
}

.upload {
  margin-bottom: 15px;
  border-radius: 10px;
  background-color: $white_a;

  &__input {
    width: 0;
    height: 0;
    outline: 0;
    opacity: 0;
    pointer-events: none;
    user-select: none;
    padding: 0;
  }

  &__label {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 700;
    color: $gray_g;
    height: 110px;

    svg {
      width: 23px;
      height: 23px;
      fill: $orange;
      margin-right: 10px;
    }
  }

  &__result {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    order-radius: 10px;
    background-color: $white_a;
    font-size: 16px;
    color: $orange;
    font-weight: 700;
  }
}

.adding {
  color: $gray_g;

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin: 30px 0 25px;
  }

  &__settings {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    font-weight: 600;
    color: $orange;
    max-width: 260px;

    svg {
      width: 27px;
      height: 27px;
      margin-right: 10px;
      fill: $orange;
    }
  }

  &__note {
    flex: 0 1 570px;
    font-size: 14px;
    color: $gray_g;
  }
}

.import {
  margin: 20px 0 35px;
  padding: 20px 20px 40px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: $gray_g;
  font-size: 13px;
  font-weight: 300;

  &__title {
    margin-bottom: 25px;
    font-size: 16px;
    font-weight: 700;
  }

  &__inline {
    display: flex;
    margin-bottom: 45px;
  }

  &__main {
    flex: 0 1 310px;
  }

  &__aside {
    flex: 0 1 490px;
  }

  &__desc {
    ul {
      margin-bottom: 20px;
    }
  }

  &__img {
    margin-top: 10px;
  }

  .upload {
    margin: 0 auto;
    max-width: 595px;
  }

  .group {
    max-width: 420px;

    &__input {
      input {
        background-color: $white_a;
      }
    }
  }

  &__bottom {
    display: flex;
    margin-top: 20px;
  }

  &__btn {
    width: 140px;
    height: 35px;
    font-size: 13px;
    margin-right: 20px;
    border-radius: 30px;
  }
}

.last {
  &__title {
    margin-bottom: 25px;
    font-weight: 600;
  }

  &__table {
    margin-bottom: 30px;
  }

  &__row {
    display: flex;
    min-height: 60px;
    padding: 10px 5px;
    align-items: center;

    &:nth-child(odd) {
      background-color: $white_a;
    }
  }

  &__date {
    flex: 0 0 45px;
    margin-right: 60px;
  }

  &__activity {
    flex: 1 1 auto;
    margin-right: 15px;
    display: flex;
    align-items: flex-start;

    svg {
      width: 30px;
      height: 30px;
      fill: $gray_g;
      margin-right: 15px;
    }
  }

  &__cancel {
    flex: 0 0 90px;
    display: flex;
    align-items: center;
    margin-right: 20px;
    margin-left: auto;

    svg {
      width: 22px;
      height: 22px;
      fill: $gray_g;
      margin-right: 10px;
    }
  }

  &__history {
    display: flex;
    align-items: center;
    font-weight: 300;

    &-link {
      display: flex;
      align-items: center;
      font-weight: 500;
      color: $orange;
      margin-left: 10px;

      svg {
        width: 20px;
        height: 20px;
        fill: $orange;
        margin-right: 10px;
      }
    }
  }
}

.links {
  &__new {
    display: flex;
    align-items: center;
    margin: 20px 0;
    color: $orange;
    font-weight: 600;

    svg {
      width: 20px;
      height: 20px;
      fill: $orange;
      margin-right: 10px;
    }
  }

  &__inner {
    padding: 20px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }

  &__desc {
    margin-bottom: 15px;
    font-size: 13px;
    font-weight: 300;
  }

  &__main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  &__inline {
    flex: 0 1 490px;
    display: flex;

    .group {
      margin-bottom: 0;
      flex: 1 1 auto;

      input {
        background-color: $white_a;
        font-weight: 600;
      }
    }
  }

  &__btn {
    height: 36px;
    width: 125px;
    flex-shrink: 0;
    border-radius: 0 5px 5px 0;
  }

  &__settings {
    display: flex;
    align-items: center;
  }

  &__toogle {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 300;
    margin-right: 50px;
  }

  .button-toggle {
    margin-right: 10px;
  }

  &__delete {
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 300;
    margin-right: 30px;

    svg {
      width: 15px;
      height: 15px;
      fill: $gray_g;
      margin-right: 10px;
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
  }

  &__radio {
    margin-right: 10px;

    &-item {
      margin-bottom: 10px;
    }
    .radio {
      display: block;
      position: absolute;
      z-index: -1;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .radio + label {
      position: relative;
      padding: 0 0 0 30px;
      cursor: pointer;
      display: block;
      font-size: 13px;
      font-weight: 300;
    }

    .radio + label:before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1px solid $gray_c;
      background: transparent;
    }

    .radio + label:after {
      content: "";
      position: absolute;
      top: 6px;
      left: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $orange;
      opacity: 0;
      transition: 0.2s;
    }

    .radio:checked + label:after {
      opacity: 1;
    }
  }

  &__filter {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .group {
      margin-bottom: 0;
      flex: 0 0 165px;

      input {
        background-color: transparent;
      }
    }
  }

  &__double {
    flex-shrink: 0;
    width: 120px;
    padding: 0 5px;
    display: flex;
    height: 36px;
    border: 1px solid rgba(0, 0, 0, 0.1);

    .group {
      flex: 0 1 50%;

      input {
        background-color: transparent;
      }
    }

    .nice-select {
      width: 100% !important;
      border: none !important;
      padding-left: 0 !important;
    }
  }

  &__list {
    display: flex;
    align-items: center;
    margin-left: auto;
    font-size: 13px;
    font-weight: 300;
    text-align: center;
  }

  &__item {
    width: 100px;
    border-right: 1px solid $gray_g;

    &:last-child {
      border-right: none;
    }
  }

  &__num {
    font-weight: 500;
    font-size: 22px;
    margin-bottom: 5px;
  }
}

.invite {
  color: $gray_g;

  &__desc {
    margin: 25px 0;
    font-size: 13px;
    font-weight: 300;
    line-height: 1.4;
  }

  .tabs {
    &__link {
      width: 50%;
    }
  }

  &__list {
    margin: 20px 0 30px;
  }

  &__item {
    margin-bottom: 35px;
    padding: 20px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding-bottom: 5px;
  }

  &__inline {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  &__main {
    flex: 0 1 390px;
  }

  &__subtitle {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-bottom: 15px;

    svg {
      width: 30px;
      height: 30px;
      fill: $gray_g;
      margin-right: 10px;
    }
  }

  &__text {
    font-size: 13px;
    font-weight: 300;
  }

  &__aside {
    flex: 0 0 415px;
    display: flex;
    align-items: flex-start;
    padding: 15px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    background-color: $white_a;
  }

  &__toggle {
    display: flex;
    align-items: center;
    margin-right: 30px;
  }

  &__value {
    font-size: 13px;
    font-weight: 300;
  }

  &__time {
    &-title {
      font-size: 13px;
      font-weight: 300;
    }
  }

  &__triple {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    height: 28px;

    .nice-select {
      width: 100% !important;
      border: none !important;
      padding-left: 0 !important;
      font-size: 13px !important;
      font-weight: 300 !important;
    }

    .group {
      flex: 0 1 33%;
      margin-bottom: 0;

      input {
        background-color: transparent;
      }
    }
  }

  &__open {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 35px;
    cursor: pointer;

    svg {
      width: 35px;
      height: 35px;
      fill: $gray_e;
    }
  }

  &__drop {
    display: none;

    .group {
      &__label {
        font-weight: 500;
      }

      input {
        height: 45px;
      }
    }
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
  }

  &__inner {
    display: flex;
  }

  &__btn {
    margin-right: 20px;
  }

  &__settings {
    flex: 0 1 350px;
    display: flex;
    justify-content: space-between;
  }

  &__control {
    display: flex;
    align-items: center;
    font-size: 13px;
    color: $gray_g;

    svg {
      width: 20px;
      height: 20px;
      fill: $gray_g;
      margin-right: 10px;
    }
  }

  &__add {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    border: 1px solid $orange;
    height: 35px;
    color: $orange;
    font-size: 13px;

    svg {
      width: 20px;
      height: 20px;
      fill: $orange;
      margin-right: 10px;
    }
  }
}

.tags-page {
  &__top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 25px 0;

    .search {
      flex: 0 1 440px;
    }
  }

  &__link {
    display: flex;
    align-items: center;
    color: $orange;

    svg {
      width: 20px;
      height: 20px;
      fill: $orange;
      margin-right: 10px;
    }
  }

  .tags__section {
    position: relative;
    padding: 15px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
  }
}

.status {
  &__form {
    margin-top: 25px;
  }

  &__desc {
    margin-bottom: 20px;
    text-align: left;
    font-size: 13px;
    font-weight: 300;
  }

  &__top {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  &__inline {
    display: none;

    &.active {
      display: flex;
      gap: 13px;
    }
  }

  .group {
    display: flex;
    align-items: center;
    margin-bottom: 0;
    margin-right: 10px;

    &__label {
      margin-bottom: 0;
      margin-right: 10px;
    }

    &__input {
      width: 126px;

      &-amount {
        width: 126px;
        text-align: center;
      }
    }
  }

  &__btn {
    color: $orange;
    font-weight: 600;
    font-size: 13px;

    &.active {
      width: 190px;
      height: 36px;
      background-color: $orange;
      color: $white;
      border-radius: 10px;
      margin-left: 125px;

      svg {
        fill: $white;
      }
    }

    svg {
      width: 20px;
      height: 20px;
      fill: $orange;
      margin-right: 10px;
    }
  }

  &__table {
    max-width: 670px;
  }

  &__row {
    position: relative;
    display: flex;
    align-items: center;
    height: 80px;
    padding: 0 15px;

    &:nth-child(odd) {
      background-color: $white_a;
    }
  }

  &__value {
    flex: 0 1 190px;
    margin-right: 10px;
    font-size: 16px;
    font-weight: 700;
  }

  &__from {
    flex: 0 1 160px;
    margin-right: 10px;
  }

  &__subtitle {
    font-weight: 300;
    margin-left: 30px;
  }

  &__delete {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 35px;
    cursor: pointer;
    height: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    right: -40px;

    svg {
      width: 20px;
      height: 20px;
      fill: $gray_g;
    }
  }
}

.history-page {
  .history {
    margin-top: 25px;

    .nice-select {
      margin-top: 3px;
    }

    .filter {
      justify-content: flex-start;
    }
  }
}

// ***********************************
// стили с _elements.scss

.button {
  position: relative;

  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 55px;
  text-align: center;
  text-decoration: none;
  font-family: $font;
  font-size: 16px;
  border: 0px;
  border-radius: 12px;

  cursor: pointer;
  appearance: none;
  outline: none;
  transition: all linear 0.3s;

  &-orange {
    background-color: $orange;
    color: $white;
  }

  &-bordered {
    border-radius: 32px;
    border: 1px solid $gray_a;
    color: $gray_a;
    font-size: 12px;
  }

  &-bordered-orange {
    border-radius: 32px;
    border: 1px solid $orange;
    color: $black_a;
  }
}

.btn-small {
  display: flex;

  .button {
    width: 145px;
    height: 35px;
    font-size: 13px;
    border-radius: 30px;
    margin-right: 20px;
  }
}

.group {
  margin-bottom: 15px;

  &__label {
    display: block;
    margin-bottom: 5px;
    font-size: 13px;
    font-weight: 300;
  }

  //select
  .nice-select {
    position: relative;
    width: 100% !important;
    background-color: transparent !important;
    border-radius: 5px !important;
    border: 1px solid rgba(0, 0, 0, 0.1) !important;
    float: none !important;
    font-family: inherit;
    font-size: 15px !important;
    height: 36px !important;
    line-height: 36px !important;
    padding-left: 10px !important;
    padding-right: 36px !important;
    text-align: left !important;
    color: $gray_g;

    .list {
      width: 100% !important;
    }

    &::after {
      border-bottom: none !important;
      border-right: none !important;
      content: "";
      display: block;
      width: 20px !important;
      height: 20px !important;
      line-height: 0 !important;
      margin-top: 0;
      pointer-events: none;
      position: absolute;
      right: 5px !important;
      top: 50% !important;

      -webkit-transform-origin: 0 !important;
      -ms-transform-origin: 0;
      transform-origin: 0 !important;
      transform: rotate(0) translateY(-50%) !important;
      -webkit-transition: all 0.15s ease-in-out;
      transition: all 0.15s ease-in-out;
      // background-image: url(@/assets/img/general/arrow-down.svg);
      background-repeat: no-repeat;
      background-position: center;
      background-size: 100%;
    }
  }

  &__inline {
    display: flex;
    justify-content: space-between;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      left: 50%;
      width: 20px;
      height: 1px;
      background-color: rgba(0, 0, 0, 0.1);
    }

    .group__input {
      width: 130px;
    }
  }

  &__input {
    position: relative;

    input {
      height: 36px;
      border-radius: 5px !important;
      border: 1px solid rgba(0, 0, 0, 0.1) !important;
      font-weight: 300;
      font-size: 15px;
      background-color: transparent;
    }
  }

  &__date {
    .group__input {
      // background-image: url(../img/layout/general/date.svg);
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 20px;
    }
  }

  &__textarea {
    textarea {
      border: 1px solid rgba(0, 0, 0, 0.1) !important;
      border-radius: 10px !important;
      padding: 15px !important;
      min-height: 170px !important;
    }
  }

  &__head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 300;

    .group__label {
      margin-bottom: 0;
    }
  }

  &__push {
    textarea {
      min-height: 100px !important;
    }
  }

  &__mail {
    textarea {
      min-height: 270px !important;
    }
  }
}
</style>
