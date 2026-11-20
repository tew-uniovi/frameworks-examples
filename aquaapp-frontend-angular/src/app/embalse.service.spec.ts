import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmbalseService } from './embalse.service';
import { Embalse } from './modelos';

const DATOS: Embalse[] = Array.from({ length: 7 }, (_, i) => ({
  id: i + 1,
  nombre: i === 0 ? 'Embalse de Tanes' : `Embalse ${i + 1}`,
  capacidadHm3: 100,
  nivelActualHm3: (i + 1) * 10,
}));

describe('EmbalseService', () => {
  let servicio: EmbalseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servicio = TestBed.inject(EmbalseService);
    http = TestBed.inject(HttpTestingController);
    servicio.cargar().subscribe();
    http.expectOne('/api/embalses').flush(DATOS);
  });

  it('carga el listado y calcula el nivel medio sobre todos los embalses', () => {
    expect(servicio.cargado()).toBe(true);
    expect(servicio.embalses().length).toBe(7);
    expect(servicio.nivelMedio()).toBe(40);
  });

  it('pagina de 5 en 5', () => {
    expect(servicio.totalPaginas()).toBe(2);
    expect(servicio.paginaActual().length).toBe(5);
    servicio.ponerPagina(1);
    expect(servicio.paginaActual().length).toBe(2);
    servicio.ponerPagina(9); // se queda en la última
    expect(servicio.pagina()).toBe(1);
  });

  it('filtra por nombre sin distinguir mayúsculas y vuelve a la primera página', () => {
    servicio.ponerPagina(1);
    servicio.filtrar('TANES');
    expect(servicio.pagina()).toBe(0);
    expect(servicio.filtrados().map((e) => e.id)).toEqual([1]);
  });

  it('al recargar conserva el filtro y ajusta la página si ya no existe', () => {
    servicio.ponerPagina(1);
    servicio.cargar().subscribe();
    http.expectOne('/api/embalses').flush(DATOS.slice(0, 3));
    expect(servicio.pagina()).toBe(0);
  });
});
