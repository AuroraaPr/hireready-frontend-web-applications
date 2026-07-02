import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

export type TargetType = 'applicant' | 'company';
export type AccionTipo = 'deactivate' | 'activate';

@Component({
  selector: 'app-confirmar-accion',
  standalone: false,
  templateUrl: './confirmar-accion.html',
  styleUrl: './confirmar-accion.css',
})
export class ConfirmarAccion implements OnChanges {
  /** Controla si el modal está visible */
  @Input() visible: boolean = false;

  /** 'applicant' (postulante) o 'company' (empresa) -> cambia todo el contenido */
  @Input() targetType: TargetType = 'applicant';

  /** 'deactivate' o 'activate' */
  @Input() action: AccionTipo = 'deactivate';

  /** Nombre del postulante/empresa a mostrar y a confirmar por escritura */
  @Input() targetName: string = '';

  /** Dato secundario a mostrar en el resumen, ej: "Ing. de Sistemas · PUCP" o "Rappi Perú · Delivery" */
  @Input() targetSubtitle: string = '';

  /** Cantidad relacionada (bancos de la empresa o simulaciones del postulante) */
  @Input() relatedCount: number = 0;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirmText: string = '';
  loading: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.confirmText = '';
      this.loading = false;
    }
  }

  get esDesactivar(): boolean {
    return this.action === 'deactivate';
  }

  get esPostulante(): boolean {
    return this.targetType === 'applicant';
  }

  get etiquetaRol(): string {
    return this.esPostulante ? 'postulante' : 'empresa';
  }

  get titulo(): string {
    return this.esDesactivar ? `¿Desactivar a ${this.targetName}?` : `¿Reactivar a ${this.targetName}?`;
  }

  get descripcion(): string {
    if (this.esDesactivar) {
      return this.esPostulante
        ? 'Esta acción bloquea el acceso del postulante al sistema y oculta inmediatamente su perfil de las empresas. Su historial de simulaciones se conservará.'
        : 'Esta acción bloquea el acceso de la empresa al sistema y oculta inmediatamente sus bancos de preguntas para todos los postulantes. Las simulaciones ya completadas se conservarán como histórico.';
    }
    return this.esPostulante
      ? 'La cuenta del postulante volverá a estar activa y su perfil será visible nuevamente para las empresas.'
      : 'La cuenta de la empresa volverá a estar activa y sus bancos de preguntas se mostrarán nuevamente a los postulantes.';
  }

  get checklist(): string[] {
    if (this.esDesactivar) {
      if (this.esPostulante) {
        return [
          'El postulante no podrá iniciar sesión',
          'Su perfil dejará de mostrarse a las empresas',
          `Su${this.relatedCount === 1 ? '' : 's'} ${this.relatedCount} simulación${this.relatedCount === 1 ? '' : 'es'} se conservará${this.relatedCount === 1 ? '' : 'n'} como histórico`,
          'Podrás reactivar la cuenta más adelante',
        ];
      }
      return [
        'La empresa no podrá iniciar sesión',
        `Su${this.relatedCount === 1 ? '' : 's'} ${this.relatedCount} banco${this.relatedCount === 1 ? '' : 's'} de preguntas dejará${this.relatedCount === 1 ? '' : 'n'} de mostrarse a postulantes`,
        'Las simulaciones ya completadas se preservan como histórico',
        'Podrás reactivar la cuenta más adelante',
      ];
    }
    if (this.esPostulante) {
      return [
        'El postulante podrá iniciar sesión nuevamente',
        'Su perfil volverá a estar visible para las empresas',
        'Podrá continuar generando simulaciones',
      ];
    }
    return [
      'La empresa podrá iniciar sesión nuevamente',
      'Sus bancos de preguntas volverán a mostrarse a los postulantes',
      'Podrá seguir generando simulaciones para sus procesos',
    ];
  }

  get requiereEscribirNombre(): boolean {
    return this.esDesactivar;
  }

  get puedeConfirmar(): boolean {
    if (!this.requiereEscribirNombre) return true;
    return this.confirmText.trim() === this.targetName.trim() && this.targetName.trim().length > 0;
  }

  onConfirm() {
    if (!this.puedeConfirmar || this.loading) return;
    this.loading = true;
    this.confirmed.emit();
  }

  onCancel() {
    if (this.loading) return;
    this.cancelled.emit();
  }

  onBackdropClick() {
    this.onCancel();
  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }
}
