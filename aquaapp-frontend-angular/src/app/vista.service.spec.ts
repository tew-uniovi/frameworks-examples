import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { VistaService } from './vista.service';

describe('VistaService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  it('el aviso de un 403 lleva data-testid="aviso" (lo usan las pruebas de sistema)', async () => {
    const vista = TestBed.inject(VistaService);
    vista.tratarError(new HttpErrorResponse({ status: 403 }));
    await new Promise((r) => setTimeout(r, 300));
    expect(document.querySelector('[data-testid="aviso"]')).not.toBeNull();
  });
});
