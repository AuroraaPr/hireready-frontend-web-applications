import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UniversityApiResult } from '../models/universityApiResult';
import { UNIVERSIDADES_PERU } from '../data/universidades-peru';

@Injectable({
  providedIn: 'root',
})
export class UniversityService {

  search(name: string): Observable<UniversityApiResult[]> {
    const term = (name || '').trim().toLowerCase();
    if (term.length < 3) {
      return of([]);
    }

    const coincidencias = UNIVERSIDADES_PERU
      .filter((u) => u.toLowerCase().includes(term))
      .slice(0, 8)
      .map((u) => this.toResult(u));

    return of(coincidencias);
  }

  private toResult(nombre: string): UniversityApiResult {
    return {
      name: nombre,
      country: 'Peru',
      alpha_two_code: 'PE',
      domains: [],
      web_pages: [],
    };
  }
}