import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type Idioma = 'es' | 'en';

const CLAVE_IDIOMA = 'idioma';

/**
 * Textos de la interfaz cargados en tiempo de ejecución desde i18n/<idioma>.json.
 * Los textos y el idioma son signals: las plantillas que llaman a t() o a los
 * formateadores se vuelven a pintar solas al cambiar de idioma.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly http = inject(HttpClient);
  private readonly documento = inject(DOCUMENT);

  readonly idioma = signal<Idioma>(this.idiomaInicial());
  private readonly textos = signal<Record<string, string>>({});

  private readonly formatoNumero = computed(() => new Intl.NumberFormat(this.idioma()));
  private readonly formatoFecha = computed(
    () => new Intl.DateTimeFormat(this.idioma(), { dateStyle: 'short', timeStyle: 'short' }),
  );

  /** Carga (y persiste) el idioma indicado; sin argumento, el idioma actual. */
  async cargar(idioma: Idioma = this.idioma()): Promise<void> {
    const textos = await firstValueFrom(
      this.http.get<Record<string, string>>(`i18n/${idioma}.json`),
    );
    this.textos.set(textos);
    this.idioma.set(idioma);
    this.documento.documentElement.lang = idioma;
    try {
      localStorage.setItem(CLAVE_IDIOMA, idioma);
    } catch {
      // sin almacenamiento: el idioma solo dura lo que dure la pestaña
    }
  }

  /** Traduce una clave (si no existe, devuelve la propia clave). */
  t(clave: string): string {
    return this.textos()[clave] ?? clave;
  }

  numero(valor: number): string {
    return this.formatoNumero().format(valor);
  }

  fecha(fecha: Date): string {
    return this.formatoFecha().format(fecha);
  }

  private idiomaInicial(): Idioma {
    let guardado: string | null = null;
    try {
      guardado = localStorage.getItem(CLAVE_IDIOMA);
    } catch {
      // sin almacenamiento: se decide por el idioma del navegador
    }
    if (guardado === 'es' || guardado === 'en') return guardado;
    return navigator.language.startsWith('en') ? 'en' : 'es';
  }
}
