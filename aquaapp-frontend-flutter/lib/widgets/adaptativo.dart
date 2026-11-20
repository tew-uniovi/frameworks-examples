import 'package:flutter/widgets.dart';

/// Clases de tamaño de ventana de Material 3 (en dp lógicos).
class Pantalla {
  const Pantalla._();

  /// Compacta (móvil): menos de 600.
  static bool esCompacta(BuildContext context) =>
      MediaQuery.sizeOf(context).width < 600;

  /// Expandida (escritorio): 840 o más. Aquí el panel de indicadores va a un lado.
  static bool esExpandida(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= 840;
}
