import { Howl } from "howler";
import { siteAssets } from "./data/assets";

type SoundKey = keyof typeof siteAssets.sound;

class SoundDeck {
  private sounds = new Map<SoundKey, Howl>();
  private muted = true;
  private bgmId: number | null = null;

  unlock() {
    this.muted = false;
    const sound = this.get("on");
    const id = sound.play();
    window.setTimeout(() => sound.stop(id), 80);
    this.playBgm();
  }

  mute() {
    this.muted = true;
    this.stopBgm();
    this.get("off").play();
  }

  play(key: SoundKey) {
    if (this.muted) return;
    this.get(key).play();
  }

  dispose() {
    this.stopBgm();
    this.sounds.forEach((sound) => sound.unload());
    this.sounds.clear();
  }

  private playBgm() {
    const bgm = this.get("bgm");
    bgm.loop(true);
    bgm.volume(0.18);
    if (this.bgmId === null) {
      this.bgmId = bgm.play();
    }
  }

  private stopBgm() {
    const bgm = this.sounds.get("bgm");
    if (bgm) bgm.stop();
    this.bgmId = null;
  }

  private get(key: SoundKey) {
    const existing = this.sounds.get(key);
    if (existing) return existing;

    const sound = new Howl({
      src: [siteAssets.sound[key]],
      html5: true,
      volume: key === "bgm" ? 0.18 : 0.8,
    });

    this.sounds.set(key, sound);
    return sound;
  }
}

export const soundDeck = new SoundDeck();
