import 'package:flutter/material.dart';

import '../app.dart';

/// Pie de página (`footer`).
class PiePagina extends StatelessWidget {
  const PiePagina({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    return Semantics(
      identifier: 'pie',
      container: true,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        child: Center(
          child: Text(
            estado.t('footer'),
            style: tema.textTheme.bodyMedium
                ?.copyWith(color: tema.colorScheme.onSurfaceVariant),
          ),
        ),
      ),
    );
  }
}
