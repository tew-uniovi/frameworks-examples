import 'package:aquaapp_frontend/modelos/embalse.dart';
import 'package:aquaapp_frontend/modelos/listado_embalses.dart';
import 'package:flutter_test/flutter_test.dart';

import 'ayudas.dart';

void main() {
  group('ListadoEmbalses', () {
    test('filtra por nombre sin distinguir mayúsculas', () {
      final todos = [
        const Embalse(nombre: 'Embalse de Tanes', capacidadHm3: 1, nivelActualHm3: 1),
        const Embalse(nombre: 'Embalse de Rioseco', capacidadHm3: 1, nivelActualHm3: 1),
      ];
      expect(ListadoEmbalses.filtrar(todos, 'TANES').single.nombre, 'Embalse de Tanes');
      expect(ListadoEmbalses.filtrar(todos, 'embalse'), hasLength(2));
      expect(ListadoEmbalses.filtrar(todos, 'zzz'), isEmpty);
      expect(ListadoEmbalses.filtrar(todos, ''), hasLength(2));
    });

    test('pagina de 5 en 5', () {
      final todos = embalsesDePrueba(12);
      expect(ListadoEmbalses.totalPaginas(12), 3);
      expect(ListadoEmbalses.pagina(todos, 0).map((e) => e.id), [1, 2, 3, 4, 5]);
      expect(ListadoEmbalses.pagina(todos, 2).map((e) => e.id), [11, 12]);
    });

    test('siempre hay al menos una página y la página se acota', () {
      expect(ListadoEmbalses.totalPaginas(0), 1);
      expect(ListadoEmbalses.totalPaginas(5), 1);
      expect(ListadoEmbalses.totalPaginas(6), 2);
      expect(ListadoEmbalses.pagina(const [], 3), isEmpty);
      expect(ListadoEmbalses.pagina(embalsesDePrueba(7), 9).map((e) => e.id), [6, 7]);
    });

    test('nivel medio de todos los embalses (0 si no hay)', () {
      expect(ListadoEmbalses.nivelMedio(const []), 0);
      expect(ListadoEmbalses.nivelMedio(embalsesDePrueba(3)), 20); // (10+20+30)/3
    });
  });

  group('Embalse', () {
    test('ida y vuelta JSON; el id puede faltar', () {
      final e = Embalse.fromJson({
        'id': 3,
        'nombre': 'Tanes',
        'capacidadHm3': 33, // la API puede mandar enteros
        'nivelActualHm3': 21.7,
      });
      expect(e.id, 3);
      expect(e.capacidadHm3, 33.0);
      expect(e.toJson(), {
        'id': 3,
        'nombre': 'Tanes',
        'capacidadHm3': 33.0,
        'nivelActualHm3': 21.7,
      });
      expect(
        Embalse.fromJson({'nombre': 'X', 'capacidadHm3': 1, 'nivelActualHm3': 1}).id,
        isNull,
      );
    });
  });
}
