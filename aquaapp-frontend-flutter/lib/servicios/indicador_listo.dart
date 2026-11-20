/// Señal de «vista pintada» para las pruebas de extremo a extremo.
///
/// Flutter Web pinta en un `<canvas>`, así que desde fuera no se puede saber
/// cuándo ha terminado una vista. En la web se implementa con el atributo
/// `data-listo` de `<body>` (ver `navegador_web.dart`).
abstract class IndicadorListo {
  /// Se está cambiando de vista: la pantalla aún no es estable.
  void ocupado();

  /// La vista actual ya se ha pintado.
  void listo();
}

/// No hace nada (tests y plataformas sin DOM).
class IndicadorNulo implements IndicadorListo {
  const IndicadorNulo();

  @override
  void ocupado() {}

  @override
  void listo() {}
}
