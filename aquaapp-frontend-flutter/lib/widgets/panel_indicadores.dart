import 'package:flutter/material.dart';

import '../app.dart';

/// Panel informativo (`aside`): nº de embalses y nivel medio de TODOS ellos.
class PanelIndicadores extends StatelessWidget {
  const PanelIndicadores({super.key});

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    return Semantics(
      identifier: 'panel-indicadores',
      container: true,
      child: Card(
        color: tema.colorScheme.secondaryContainer,
        elevation: 0,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.water_drop_outlined),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      '${estado.embalses.length} ${estado.t('panel.embalses')}',
                      style: tema.textTheme.titleMedium,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.show_chart),
                  const SizedBox(width: 12),
                  Flexible(
                    child: Text(
                      '${estado.t('panel.nivelMedio')}: '
                      '${estado.i18n.numero(estado.nivelMedio)} hm³',
                      style: tema.textTheme.titleMedium,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
