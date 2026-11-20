import 'dart:convert';

import 'package:aquaapp_frontend/i18n/traducciones.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUpAll(() async {
    await initializeDateFormatting('es');
    await initializeDateFormatting('en');
  });

  group('Traducciones', () {
    test('es y en tienen exactamente las mismas claves', () async {
      Future<Set<String>> claves(String idioma) async {
        final json = await rootBundle.loadString('assets/i18n/$idioma.json');
        return (jsonDecode(json) as Map<String, dynamic>).keys.toSet();
      }

      expect(await claves('en'), await claves('es'));
    });

    test('t() devuelve el texto del idioma o, si falta, la propia clave', () async {
      final es = await Traducciones.cargar('es');
      final en = await Traducciones.cargar('en');
      expect(es.t('nav.listado'), 'Listado');
      expect(en.t('nav.listado'), 'List');
      expect(es.t('clave.inexistente'), 'clave.inexistente');
    });

    test('formatea números según el idioma', () async {
      final es = await Traducciones.cargar('es');
      final en = await Traducciones.cargar('en');
      expect(es.numero(1234.5), '1234,5');
      expect(en.numero(1234.5), '1,234.5');
      expect(es.numero(33.3), '33,3');
    });

    test('formatea fechas según el idioma', () async {
      final es = await Traducciones.cargar('es');
      final en = await Traducciones.cargar('en');
      final fecha = DateTime(2026, 11, 20, 17, 5);
      expect(es.fecha(fecha), '20/11/2026 17:05');
      expect(en.fecha(fecha), '11/20/2026 17:05');
    });

    test('el idioma por defecto sale del navegador', () {
      expect(idiomaPorDefecto('en-US'), 'en');
      expect(idiomaPorDefecto('EN'), 'en');
      expect(idiomaPorDefecto('es-ES'), 'es');
      expect(idiomaPorDefecto('fr-FR'), 'es');
      expect(idiomaPorDefecto(null), 'es');
    });
  });
}
