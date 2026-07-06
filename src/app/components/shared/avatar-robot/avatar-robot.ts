import { Component, Input } from '@angular/core';

export type AvatarEstado = 'idle' | 'talking' | 'listening' | 'thinking';
export type BocaForma = 'closed' | 'small' | 'open' | 'round';

@Component({
  selector: 'app-avatar-robot',
  standalone: false,
  templateUrl: './avatar-robot.html',
  styleUrl: './avatar-robot.css',
})
export class AvatarRobot {
  @Input() estado: AvatarEstado = 'idle';
  // TTS controla
  @Input() boca: BocaForma = 'closed';

  get esperando(): boolean { 
    return this.estado === 'idle'; 
  }
  get hablando(): boolean { 
    return this.estado === 'talking'; 
  }
  get escuchando(): boolean { 
    return this.estado === 'listening'; 
  }
  get pensando(): boolean { 
    return this.estado === 'thinking'; 
  }
}
