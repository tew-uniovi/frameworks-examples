import 'package:flutter/material.dart';

import '../app.dart';

enum ModoAuth { login, registro }

/// Abre el diálogo modal compartido por login y registro.
Future<void> mostrarDialogoAuth(BuildContext context, ModoAuth modo) {
  // Mientras el diálogo no esté pintado, la señal `data-listo` no se activa.
  AppScope.leer(context).ocupar();
  return showDialog<void>(
    context: context,
    builder: (_) => DialogoAuth(modoInicial: modo),
  );
}

/// Login y registro en un único [AlertDialog]: se alterna entre ambos modos
/// sin cerrarlo. Acciones abajo: «Cancelar» (TextButton) y «Entrar» /
/// «Crear cuenta» (FilledButton).
class DialogoAuth extends StatefulWidget {
  const DialogoAuth({super.key, required this.modoInicial});

  final ModoAuth modoInicial;

  @override
  State<DialogoAuth> createState() => _DialogoAuthState();
}

class _DialogoAuthState extends State<DialogoAuth> {
  final _formulario = GlobalKey<FormState>();
  final _usuario = TextEditingController();
  final _password = TextEditingController();
  final _password2 = TextEditingController();
  late ModoAuth _modo = widget.modoInicial;
  bool _enviando = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Primer fotograma del diálogo pintado: ya se puede marcar la vista como lista.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) AppScope.leer(context).liberar();
    });
  }

  @override
  void dispose() {
    _usuario.dispose();
    _password.dispose();
    _password2.dispose();
    super.dispose();
  }

  void _cambiarModo(ModoAuth modo) {
    final estado = AppScope.leer(context);
    estado.ocupar();
    setState(() {
      _modo = modo;
      _error = null;
      _usuario.clear();
      _password.clear();
      _password2.clear();
    });
    WidgetsBinding.instance.addPostFrameCallback((_) => estado.liberar());
  }

  Future<void> _enviar() async {
    if (_enviando || !_formulario.currentState!.validate()) return;
    final estado = AppScope.leer(context);
    final navegador = Navigator.of(context);
    setState(() {
      _enviando = true;
      _error = null;
    });
    final usuario = _usuario.text.trim();
    final password = _password.text;

    if (_modo == ModoAuth.login) {
      final ok = await estado.login(usuario, password);
      if (!mounted) return;
      if (ok) {
        navegador.pop();
        return;
      }
      setState(() {
        _enviando = false;
        _error = estado.t('login.errorCredenciales');
      });
    } else {
      final ok = await estado.registrar(usuario, password);
      if (!mounted) return;
      setState(() => _enviando = false);
      if (ok) {
        // Cuenta creada: se pasa al login para iniciar sesión con ella.
        _cambiarModo(ModoAuth.login);
        return;
      }
      setState(() => _error = estado.t('login.errorRegistro'));
    }
  }

  @override
  Widget build(BuildContext context) {
    final estado = AppScope.of(context);
    final tema = Theme.of(context);
    final esLogin = _modo == ModoAuth.login;

    final dialogo = AlertDialog(
      title: Text(esLogin ? estado.t('login.title') : estado.t('login.registroTitle')),
      scrollable: true,
      content: SizedBox(
        width: 360,
        child: Form(
          key: _formulario,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 8),
              _conId('auth-usuario', TextFormField(
                key: const Key('campo-usuario'),
                controller: _usuario,
                autofocus: true,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: estado.t('login.usuario'),
                  prefixIcon: const Icon(Icons.person_outline),
                ),
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? estado.t('validacion.obligatorio')
                    : null,
              )),
              const SizedBox(height: 16),
              _conId('auth-password', TextFormField(
                key: const Key('campo-password'),
                controller: _password,
                obscureText: true,
                textInputAction: esLogin ? TextInputAction.done : TextInputAction.next,
                onFieldSubmitted: esLogin ? (_) => _enviar() : null,
                decoration: InputDecoration(
                  labelText: estado.t('login.password'),
                  prefixIcon: const Icon(Icons.lock_outline),
                ),
                validator: (v) => (v == null || v.isEmpty)
                    ? estado.t('validacion.obligatorio')
                    : null,
              )),
              if (!esLogin) ...[
                const SizedBox(height: 16),
                _conId('auth-password2', TextFormField(
                  key: const Key('campo-password2'),
                  controller: _password2,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _enviar(),
                  decoration: InputDecoration(
                    labelText: estado.t('login.password2'),
                    prefixIcon: const Icon(Icons.lock_reset),
                  ),
                  // «Las contraseñas no coinciden» también es un error de la pantalla
                  // de autenticación: se identifica como `auth-error`.
                  errorBuilder: (context, texto) => texto ==
                          estado.t('login.passwordsNoCoinciden')
                      ? Semantics(identifier: 'auth-error', child: Text(texto))
                      : Text(texto),
                  validator: (v) {
                    if (v == null || v.isEmpty) return estado.t('validacion.obligatorio');
                    return v != _password.text ? estado.t('login.passwordsNoCoinciden') : null;
                  },
                )),
              ],
              if (_error != null) ...[
                const SizedBox(height: 12),
                Semantics(
                  liveRegion: true,
                  identifier: 'auth-error',
                  child: Text(
                    _error!,
                    style: tema.textTheme.bodyMedium?.copyWith(color: tema.colorScheme.error),
                  ),
                ),
              ],
              const SizedBox(height: 8),
              Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    esLogin ? estado.t('login.noTienesCuenta') : estado.t('login.yaTienesCuenta'),
                    style: tema.textTheme.bodyMedium
                        ?.copyWith(color: tema.colorScheme.onSurfaceVariant),
                  ),
                  _conId('auth-cambiar', TextButton(
                    onPressed: _enviando
                        ? null
                        : () => _cambiarModo(esLogin ? ModoAuth.registro : ModoAuth.login),
                    child: Text(esLogin ? estado.t('login.registrate') : estado.t('login.iniciaSesion')),
                  )),
                ],
              ),
            ],
          ),
        ),
      ),
      actions: [
        _conId('auth-cancelar', TextButton(
          key: const Key('boton-cancelar-auth'),
          onPressed: () => Navigator.of(context).pop(),
          child: Text(estado.t('comun.cancelar')),
        )),
        _conId('auth-enviar', FilledButton(
          key: const Key('boton-enviar-auth'),
          onPressed: _enviando ? null : _enviar,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_enviando) ...[
                SizedBox.square(
                  dimension: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    semanticsLabel: estado.t('comun.cargando'),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              Text(esLogin ? estado.t('login.entrar') : estado.t('login.crearCuenta')),
            ],
          ),
        )),
      ],
    );
    // Identificador estable del contenedor del diálogo (lo usan las pruebas E2E).
    return Semantics(identifier: 'auth-dialogo', container: true, child: dialogo);
  }

  /// Identificador de prueba: en Flutter Web se vuelca al DOM de semántica
  /// como atributo `flt-semantics-identifier`.
  Widget _conId(String identificador, Widget hijo) =>
      Semantics(identifier: identificador, child: hijo);
}
