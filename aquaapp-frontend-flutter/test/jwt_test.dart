import 'package:aquaapp_frontend/servicios/jwt.dart';
import 'package:flutter_test/flutter_test.dart';

import 'ayudas.dart';

void main() {
  group('Jwt', () {
    test('lee el usuario del claim sub', () {
      expect(Jwt.usuario(crearJwt(usuario: 'admin')), 'admin');
    });

    test('un token mal formado no tiene usuario y cuenta como caducado', () {
      expect(Jwt.usuario('esto-no-es-un-jwt'), isNull);
      expect(Jwt.expirado('esto-no-es-un-jwt'), isTrue);
      expect(Jwt.expirado('a.%%%.c'), isTrue);
    });

    test('expira según el claim exp (segundos Unix)', () {
      final exp = DateTime.utc(2030, 1, 1);
      final token = crearJwt(usuario: 'ana', exp: exp);
      expect(Jwt.expirado(token, ahora: exp.subtract(const Duration(seconds: 1))),
          isFalse);
      expect(Jwt.expirado(token, ahora: exp), isTrue);
      expect(Jwt.expirado(token, ahora: exp.add(const Duration(days: 1))), isTrue);
    });

    test('un token sin exp se considera vigente', () {
      expect(Jwt.expirado(crearJwt(usuario: 'ana', sinExp: true)), isFalse);
    });
  });
}
