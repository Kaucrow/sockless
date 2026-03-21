export class MethodExecutionError extends Error {
  constructor(name: 'TxNotFound' | 'PermissionDenied' | 'PrivateOnly') {
    super();
    this.name = name;
  }
}