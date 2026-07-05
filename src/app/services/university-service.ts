import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UniversityApiResult } from '../models/universityApiResult'; 
 
/**
 * Consume la API pública y gratuita de Hipolabs (sin API key) para sugerir
 * nombres reales de universidades a nivel mundial mientras el postulante escribe.
 * Doc: https://github.com/Hipo/university-domains-list-api
 */
@Injectable({
  providedIn: 'root',
})

export class UniversityService {
    private readonly apiUrl = 'http://universities.hipolabs.com/search';
 
  constructor(private http: HttpClient) {}
 
  search(name: string): Observable<UniversityApiResult[]> {
    const term = (name || '').trim();
    if (term.length < 3) {
      return of([]);
    }
 
    return this.http.get<UniversityApiResult[]>(this.apiUrl, { params: { name: term } }).pipe(
      catchError(() => of([])),
    );
  }
}