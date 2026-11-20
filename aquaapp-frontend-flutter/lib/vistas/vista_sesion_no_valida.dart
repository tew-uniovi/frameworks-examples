import 'package:flutter/material.dart';

import '../app.dart';
import 'dialogo_auth.dart';

/// Se muestra tras un 401 inesperado (sesión caducada o rechazada).
class VistaSesionNoValida extends StatelessWidget {
  const VistaSesionNoValida({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    return Semantics(
      identifier: 'sesion-no-valida',
      container: true,
      child: Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420),
        child: Card(
          margin: const EdgeInsets.only(top: 32),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Icon(Icons.lock_clock, size: 48, color: tema.colorScheme.error),
                const SizedBox(height: 12),
                Text(
                  estado.t('login.sesionNoValidaTitle'),
                  style: tema.textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  estado.t('login.sesionNoValida'),
                  textAlign: TextAlign.center,
                  style: tema.textTheme.bodyLarge
                      ?.copyWith(color: tema.colorScheme.onSurfaceVariant),
                ),
                const SizedBox(height: 20),
                FilledButton.icon(
                  key: const Key('boton-ir-al-login'),
                  onPressed: () => mostrarDialogoAuth(context, ModoAuth.login),
                  icon: const Icon(Icons.login),
                  label: Text(estado.t('login.irAlLogin')),
                ),
              ],
            ),
          ),
        ),
      ),
    ));
  }
}
