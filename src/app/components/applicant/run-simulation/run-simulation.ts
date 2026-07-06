import { ChangeDetectorRef, Component } from '@angular/core';
import { AvatarEstado, BocaForma } from '../../shared/avatar-robot/avatar-robot';
import { ActivatedRoute, Router } from '@angular/router';
import { SimulationService } from '../../../services/simulation-service';
import { ContinueSimulationResponseDTO } from '../../../models/continueSimulationResponseDTO';
import { SubmitResponseResponseDTO } from '../../../models/submitResponseResponseDTO';
import { TtsService } from '../../../services/tts-service';

type Fase = 'loading' | 'reading' | 'countdown' | 'recording' | 'processing' | 'finished';

@Component({
  selector: 'app-run-simulation',
  standalone: false,
  templateUrl: './run-simulation.html',
  styleUrl: './run-simulation.css',
})
export class RunSimulation {

  simulationId!: number;
  bankId!: number;
  fase: Fase = 'loading';

  preguntaActual: string = '';
  preguntaId: number = 0;
  totalPreguntas: number = 0;
  respondidas: number = 0;

  bankName: string = '';

  // avatar
  estadoAvatar: AvatarEstado = 'idle';
  bocaActual: BocaForma = 'closed';

  countdownNum: number = 3;

  // lip-sync
  private lipsyncInterval: any = null;
  private bocasSecuencia: BocaForma[] = ['closed', 'small', 'open', 'small', 'round', 'open', 'closed'];
  private bocaIdx: number = 0;

  // grabación
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioStream: MediaStream | null = null;
  audioBlob: Blob | null = null;
  grabando: boolean = false;
  yaGrabo: boolean = false;
  private enviarTrasDetener: boolean = false;

  // tiempo
  tiempoSegundos: number = 0;
  private tiempoInterval: any = null;
  readonly TIEMPO_MAX = 120;  // 2 min

  // ondas
  niveles: number[] = new Array(12).fill(0.2);
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private nivelesInterval: any = null;

  // salida y timers
  private saliendo: boolean = false;
  private countdownTimer: any = null;
  private finalizeTimer: any = null;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private simulationService: SimulationService,
              private ttsService: TtsService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.simulationId = Number(this.route.snapshot.paramMap.get('id'));
    this.bankId = Number(this.route.snapshot.queryParamMap.get('bankId'));
    this.cargarSimulacion();
  }

  ngOnDestroy() {
    this.limpiarTodo();
  }

  cargarSimulacion() {
    this.fase = 'loading';
    this.simulationService.getCurrentByBank(this.bankId).subscribe({
      next: (data: ContinueSimulationResponseDTO) => {
        this.simulationId = data.simulationId;
        if (!data.pendingQuestion) {
          this.finalizarSimulacion();
          return;
        }
        this.preguntaActual = data.pendingQuestion.content;
        this.preguntaId = data.pendingQuestion.id;
        this.totalPreguntas = data.totalQuestions;
        this.respondidas = data.answeredQuestions;

        this.mostrarPregunta();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  mostrarPregunta() {
    this.fase = 'reading';
    this.estadoAvatar = 'talking';
    this.bocaActual = 'closed';
    this.cdr.detectChanges();

    this.iniciarLipsync();

    // hablar la pregunta
    this.ttsService.hablar(
      this.preguntaActual,
      () => this.onPalabra(),
      () => this.onFinLectura()
    );
  }

  private iniciarLipsync() {
    this.detenerLipsync();
    this.lipsyncInterval = setInterval(() => {
      this.bocaIdx = (this.bocaIdx + 1) % this.bocasSecuencia.length;
      this.bocaActual = this.bocasSecuencia[this.bocaIdx];
      this.cdr.detectChanges();
    }, 120);
  }

  private detenerLipsync() {
    if (this.lipsyncInterval) {
      clearInterval(this.lipsyncInterval);
      this.lipsyncInterval = null;
    }
    this.bocaActual = 'closed';
  }

  private onPalabra() {
    this.bocaActual = 'open';
    this.cdr.detectChanges();
  }

  private onFinLectura() {
    if (this.saliendo) return;
    this.detenerLipsync();
    this.estadoAvatar = 'idle';
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.saliendo) return;
      this.IniciarCuenta();
    }, 400);
  }

  IniciarCuenta() {
    if (this.saliendo) return;
    this.fase = 'countdown';
    this.estadoAvatar = 'idle';
    this.countdownNum = 3;
    this.limpiarCountdown();
    this.countdownTimer = setInterval(() => {
      this.countdownNum--;
      this.cdr.detectChanges();
      if (this.countdownNum <= 0) {
        this.limpiarCountdown();
        this.iniciarGrabacion();
      }
    }, 1000);
  }

  private limpiarCountdown() {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  async iniciarGrabacion() {
    if (this.saliendo) return;
    this.fase = 'recording';
    this.estadoAvatar = 'listening';
    this.audioBlob = null;
    this.audioChunks = [];
    this.tiempoSegundos = 0;
    this.cdr.detectChanges();

    try {
      // acceso al micrófono
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.saliendo) {
        this.audioStream.getTracks().forEach(t => t.stop());
        this.audioStream = null;
        return;
      }

      this.mediaRecorder = new MediaRecorder(this.audioStream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {

        this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.yaGrabo = true;
        this.cdr.detectChanges();

        if (this.enviarTrasDetener) {
          this.enviarTrasDetener = false;
          this.enviarAlBackend();
        }
      };

      this.mediaRecorder.start(1000);
      this.grabando = true;

      // ondas
      this.iniciarOndas();

      // contador
      this.tiempoInterval = setInterval(() => {
        this.tiempoSegundos++;
        this.cdr.detectChanges();

        if (this.tiempoSegundos >= this.TIEMPO_MAX) {
          this.DetenerYEnviar();
        }
      }, 1000);

    } catch (err) {
      console.log('Error al acceder al micrófono:', err);
    }
  }

  private iniciarOndas() {
    if (!this.audioStream) return;
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(this.audioStream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 64;
    source.connect(this.analyser);

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    this.nivelesInterval = setInterval(() => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      const barras = 12;
      const nuevoNiveles: number[] = [];
      const step = Math.floor(bufferLength / barras);
      for (let i = 0; i < barras; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        const avg = sum / step / 255;
        nuevoNiveles.push(Math.max(0.15, avg));
      }
      this.niveles = nuevoNiveles;
      this.cdr.detectChanges();
    }, 100);
  }

  private detenerOndas() {
    if (this.nivelesInterval) { clearInterval(this.nivelesInterval); this.nivelesInterval = null; }
    if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    this.analyser = null;
    this.niveles = new Array(12).fill(0.2);
  }

  formatoTiempo(segundos: number): string {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  }

  private detenerGrabacion() {
    if (this.mediaRecorder && this.grabando) {
      this.mediaRecorder.stop();
      this.grabando = false;
    }
    if (this.tiempoInterval) { clearInterval(this.tiempoInterval); this.tiempoInterval = null; }
    this.detenerOndas();
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(t => t.stop());
      this.audioStream = null;
    }
  }

  Regrabar() {
    this.detenerGrabacion();
    this.audioBlob = null;
    this.yaGrabo = false;

    this.IniciarCuenta();
  }

  DetenerYEnviar() {
    if (this.grabando) {

      this.enviarTrasDetener = true;

      setTimeout(() => this.detenerGrabacion(), 250);
    } else {
      this.enviarAlBackend();
    }
  }

  private enviarAlBackend() {
    if (!this.audioBlob) {
      console.log('No hay audio para enviar');
      return;
    }

    this.fase = 'processing';
    this.estadoAvatar = 'thinking';
    this.cdr.detectChanges();

    this.simulationService.submitResponse(
      this.simulationId,
      this.preguntaId,
      this.tiempoSegundos,
      this.audioBlob
    ).subscribe({
      next: (data: SubmitResponseResponseDTO) => {
        if (this.saliendo) return; 
        if (data.isLast) {
          // era la última
          this.finalizarSimulacion();
        } else {
          // cargar la siguiente pregunta
          this.preguntaActual = data.nextQuestion!.content;
          this.preguntaId = data.nextQuestion!.id;
          this.respondidas = data.answeredQuestions;
          this.totalPreguntas = data.totalQuestions;
          this.yaGrabo = false;
          this.audioBlob = null;

          this.mostrarPregunta();
        }
      },
      error: (err) => {
        if (this.saliendo) return;
        console.log('Error al enviar respuesta:', err);

        this.fase = 'recording';
        this.cdr.detectChanges();
      }
    });
  }

  finalizarSimulacion() {
    if (this.saliendo) return;
    this.fase = 'finished';
    this.estadoAvatar = 'listening';

    this.ttsService.detener();
    this.detenerLipsync();
    this.detenerGrabacion();
    this.cdr.detectChanges();

    this.simulationService.finalize(this.simulationId).subscribe({
      next: () => {
        this.finalizeTimer = setTimeout(() => {
          this.router.navigate(['/applicant/simulations', this.simulationId, 'report'], { queryParams: { from: 'run' } });
        }, 3500);
      },
      error: (err) => {
        console.log(err);
        this.finalizeTimer = setTimeout(() => {
          this.router.navigate(['/applicant/simulations', this.simulationId, 'report'], { queryParams: { from: 'run' } });
        }, 3500);
      }
    });
  }

  Salir() {
    this.limpiarTodo();
    this.simulationService.exit(this.simulationId).subscribe({
      next: () => { this.router.navigate(['/applicant/simulations']); },
      error: (err) => {
        console.log(err);
        this.router.navigate(['/applicant/simulations']);
      }
    });
  }

  private limpiarTodo() {
    this.saliendo = true;
    this.ttsService.detener();
    this.detenerLipsync();
    this.limpiarCountdown();
    this.detenerGrabacion();
    if (this.finalizeTimer) { clearTimeout(this.finalizeTimer); this.finalizeTimer = null; }
  }

  get progresoPct(): number {
    if (this.totalPreguntas === 0) return 0;
    return (this.respondidas / this.totalPreguntas) * 100;
  }

  get numeroPregunta(): number {
    return this.respondidas + 1;
  }
}