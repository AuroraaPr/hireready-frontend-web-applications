import { Component, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { SimulationService } from '../../../services/simulation-service';
import { SimulationReportFullResponseDTO } from '../../../models/simulationReportFullResponseDTO';
import { ResponseDetailResponseDTO } from '../../../models/responseDetailResponseDTO';

@Component({
  selector: 'app-report-simulation',
  standalone: false,
  templateUrl: './report-simulation.html',
  styleUrl: './report-simulation.css',
})
export class ReportSimulation {

  simulationId!: number;
  reporte: SimulationReportFullResponseDTO | null = null;
  cargando: boolean = true;

  readonly RING_CIRC = 414.7;

  // audio
  private audio: HTMLAudioElement | null = null;
  reproduciendoId: number | null = null;
  cargandoAudioId: number | null = null;
  private audioUrls: Map<number, string> = new Map();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private location: Location,
              private simulationService: SimulationService,
              private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.simulationId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarReporte();
  }

  ngOnDestroy() {
    this.detenerAudio();
    this.audioUrls.forEach(url => URL.revokeObjectURL(url));
    this.audioUrls.clear();
  }

  cargarReporte() {
    this.cargando = true;
    this.simulationService.getReport(this.simulationId).subscribe({
      next: (data) => {
        this.reporte = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  ringOffset(score: number): number {
    const pct = Math.max(0, Math.min(100, score)) / 100;
    return this.RING_CIRC * (1 - pct);
  }

  fechaLegible(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  duracionTotalMin(): number {
    if (!this.reporte?.responses || this.reporte.responses.length === 0) return 0;
    const totalSegundos = this.reporte.responses.reduce((sum, r) => sum + (r.duration || 0), 0);
    return Math.max(1, Math.round(totalSegundos / 60));
  }

  parsearFeedback(feedback: string): string {
    return feedback ? feedback.trim() : '';
  }

  Reproducir(resp: ResponseDetailResponseDTO) {
    const id = resp.responseId;

    if (this.reproduciendoId === id && this.audio) {
      this.audio.pause();
      this.reproduciendoId = null;
      return;
    }

    this.detenerAudio();

    const cached = this.audioUrls.get(id);
    if (cached) {
      this.reproducirUrl(cached, id);
      return;
    }

    this.cargandoAudioId = id;
    this.simulationService.getResponseAudio(this.simulationId, id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.audioUrls.set(id, url);
        this.cargandoAudioId = null;
        this.reproducirUrl(url, id);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error al cargar el audio:', err);
        this.cargandoAudioId = null;
        this.cdr.detectChanges();
      }
    });
  }

  private reproducirUrl(url: string, id: number) {
    this.audio = new Audio(url);
    this.reproduciendoId = id;
    this.audio.play();
    this.audio.onended = () => {
      this.reproduciendoId = null;
      this.cdr.detectChanges();
    };
    this.audio.onerror = () => {
      this.reproduciendoId = null;
      this.cdr.detectChanges();
    };
  }

  private detenerAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    this.reproduciendoId = null;
  }

  Volver() {

    const from = this.route.snapshot.queryParamMap.get('from');
    if (from === 'run') {
      this.router.navigate(['/applicant/simulations']);
    } else {
      this.location.back();
    }
  }
}