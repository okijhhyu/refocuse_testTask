import { defineStore } from "pinia";

export interface Level {
  _id?: string;
  name: string;
  start: number;
  end: number;
}
const allCookies = document.cookie;

// Чтение конкретной куки по её имени
function getCookie(cookieName: string) {
  const name = cookieName + "=";
  const cookieArray = allCookies.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === " ") {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
}

export const useLevelsStore = defineStore("levels", {
  state: () => ({
    levels: [] as Level[],
    level: {
      name: "",
      start: 0,
      end: 0
    } as Level
  }),

  getters: {
    levelsList(): Level[] {
      return this.levels;
    },
    currentLevel(): Level {
      return this.level;
    }
  },

  actions: {
    setCurrentLevel(level: Level) {
      this.level = level;
    },

    resetCurrentLevel() {
      this.level = {
        name: "",
        start: 0,
        end: 0
      } as Level;
    },

    updateCurrentLevel(key: string, value: unknown) {
      this.level = { ...this.level, [key]: value };
    },

    async fetchLevels() {
      try {
        const response = await fetch("http://54.38.79.153:3000/api/levels", {
          headers: {
            Authorization: `Bearer ${getCookie("authToken")}`
          }
        });
        const data: Level[] = await response.json();
        this.levels = data.sort((a, b) => a.start - b.start);
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async getLevelById(levelId: string) {
      try {
        const response = await fetch(
          `http://54.38.79.153:3000/api/levels/${levelId}`,
          {
            headers: {
              Authorization: `Bearer ${getCookie("authToken")}`
            }
          }
        );
        const data: Level = await response.json();
        this.level = data;
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async createLevel(newLevel: Level) {
      try {
        await fetch("http://54.38.79.153:3000/api/levels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("authToken")}`
          },
          body: JSON.stringify(newLevel)
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async updateLevel(updatedLevel: Level) {
      try {
        await fetch(`http://54.38.79.153:3000/api/levels/${updatedLevel._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("authToken")}`
          },
          body: JSON.stringify(updatedLevel)
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    async deleteLevel(levelId: string) {
      try {
        await fetch(`http://54.38.79.153:3000/api/levels/${levelId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getCookie("authToken")}`
          }
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
  }
});
