import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import '../app.dart';

/// Logo original de aquaapp (SVG) para la barra de aplicación.
///
/// `flutter_svg` no pinta el elemento `<text>`, así que el activo es el mismo
/// logo con el rótulo «Aquaapp» convertido a trazados (ver README).
class LogoAquaapp extends StatelessWidget {
  const LogoAquaapp({super.key, this.alto = 40});

  final double alto;

  @override
  Widget build(BuildContext context) {
    final logo = SvgPicture.asset(
      'assets/aquaapp-logo-horizontal.svg',
      height: alto,
      semanticsLabel: 'aquaapp',
    );
    if (Theme.of(context).brightness == Brightness.light) return logo;

    // El logo es azul oscuro: en el tema oscuro se pinta sobre la superficie
    // clara de la misma paleta para que se lea.
    final clara = ColorScheme.fromSeed(seedColor: AplicacionAquaapp.azulLogo);
    return DecoratedBox(
      decoration: BoxDecoration(
        color: clara.surface,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Padding(padding: const EdgeInsets.symmetric(horizontal: 8), child: logo),
    );
  }
}
