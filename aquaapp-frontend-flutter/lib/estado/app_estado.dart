import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;

import '../i18n/traducciones.dart';
import '../modelos/embalse.dart';
import '../modelos/listado_embalses.dart';
import '../servicios/almacen.dart';
import '../servicios/auth_api.dart';
import '../servicios/embalses_api.dart';
import '../servicios/errores_api.dart';
import '../servicios/indicador_listo.dart';
import '../servicios/jwt.dart';

/// Qué ocupa el cuerpo (`main`) de la página.
enum Vista { vacia, listado, formulario, sesionNoValida }

/// Resultado de una operación contra la API, para que la vista decida el aviso.
enum Resultado { ok, sinPermiso, noAutorizado, error }

const String claveJwt = 'jwt';
const String claveIdioma = 'idioma';

/// Estado de toda la aplicación: vista actual, sesión, idioma y embalses.
/// Es un [ChangeNotifier]: los widgets lo leen con `AppScope.of(context)`.
class AppEstado extends ChangeNotifier {
  AppEstado({
    required http.Client cliente,
    required Almacen almacenSesion,
    required Almacen almacenLocal,
    required Traducciones traducciones,
    IndicadorListo indicador = const IndicadorNulo(),
    Uri? base,
  })  : _almacenSesion = almacenSesion,
        _almacenLocal = almacenLocal,
        _indicador = indicador,
        i18n = traducciones {
    _auth = AuthApi(cliente, base: base);
    _api = EmbalsesApi(cliente, () => token, base: base);
  }

  /// Crea el estado cargando antes el idioma (guardado o el del navegador).
  static Future<AppEstado> iniciar({
    required http.Client cliente,
    required Almacen almacenSesion,
    required Almacen almacenLocal,
    String? idiomaNavegador,
    IndicadorListo indicador = const IndicadorNulo(),
    Uri? base,
  }) async {
    final guardado = almacenLocal.leer(claveIdioma);
    final idioma = idiomasSoportados.contains(guardado)
        ? guardado!
        : idiomaPorDefecto(idiomaNavegador);
    almacenLocal.escribir(claveIdioma, idioma);
    return AppEstado(
      cliente: cliente,
      almacenSesion: almacenSesion,
      almacenLocal: almacenLocal,
      traducciones: await Traducciones.cargar(idioma),
      indicador: indicador,
      base: base,
    );
  }

  final Almacen _almacenSesion;
  final Almacen _almacenLocal;
  final IndicadorListo _indicador;
  late final AuthApi _auth;
  late final EmbalsesApi _api;

  // --- Idioma -----------------------------------------------------------

  Traducciones i18n;

  /// Atajo para traducir: `estado.t('nav.listado')`.
  String t(String clave) => i18n.t(clave);

  Future<void> cambiarIdioma(String idioma) async {
    if (idioma == i18n.idioma) return;
    i18n = await Traducciones.cargar(idioma);
    _almacenLocal.escribir(claveIdioma, idioma);
    notifyListeners();
  }

  // --- Sesión -----------------------------------------------------------

  String? get token => _almacenSesion.leer(claveJwt);

  bool get hayToken => token != null;

  /// Usuario del claim `sub`, o `null` sin sesión (o con un token ilegible).
  String? get usuario {
    final actual = token;
    return actual == null ? null : Jwt.usuario(actual);
  }

  /// Inicia sesión. `false` si las credenciales no son válidas (o no hay red).
  Future<bool> login(String usuario, String password) async {
    try {
      _almacenSesion.escribir(claveJwt, await _auth.login(usuario, password));
    } on ErrorApi {
      return false;
    }
    notifyListeners();
    // Sin esperar: el diálogo se cierra ya y el listado se carga detrás.
    unawaited(mostrarListado());
    return true;
  }

  /// Crea la cuenta. No inicia sesión: la vista abre después el login.
  Future<bool> registrar(String usuario, String password) async {
    try {
      await _auth.registrar(usuario, password);
      return true;
    } on ErrorApi {
      return false;
    }
  }

  /// Salida voluntaria: sin pantalla de error.
  void cerrarSesion() {
    _limpiarSesion();
    vista = Vista.vacia;
    notifyListeners();
  }

  void _limpiarSesion() {
    _almacenSesion.borrar(claveJwt);
    embalses = const [];
    embalseEnEdicion = null;
  }

  /// 401 inesperado: se descarta la sesión y se muestra «Sesión no válida».
  void _noAutorizado() {
    _limpiarSesion();
    vista = Vista.sesionNoValida;
  }

  // --- Navegación -------------------------------------------------------

  Vista vista = Vista.vacia;

  /// Embalse que se está editando (`null` = alta).
  Embalse? embalseEnEdicion;

  /// Cambia en cada apertura del formulario para que se reinicie.
  int versionFormulario = 0;

  /// Con sesión al arrancar -> listado; sin ella la vista abre el login.
  Future<void> arrancar() async {
    if (hayToken) await mostrarListado();
    liberar();
  }

  void mostrarFormulario([Embalse? embalse]) {
    ocupar();
    embalseEnEdicion = embalse;
    versionFormulario++;
    vista = Vista.formulario;
    liberar();
  }

  // --- Embalses ---------------------------------------------------------

  List<Embalse> embalses = const [];
  String filtro = '';
  int pagina = 0;
  bool cargando = false;
  bool guardando = false;
  DateTime? ultimaActualizacion;

  List<Embalse> get filtrados => ListadoEmbalses.filtrar(embalses, filtro);

  List<Embalse> get paginaActual => ListadoEmbalses.pagina(filtrados, pagina);

  int get totalPaginas => ListadoEmbalses.totalPaginas(filtrados.length);

  /// Página mostrada (acotada: tras borrar puede haber menos páginas).
  int get paginaMostrada => pagina.clamp(0, totalPaginas - 1);

  double get nivelMedio => ListadoEmbalses.nivelMedio(embalses);

  /// Muestra el listado recargándolo de la API. Conserva filtro y página.
  Future<Resultado> mostrarListado() async {
    ocupar();
    vista = Vista.listado;
    cargando = true;
    notifyListeners();
    try {
      embalses = await _api.listar();
      ultimaActualizacion = DateTime.now();
      return Resultado.ok;
    } on NoAutorizado {
      _noAutorizado();
      return Resultado.noAutorizado;
    } on ErrorApi {
      embalses = const [];
      return Resultado.error;
    } finally {
      cargando = false;
      liberar();
    }
  }

  void filtrarPor(String texto) {
    filtro = texto;
    pagina = 0; // el filtro puede dejar menos páginas: se vuelve a la primera
    notifyListeners();
  }

  void irAPagina(int delta) {
    pagina = (paginaMostrada + delta).clamp(0, totalPaginas - 1);
    notifyListeners();
  }

  /// Alta o edición según tenga `id`; después recarga el listado.
  Future<Resultado> guardar(Embalse embalse) {
    return _escribir(() =>
        embalse.id == null ? _api.crear(embalse) : _api.actualizar(embalse));
  }

  Future<Resultado> eliminar(int id) => _escribir(() => _api.eliminar(id));

  Future<Resultado> _escribir(Future<void> Function() operacion) async {
    guardando = true;
    notifyListeners();
    try {
      await operacion();
    } on NoAutorizado {
      _noAutorizado();
      return Resultado.noAutorizado;
    } on Prohibido {
      return Resultado.sinPermiso;
    } on ErrorApi {
      return Resultado.error;
    } finally {
      guardando = false;
      notifyListeners();
    }
    return mostrarListado();
  }

  // --- Señal de «vista pintada» (data-listo) ------------------------------

  int _ocupados = 1; // la propia arrancada, hasta que termine `arrancar()`

  /// Empieza un cambio de vista: quita la señal de «listo».
  void ocupar() {
    _ocupados++;
    _indicador.ocupado();
  }

  /// Termina un cambio de vista: cuando no queda ninguno en curso, la señal se
  /// vuelve a poner tras pintar el siguiente fotograma.
  void liberar() {
    _ocupados--;
    notifyListeners();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_ocupados == 0) _indicador.listo();
    });
    WidgetsBinding.instance.ensureVisualUpdate();
  }
}
