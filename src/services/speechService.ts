/**
 * Thin wrapper around SpeechSynthesis. Speech recognition is deliberately NOT
 * used for scoring: Safari on iOS does not expose a reliable, offline-capable
 * recognition API, and a fake pronunciation score would be worse than none.
 */
export const speechService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  voicesFor(lang: string): SpeechSynthesisVoice[] {
    if (!this.isSupported()) return [];
    const prefix = lang.split('-')[0];
    return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith(prefix));
  },

  speak(text: string, lang = 'en-US', rate = 0.95): boolean {
    if (!this.isSupported()) return false;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      const voice = this.voicesFor(lang)[0];
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      return false;
    }
  },

  stop(): void {
    if (this.isSupported()) window.speechSynthesis.cancel();
  },
};
