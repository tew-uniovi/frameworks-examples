import 'package:flutter/semantics.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;
import 'package:intl/date_symbol_data_local.dart';

import 'app.dart';
import 'estado/app_estado.dart';
import 'i18n/traducciones.dart';
import 'servicios/navegador_web.dart';

// Mantiene encendido el árbol de semántica durante toda la vida de la app.
SemanticsHandle? _semantica;

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Flutter Web pinta en un <canvas>; con la semántica activada además genera
  // un DOM accesible (flt-semantics) que usan lectores de pantalla y Playwright.
  _semantica = SemanticsBinding.instance.ensureSemantics();

  for (final idioma in idiomasSoportados) {
    await initializeDateFormatting(idioma);
  }

  final estado = await AppEstado.iniciar(
    cliente: http.Client(),
    almacenSesion: AlmacenWeb.sesion(),
    almacenLocal: AlmacenWeb.local(),
    idiomaNavegador: idiomaDelNavegador(),
    indicador: const IndicadorListoWeb(),
  );

  runApp(AplicacionAquaapp(estado: estado));
}
