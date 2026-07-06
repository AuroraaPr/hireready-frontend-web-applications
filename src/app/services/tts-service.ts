import { Injectable } from '@angular/core';

export type BocaForma = 'closed' | 'small' | 'open' | 'round';

@Injectable({ providedIn: 'root' })
export class TtsService {

  private synth = window.speechSynthesis;
  private voces: SpeechSynthesisVoice[] = [];
  private vozElegida: SpeechSynthesisVoice | null = null;
  private vocesListas: boolean = false;

  constructor() {
    this.cargarVoces();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.cargarVoces();
    }
  }

  private cargarVoces() {
    const v = this.synth.getVoices();
    if (v.length > 0) {
      this.voces = v;
      this.vocesListas = true;
      this.vozElegida = this.elegirMejorVoz();
    }
  }

  private elegirMejorVoz(): SpeechSynthesisVoice | null {
    if (this.voces.length === 0) return null;

    const googleUS = this.voces.find(v =>
      /google/i.test(v.name) && v.lang.toLowerCase() === 'es-us'
    );
    if (googleUS) return googleUS;

    const googleES = this.voces.find(v =>
      /google/i.test(v.name) && v.lang.toLowerCase().startsWith('es')
    );
    if (googleES) return googleES;

    const cualquierES = this.voces.find(v => v.lang.toLowerCase().startsWith('es'));
    if (cualquierES) return cualquierES;

    return this.voces[0];
  }

  hablar(texto: string, onBoundary: () => void, onEnd: () => void) {
    this.synth.cancel();

    if (!this.vocesListas || !this.vozElegida) {
      this.cargarVoces();
      if (!this.vozElegida) {
        setTimeout(() => this.hablarAhora(texto, onBoundary, onEnd), 250);
        return;
      }
    }
    this.hablarAhora(texto, onBoundary, onEnd);
  }

  private hablarAhora(texto: string, onBoundary: () => void, onEnd: () => void) {
    const utter = new SpeechSynthesisUtterance(texto);
    if (this.vozElegida) {
      utter.voice = this.vozElegida;
      utter.lang = this.vozElegida.lang;
    } else {
      utter.lang = 'es-US';
    }
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    utter.onboundary = () => onBoundary();
    utter.onend = () => onEnd();
    utter.onerror = (e) => {
      console.log('TTS error:', e);
      onEnd();
    };

    if (this.synth.paused) {
      this.synth.resume();
    }

    this.synth.speak(utter);
  }

  detener() {
    this.synth.cancel();
  }
}