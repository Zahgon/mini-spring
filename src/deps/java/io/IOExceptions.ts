import { JavaThrowable } from '../lang/Exceptions.js';

export class IOException extends JavaThrowable {}

export class FileNotFoundException extends IOException {}

export class NoSuchFileException extends IOException {}
