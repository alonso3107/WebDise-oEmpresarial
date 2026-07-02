"""Errores independientes del framework web."""


class ErrorAplicacion(Exception):
    """Error esperado que puede presentarse al cliente de la aplicación."""

    codigo_http = 400


class RecursoNoEncontrado(ErrorAplicacion):
    codigo_http = 404


class ReglaNegocioInvalida(ErrorAplicacion):
    codigo_http = 400

