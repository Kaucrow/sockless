export class MethodExecutionError extends Error {
  constructor(name: 'TxNotFound' | 'PermissionDenied') {
    super(name);
  }
}