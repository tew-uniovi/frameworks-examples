import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Logo original de aquaapp (SVG) para la barra de aplicación.
///
/// `flutter_svg` no pinta el elemento `<text>`, así que el activo es el mismo
/// logo con el rótulo «Aquaapp» convertido a trazados (ver README).
class LogoAquaapp extends StatelessWidget {
  const LogoAquaapp({super.key, this.alto = 40});

  final double alto;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/aquaapp-logo-horizontal.svg',
      height: alto,
      semanticsLabel: 'aquaapp',
    );
  }
}
