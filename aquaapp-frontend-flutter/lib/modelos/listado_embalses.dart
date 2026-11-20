import 'dart:math';

import 'embalse.dart';

/// Lógica pura del listado: filtro por nombre, paginación e indicadores.
/// No depende de Flutter, así que se prueba con tests unitarios.
class ListadoEmbalses {
  const ListadoEmbalses._();

  static const int porPagina = 5;

  /// Embalses cuyo nombre contiene [filtro] (sin distinguir mayúsculas).
  static List<Embalse> filtrar(List<Embalse> todos, String filtro) {
    final texto = filtro.toLowerCase();
    return todos
        .where((e) => e.nombre.toLowerCase().contains(texto))
        .toList(growable: false);
  }

  /// Número de páginas (siempre al menos 1, para mostrar «Página 1 de 1»).
  static int totalPaginas(int total) => max(1, (total / porPagina).ceil());

  /// Página [pagina] (empezando en 0), acotada a la última existente.
  static List<Embalse> pagina(List<Embalse> filtrados, int pagina) {
    final ultima = totalPaginas(filtrados.length) - 1;
    final inicio = min(max(pagina, 0), ultima) * porPagina;
    return filtrados.skip(inicio).take(porPagina).toList(growable: false);
  }

  /// Nivel medio (hm³) de todos los embalses; 0 si no hay ninguno.
  static double nivelMedio(List<Embalse> todos) => todos.isEmpty
      ? 0
      : todos.fold<double>(0, (suma, e) => suma + e.nivelActualHm3) /
          todos.length;
}
